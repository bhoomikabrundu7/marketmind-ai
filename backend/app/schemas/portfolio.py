from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PortfolioCreate(BaseModel):
    symbol: str
    name: str
    shares: float
    avg_price: float

class PortfolioResponse(BaseModel):
    id: int
    symbol: str
    name: str
    shares: float
    avg_price: float
    current_price: float
    total_value: float
    pnl: float
    pnl_pct: float
    created_at: datetime

    class Config:
        from_attributes = True