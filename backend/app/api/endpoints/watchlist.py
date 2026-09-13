from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import yfinance as yf
import requests

from database.session import get_db
from database.models import User, Watchlist
from backend.app.api.endpoints.auth import get_current_user
from backend.app.api.endpoints.analysis import COMPANY_NAMES, CUSTOM_SESSION

router = APIRouter()

class WatchlistCreate(BaseModel):
    symbol: str
    name: Optional[str] = None

class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    name: str

    class Config:
        from_attributes = True

def resolve_ticker_name(symbol: str, input_name: Optional[str] = None) -> str:
    """Ensure a non-null company name is always returned."""
    if input_name and input_name.strip():
        return input_name.strip()
    
    clean_sym = symbol.strip().upper()
    if clean_sym in COMPANY_NAMES:
        return COMPANY_NAMES[clean_sym]
    
    try:
        t = yf.Ticker(clean_sym, session=CUSTOM_SESSION)
        info = t.info
        name = info.get("longName") or info.get("shortName")
        if name:
            return name
    except Exception:
        pass
        
    return clean_sym

@router.get("/", response_model=List[WatchlistResponse])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()

@router.post("/", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol = item.symbol.strip().upper()
    
    # Check if ticker already exists for user
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == symbol
    ).first()
    if existing:
        return existing

    # Automatically resolve company name to guarantee a non-null value
    resolved_name = resolve_ticker_name(symbol, item.name)

    new_item = Watchlist(
        user_id=current_user.id,
        symbol=symbol,
        name=resolved_name
    )
    
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to add to watchlist: {str(e)}")

@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")

    db.delete(item)
    db.commit()
    return None