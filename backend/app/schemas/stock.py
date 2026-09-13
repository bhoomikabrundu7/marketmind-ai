from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TickerInfo(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: str
    exchange: str

class MarketOverview(BaseModel):
    symbol: str
    current_price: float
    period_change_pct: float
    period_high: float
    period_low: float
    avg_volume: float

class IndicatorSummary(BaseModel):
    rsi: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    volatility_pct: float

class SentimentSummarySchema(BaseModel):
    overall_sentiment: str
    average_score: float
    positive_count: int
    neutral_count: int
    negative_count: int
    total_articles: int

class NewsArticle(BaseModel):
    title: str
    publisher: str
    published: Optional[str]
    link: str
    image: str
    sentiment: Optional[str]
    sentiment_score: Optional[float]

class PriceSeriesPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    sma_20: Optional[float] = None
    is_anomaly: Optional[bool] = False

class FeatureImportanceItem(BaseModel):
    feature: str
    impact: float
    direction: str

class AnalysisResponse(BaseModel):
    symbol: str
    name: str
    overview: MarketOverview
    ai_score: int
    signal: str
    signal_class: str
    signal_reason: str
    predicted_price: Optional[float]
    risk_label: str
    risk_score: float
    indicators: IndicatorSummary
    sentiment: SentimentSummarySchema
    recent_news: List[NewsArticle]
    price_history: List[PriceSeriesPoint]
    explainability: List[FeatureImportanceItem]