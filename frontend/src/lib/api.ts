const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface MarketOverview {
  symbol: string;
  current_price: number;
  period_change_pct: number;
  period_high: number;
  period_low: number;
  avg_volume: number;
}

export interface IndicatorSummary {
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  volatility_pct: number;
}

export interface SentimentSummary {
  overall_sentiment: string;
  average_score: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_articles: number;
}

export interface NewsArticle {
  title: string;
  publisher: string;
  published: string | null;
  link: string;
  image: string;
  sentiment: string | null;
  sentiment_score: number | null;
}

export interface PriceSeriesPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20: number | null;
  is_anomaly?: boolean;
}

export interface FeatureImportanceItem {
  feature: string;
  impact: number;
  direction: string;
}

export interface StockAnalysisResponse {
  symbol: string;
  name: string;
  overview: MarketOverview;
  ai_score: number;
  signal: string;
  signal_class: string;
  signal_reason: string;
  predicted_price: number | null;
  risk_label: string;
  risk_score: number;
  indicators: IndicatorSummary;
  sentiment: SentimentSummary;
  recent_news: NewsArticle[];
  price_history: PriceSeriesPoint[];
  explainability: FeatureImportanceItem[];
}

export interface TickerInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
}

export interface SimulationRequest {
  symbol?: string;
  mode: "SIP" | "Lumpsum";
  amount: number;
  years: number;
  expected_return_pct: number;
}

export interface SimulationScenario {
  label: string;
  return_pct: number;
  future_value: number;
  gain: number;
}

export interface SimulationResponse {
  mode: string;
  invested_amount: number;
  years: number;
  conservative: SimulationScenario;
  expected: SimulationScenario;
  optimistic: SimulationScenario;
}

export async function fetchStockAnalysis(symbol: string, days = 365): Promise<StockAnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/stocks/analyze/${encodeURIComponent(symbol)}?days=${days}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analysis for ${symbol}`);
  }
  return res.json();
}

export async function searchCompanies(query: string): Promise<TickerInfo[]> {
  const res = await fetch(`${API_BASE_URL}/companies/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to search companies");
  }
  return res.json();
}

export async function calculateSimulation(payload: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/simulator/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to calculate simulation");
  }
  return res.json();
}