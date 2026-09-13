import sys
import time
from pathlib import Path
from datetime import date, timedelta
from typing import List, Dict, Tuple
import pandas as pd
import yfinance as yf
import requests
from fastapi import APIRouter, HTTPException, Query

ROOT_DIR = Path(__file__).resolve().parents[4]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from src.preprocessing.feature_engineering import engineer_features
from src.sentiment.news_loader import load_stock_news
from src.sentiment.news_cleaning import clean_news_data
from src.sentiment.sentiment_analyzer import add_sentiment_scores, get_sentiment_summary
from src.models.ml_pipeline import prepare_ml_data, train_random_forest, create_prediction_dataframe

from backend.app.ai_engine.anomaly_detector import detect_market_anomalies
from backend.app.ai_engine.explainability import calculate_shap_contributions
from backend.app.schemas.stock import (
    AnalysisResponse, MarketOverview, IndicatorSummary,
    SentimentSummarySchema, NewsArticle, PriceSeriesPoint, FeatureImportanceItem
)

router = APIRouter()

CUSTOM_SESSION = requests.Session()
CUSTOM_SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
})

RESPONSE_CACHE: Dict[str, Tuple[AnalysisResponse, float]] = {}
CACHE_TTL_SECONDS = 300

TICKER_ALIASES = {
    "GOOGLE": "GOOGL",
    "NVIDIA": "NVDA",
    "AMAZON": "AMZN",
    "MICROSOFT": "MSFT",
    "APPLE": "AAPL",
    "TESLA": "TSLA",
    "META": "META",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "INFOSYS": "INFY.NS",
    "HDFC": "HDFCBANK.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICI": "ICICIBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "EICHER": "EICHERMOT.NS",
    "EICHERMOTORS": "EICHERMOT.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "SBIN": "SBIN.NS",
    "ITC": "ITC.NS",
    "WIPRO": "WIPRO.NS",
}

# Complete Map of Ticker Symbols -> Full Company Names
COMPANY_NAMES = {
    "RELIANCE.NS": "Reliance Industries Ltd.",
    "TCS.NS": "Tata Consultancy Services Ltd.",
    "INFY.NS": "Infosys Limited",
    "HDFCBANK.NS": "HDFC Bank Ltd.",
    "ICICIBANK.NS": "ICICI Bank Ltd.",
    "SBIN.NS": "State Bank of India",
    "BHARTIARTL.NS": "Bharti Airtel Ltd.",
    "ITC.NS": "ITC Limited",
    "HINDUNILVR.NS": "Hindustan Unilever Ltd.",
    "BAJFINANCE.NS": "Bajaj Finance Ltd.",
    "LICI.NS": "Life Insurance Corporation of India",
    "LT.NS": "Larsen & Toubro Ltd.",
    "TATAMOTORS.NS": "Tata Motors Ltd.",
    "TATASTEEL.NS": "Tata Steel Ltd.",
    "HCLTECH.NS": "HCL Technologies Ltd.",
    "WIPRO.NS": "Wipro Limited",
    "TECHM.NS": "Tech Mahindra Ltd.",
    "AXISBANK.NS": "Axis Bank Ltd.",
    "KOTAKBANK.NS": "Kotak Mahindra Bank Ltd.",
    "INDUSINDBK.NS": "IndusInd Bank Ltd.",
    "ADANIENT.NS": "Adani Enterprises Ltd.",
    "ADANIPORTS.NS": "Adani Ports and SEZ Ltd.",
    "ASIANPAINT.NS": "Asian Paints Ltd.",
    "MARUTI.NS": "Maruti Suzuki India Ltd.",
    "SUNPHARMA.NS": "Sun Pharmaceutical Industries Ltd.",
    "TITAN.NS": "Titan Company Ltd.",
    "ULTRACEMCO.NS": "UltraTech Cement Ltd.",
    "NTPC.NS": "NTPC Limited",
    "POWERGRID.NS": "Power Grid Corporation of India",
    "COALINDIA.NS": "Coal India Ltd.",
    "ONGC.NS": "Oil & Natural Gas Corporation",
    "BEL.NS": "Bharat Electronics Ltd.",
    "BPCL.NS": "Bharat Petroleum Corporation Ltd.",
    "EICHERMOT.NS": "Eicher Motors Ltd.",
    "BAJAJ-AUTO.NS": "Bajaj Auto Ltd.",
    "BAJAJFINSV.NS": "Bajaj Finserv Ltd.",
    "BRITANNIA.NS": "Britannia Industries Ltd.",
    "CIPLA.NS": "Cipla Ltd.",
    "DRREDDY.NS": "Dr. Reddy's Laboratories Ltd.",
    "APOLLOHOSP.NS": "Apollo Hospitals Enterprise Ltd.",
    "ADANIPOWER.NS": "Adani Power Ltd.",
    "TATACONSUM.NS": "Tata Consumer Products Ltd.",
    "TATAPOWER.NS": "Tata Power Company Ltd.",
    "IOC.NS": "Indian Oil Corporation Ltd.",
    "HINDALCO.NS": "Hindalco Industries Ltd.",
    "JSWSTEEL.NS": "JSW Steel Ltd.",
    "SHRIRAMFIN.NS": "Shriram Finance Ltd.",
    "SBILIFE.NS": "SBI Life Insurance Company Ltd.",
    "HDFCLIFE.NS": "HDFC Life Insurance Company Ltd.",
    "DIVISLAB.NS": "Divi's Laboratories Ltd.",
    "TRENT.NS": "Trent Ltd.",
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "TSLA": "Tesla Inc.",
    "NVDA": "NVIDIA Corporation",
    "AMZN": "Amazon.com Inc.",
    "GOOGL": "Alphabet Inc. (Google)",
    "GOOG": "Alphabet Inc. (Google)",
    "META": "Meta Platforms Inc.",
}

