"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchStockAnalysis, searchCompanies, StockAnalysisResponse, TickerInfo } from "@/lib/api";
import PriceChart from "@/components/price-chart";
import ScoreBadge from "@/components/score-badge";
import RiskGauge from "@/components/risk-gauge";
import NewsCard from "@/components/news-card";
import ExplainabilityCard from "@/components/explainability-card";
import VoiceBriefing from "@/components/voice-briefing";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");

  const [symbol, setSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TickerInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [data, setData] = useState<StockAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol.toUpperCase());
      return;
    }
    const lastViewed = localStorage.getItem("marketmind_last_symbol");
    if (lastViewed) {
      setSymbol(lastViewed);
    }
  }, [urlSymbol]);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    fetchStockAnalysis(symbol)
      .then((res) => {
        setData(res);
        localStorage.setItem("marketmind_last_symbol", symbol);
      })
      .catch((err) => setError(err.message || "Failed to load analysis"))
      .finally(() => setLoading(false));
  }, [symbol]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchCompanies(searchQuery);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRecommendation = (item: TickerInfo) => {
    setSymbol(item.symbol);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSymbol(searchQuery.trim().toUpperCase());
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Technical & AI Analysis Workspace</h1>
          <p className="text-xs text-[#8b90a3] mt-1">
            Deep-dive ML forecasts, SHAP feature explainability, and sentiment diagnostics
          </p>
        </div>

        <div className="relative w-full md:w-80" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker (e.g. AA, Tata, NVDA)..."
              className="bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#0fa3b1] w-full"
            />
            <button
              type="submit"
              className="bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Analyze
            </button>
          </form>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelectRecommendation(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#0d1117] border-b border-[#2d333b]/50 last:border-0 flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] font-mono text-[#06c8d9]">{item.symbol}</span>
                  </div>
                  <span className="text-[10px] text-[#8b90a3] font-mono bg-[#0d1117] px-2 py-0.5 rounded border border-[#2d333b]">
                    {item.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-80 bento-card flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0fa3b1] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8b90a3]">Analyzing market metrics for {symbol}...</span>
        </div>
      ) : error || !data ? (
        <div className="p-8 bento-card border-[#ff5366]/30 text-center">
          <p className="text-sm text-[#ff5366] font-bold">Failed to load analysis for {symbol}</p>
          <p className="text-xs text-[#8b90a3] mt-1">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#2d333b] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#06c8d9] bg-[#0fa3b1]/10 px-2.5 py-1 rounded-md">
                Active Research Target
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-2">{data.name}</h2>
              <span className="text-xs font-mono font-bold text-[#8b90a3] bg-[#0d1117] px-2 py-0.5 rounded border border-[#2d333b] mt-1 inline-block">
                Symbol: {data.symbol}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ScoreBadge score={data.ai_score} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Current Price</span>
              <span className="text-xl font-black text-white mt-1 block">
                ₹{data.overview.current_price.toLocaleString()}
              </span>
              <span
                className={`text-xs font-bold mt-1 block ${
                  data.overview.period_change_pct >= 0 ? "text-[#00d084]" : "text-[#ff5366]"
                }`}
              >
                {data.overview.period_change_pct >= 0 ? "+" : ""}
                {data.overview.period_change_pct}% (365d)
              </span>
            </div>

            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">AI Model Forecast</span>
              <span className="text-xl font-black text-[#06c8d9] mt-1 block">
                {data.predicted_price ? `₹${data.predicted_price.toLocaleString()}` : "N/A"}
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">Random Forest Regressor</span>
            </div>

            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">RSI (14-Day)</span>
              <span className="text-xl font-black text-white mt-1 block">
                {data.indicators.rsi?.toFixed(2) ?? "N/A"}
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">
                {data.indicators.rsi && data.indicators.rsi > 70
                  ? "Overbought"
                  : data.indicators.rsi && data.indicators.rsi < 30
                  ? "Oversold"
                  : "Neutral Range"}
              </span>
            </div>

            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Volatility Rate</span>
              <span className="text-xl font-black text-[#ffb703] mt-1 block">
                {data.indicators.volatility_pct}%
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">Risk: {data.risk_label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bento-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
                  {data.name} Technical Price History
                </span>
                <span className="text-xs font-bold text-[#06c8d9] bg-[#0fa3b1]/10 px-2.5 py-1 rounded-md">
                  Live Feed
                </span>
              </div>
              <PriceChart data={data.price_history} height={360} />
            </div>

            <div className="space-y-6">
              <RiskGauge label={data.risk_label} score={data.risk_score} />
              <VoiceBriefing
                symbol={data.symbol}
                companyName={data.name}
                signal={data.signal}
                riskLabel={data.risk_label}
                sentiment={data.sentiment.overall_sentiment}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bento-card space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">
                ML Model Assessment & Signal Rationale
              </span>
              <div className="p-4 rounded-xl bg-[#0d1117] border border-[#2d333b]">
                <span className="text-xs font-bold text-[#8b90a3] block">Decision Signal</span>
                <span className="text-2xl font-black text-[#06c8d9] mt-1 block">{data.signal}</span>
                <p className="text-xs text-[#8b90a3] mt-2 leading-relaxed">{data.signal_reason}</p>
              </div>
            </div>

            <ExplainabilityCard items={data.explainability} />
          </div>

          <div className="bento-card space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">
              Market Sentiment & Recent News Coverage
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recent_news.map((news, idx) => (
                <NewsCard key={idx} article={news} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#8b90a3]">Loading Analysis...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}