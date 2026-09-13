import sys
from pathlib import Path
from typing import List
import pandas as pd
import yfinance as yf
from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[4]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from src.preprocessing.feature_engineering import engineer_features
from backend.app.ai_engine.clustering import cluster_market_peers
from backend.app.schemas.stock import TickerInfo

router = APIRouter()

COMPARISON_CANDIDATES = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "ITC.NS", "LT.NS", "AAPL", "MSFT", "TSLA"
]

@router.get("/peers")
async def get_peer_clusters():
    metrics_list = []
    
    for symbol in COMPARISON_CANDIDATES:
        try:
            df = yf.download(symbol, period="6m", progress=False, auto_adjust=False)
            if df is None or df.empty:
                continue
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            df = df.dropna(subset=["Close"]).reset_index()
            
            curr_p = float(df["Close"].iloc[-1])
            first_p = float(df["Close"].iloc[0])
            pct_chg = ((curr_p - first_p) / first_p * 100) if first_p else 0.0
            volatility = float(df["Close"].pct_change().dropna().std() * (252 ** 0.5) * 100)
            
            # Simple heuristic score proxy for peer clustering benchmark
            ai_score = int(min(100, max(30, 50 + pct_chg * 0.8)))
            
            metrics_list.append({
                "symbol": symbol,
                "current_price": round(curr_p, 2),
                "period_change_pct": round(pct_chg, 2),
                "volatility_pct": round(volatility, 2),
                "ai_score": ai_score
            })
        except Exception:
            continue

    if not metrics_list:
        raise HTTPException(status_code=500, detail="Could not compute cluster metrics.")

    clustered = cluster_market_peers(metrics_list, n_clusters=3)
    return {"peers": clustered}