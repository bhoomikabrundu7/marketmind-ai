from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import yfinance as yf
import requests

from database.session import get_db
from database.models import User, PortfolioPosition
from backend.app.schemas.portfolio import PortfolioCreate, PortfolioResponse
from backend.app.api.endpoints.auth import get_current_user

router = APIRouter()

CUSTOM_SESSION = requests.Session()
CUSTOM_SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
})

def get_live_price(symbol: str) -> float:
    try:
        ticker = yf.Ticker(symbol, session=CUSTOM_SESSION)
        hist = ticker.history(period="1d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1])
    except Exception:
        pass
    return 0.0

@router.get("/", response_model=List[PortfolioResponse])
def get_user_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all portfolio positions for the authenticated user with live P&L recalculation."""
    positions = db.query(PortfolioPosition).filter(PortfolioPosition.user_id == current_user.id).order_by(PortfolioPosition.created_at.desc()).all()
    
    response_list = []
    for pos in positions:
        curr_price = get_live_price(pos.symbol)
        if curr_price == 0.0:
            curr_price = pos.avg_price

        total_val = pos.shares * curr_price
        total_cost = pos.shares * pos.avg_price
        pnl = total_val - total_cost
        pnl_pct = (pnl / total_cost * 100) if total_cost > 0 else 0.0

        response_list.append(PortfolioResponse(
            id=pos.id,
            symbol=pos.symbol,
            name=pos.name,
            shares=pos.shares,
            avg_price=pos.avg_price,
            current_price=round(curr_price, 2),
            total_value=round(total_val, 2),
            pnl=round(pnl, 2),
            pnl_pct=round(pnl_pct, 2),
            created_at=pos.created_at
        ))
    return response_list

@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def add_portfolio_position(
    item: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a new position to SQLite database under current user."""
    new_position = PortfolioPosition(
        user_id=current_user.id,
        symbol=item.symbol.upper(),
        name=item.name,
        shares=item.shares,
        avg_price=item.avg_price
    )
    db.add(new_position)
    db.commit()
    db.refresh(new_position)

    curr_price = get_live_price(new_position.symbol)
    if curr_price == 0.0:
        curr_price = new_position.avg_price

    total_val = new_position.shares * curr_price
    total_cost = new_position.shares * new_position.avg_price
    pnl = total_val - total_cost
    pnl_pct = (pnl / total_cost * 100) if total_cost > 0 else 0.0

    return PortfolioResponse(
        id=new_position.id,
        symbol=new_position.symbol,
        name=new_position.name,
        shares=new_position.shares,
        avg_price=new_position.avg_price,
        current_price=round(curr_price, 2),
        total_value=round(total_val, 2),
        pnl=round(pnl, 2),
        pnl_pct=round(pnl_pct, 2),
        created_at=new_position.created_at
    )

@router.delete("/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_position(
    position_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a position from database."""
    pos = db.query(PortfolioPosition).filter(
        PortfolioPosition.id == position_id,
        PortfolioPosition.user_id == current_user.id
    ).first()

    if not pos:
        raise HTTPException(status_code=404, detail="Position not found.")

    db.delete(pos)
    db.commit()
    return None