def normalize_ticker(symbol: str) -> str:
    clean = symbol.strip().upper()
    return TICKER_ALIASES.get(clean, clean)

def resolve_company_name(symbol: str) -> str:
    if symbol in COMPANY_NAMES:
        return COMPANY_NAMES[symbol]
    
    try:
        info = yf.Ticker(symbol, session=CUSTOM_SESSION).info
        return info.get("longName") or info.get("shortName") or symbol
    except Exception:
        return symbol

def fetch_and_clean_data(symbol: str, days: int = 365) -> pd.DataFrame:
    try:
        ticker_obj = yf.Ticker(symbol, session=CUSTOM_SESSION)
        period_str = f"{days}d" if days <= 730 else "max"
        df = ticker_obj.history(period=period_str, auto_adjust=False)

        if df is None or df.empty:
            end_d = date.today()
            start_d = end_d - timedelta(days=days)
            df = yf.download(
                symbol, 
                start=str(start_d), 
                end=str(end_d + timedelta(days=1)), 
                progress=False, 
                auto_adjust=False,
                session=CUSTOM_SESSION
            )

        if df is None or df.empty:
            print(f"[MarketMind Data Warning] No data returned for symbol: {symbol}")
            return pd.DataFrame()

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df = df.reset_index()
        df = df.loc[:, ~df.columns.duplicated()]

        if "Date" not in df.columns and "Datetime" in df.columns:
            df = df.rename(columns={"Datetime": "Date"})

        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        if df["Date"].dt.tz is not None:
            df["Date"] = df["Date"].dt.tz_localize(None)

        required_cols = ["Open", "High", "Low", "Close"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return pd.DataFrame()

        return df.dropna(subset=required_cols).sort_values("Date").reset_index(drop=True)

    except Exception as e:
        print(f"[MarketMind Data Failure] Exception fetching data for {symbol}: {str(e)}")
        return pd.DataFrame()

def risk_from_volatility(volatility: float) -> Tuple[str, float]:
    if volatility < 15: return "Low", 18.0
    if volatility < 25: return "Moderate", 40.0
    if volatility < 35: return "Moderately High", 62.0
    if volatility < 50: return "High", 82.0
    return "Very High", 94.0

def recommendation_score(df: pd.DataFrame, predicted: float = None, sentiment_score: float = 0) -> Tuple[str, str, int, str]:
    if df.empty:
        return "Neutral", "neutral", 50, "Insufficient market data."
    score = 50
    reasons = []
    current = float(df["Close"].iloc[-1])
    if predicted is not None and current:
        pct = (predicted - current) / current * 100
        score += 18 if pct >= 2 else 9 if pct >= 0.5 else -18 if pct <= -2 else -9 if pct <= -0.5 else 0
        reasons.append(f"Model forecast delta: {pct:+.1f}%")
    if "RSI" in df.columns and not df["RSI"].dropna().empty:
        rsi = float(df["RSI"].dropna().iloc[-1])
        if 45 <= rsi <= 65: score += 7; reasons.append("RSI constructive")
        elif rsi < 30: score += 5; reasons.append("RSI oversold")
        elif rsi > 70: score -= 6; reasons.append("RSI overbought")
    if "MACD" in df.columns and "MACD_Signal" in df.columns:
        m = df[["MACD", "MACD_Signal"]].dropna()
        if not m.empty and float(m["MACD"].iloc[-1]) > float(m["MACD_Signal"].iloc[-1]):
            score += 6; reasons.append("MACD bullish crossover")
        else:
            score -= 6; reasons.append("MACD neutral/bearish")
    if sentiment_score > 0.10: score += 5; reasons.append("Positive news sentiment")
    elif sentiment_score < -0.10: score -= 5; reasons.append("Negative news sentiment")
    
    score = max(0, min(100, score))
    if score >= 70: return "Positive", "positive", score, "; ".join(reasons[:3])
    if score >= 55: return "Constructive", "positive", score, "; ".join(reasons[:3])
    if score <= 35: return "Cautious", "negative", score, "; ".join(reasons[:3])
    return "Neutral", "neutral", score, "; ".join(reasons[:3]) or "Balanced technical signals."

@router.get("/analyze/{symbol}", response_model=AnalysisResponse)
async def analyze_stock(symbol: str, days: int = Query(default=365, ge=30, le=1825)):
    ticker = normalize_ticker(symbol)
    cache_key = f"{ticker}_{days}"
    now = time.time()

    if cache_key in RESPONSE_CACHE:
        cached_data, cached_time = RESPONSE_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    df = fetch_and_clean_data(ticker, days=days)
    if df.empty:
        raise HTTPException(
            status_code=404, 
            detail=f"Market data for symbol '{symbol}' (resolved as '{ticker}') could not be retrieved."
        )
    
    df = engineer_features(df)
    df = detect_market_anomalies(df)
    
    latest_predicted = None
    explainability_items = []
    try:
        ml_data = prepare_ml_data(df)
        ml_result = train_random_forest(ml_data)
        prediction_df = create_prediction_dataframe(ml_result)
        if not prediction_df.empty:
            latest_predicted = float(prediction_df["Predicted"].iloc[-1])
        
        shap_data = calculate_shap_contributions(ml_result.get("model"), ml_result.get("X_test"))
        explainability_items = [FeatureImportanceItem(**item) for item in shap_data[:6]]
    except Exception:
        pass

    news_articles = []
    summary_dict = {"overall_sentiment": "Neutral", "average_score": 0.0, "positive_count": 0, "neutral_count": 0, "negative_count": 0, "total_articles": 0}
    try:
        raw_news = load_stock_news(ticker, limit=10)
        cleaned_news = clean_news_data(raw_news)
        news_df = add_sentiment_scores(cleaned_news)
        if not news_df.empty:
            summary_dict = get_sentiment_summary(news_df)
            for _, r in news_df.head(6).iterrows():
                pub = str(r["published"]) if pd.notna(r["published"]) else None
                news_articles.append(NewsArticle(
                    title=str(r.get("title", "")),
                    publisher=str(r.get("publisher", "Unknown")),
                    published=pub,
                    link=str(r.get("link", "")),
                    image=str(r.get("image", "")),
                    sentiment=str(r.get("sentiment", "Neutral")),
                    sentiment_score=float(r.get("sentiment_score", 0.0))
                ))
    except Exception:
        pass

    curr_p = float(df["Close"].iloc[-1])
    first_p = float(df["Close"].iloc[0])
    pct_chg = ((curr_p - first_p) / first_p * 100) if first_p else 0.0
    volatility = float(df["Close"].pct_change().dropna().std() * (252 ** 0.5) * 100)
    risk_lbl, risk_score = risk_from_volatility(volatility)
    
    signal, signal_cls, score, reason = recommendation_score(df, latest_predicted, summary_dict["average_score"])

    rsi_val = float(df["RSI"].dropna().iloc[-1]) if "RSI" in df.columns and not df["RSI"].dropna().empty else None
    macd_val = float(df["MACD"].dropna().iloc[-1]) if "MACD" in df.columns and not df["MACD"].dropna().empty else None
    macd_sig = float(df["MACD_Signal"].dropna().iloc[-1]) if "MACD_Signal" in df.columns and not df["MACD_Signal"].dropna().empty else None

    price_history = []
    for _, row in df.iterrows():
        price_history.append(PriceSeriesPoint(
            date=row["Date"].strftime("%Y-%m-%d"),
            open=float(row["Open"]),
            high=float(row["High"]),
            low=float(row["Low"]),
            close=float(row["Close"]),
            volume=float(row["Volume"]),
            sma_20=float(row["SMA_20"]) if "SMA_20" in df.columns and pd.notna(row["SMA_20"]) else None,
            is_anomaly=bool(row.get("is_anomaly", False))
        ))

    company_name = resolve_company_name(ticker)

    response = AnalysisResponse(
        symbol=ticker,
        name=company_name,
        overview=MarketOverview(
            symbol=ticker,
            current_price=curr_p,
            period_change_pct=round(pct_chg, 2),
            period_high=float(df["High"].max()),
            period_low=float(df["Low"].min()),
            avg_volume=float(df["Volume"].mean())
        ),
        ai_score=score,
        signal=signal,
        signal_class=signal_cls,
        signal_reason=reason,
        predicted_price=latest_predicted,
        risk_label=risk_lbl,
        risk_score=risk_score,
        indicators=IndicatorSummary(
            rsi=rsi_val,
            macd=macd_val,
            macd_signal=macd_sig,
            volatility_pct=round(volatility, 2)
        ),
        sentiment=SentimentSummarySchema(**summary_dict),
        recent_news=news_articles,
        price_history=price_history,
        explainability=explainability_items
    )

    RESPONSE_CACHE[cache_key] = (response, now)
    return response