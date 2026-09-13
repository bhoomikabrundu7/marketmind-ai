"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchStockAnalysis, searchCompanies, StockAnalysisResponse, TickerInfo } from "@/lib/api";
import PriceChart from "@/components/price-chart";
import ScoreBadge from "@/components/score-badge";
import RiskGauge from "@/components/risk-gauge";
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

  // Sync symbol state from URL parameter or localStorage
  useEffect(() => {
    if (urlSymbol && urlSymbol.trim() !== "") {
      const cleanUrlSym = urlSymbol.toUpperCase().trim();
      setSymbol(cleanUrlSym);
      localStorage.setItem("marketmind_last_symbol", cleanUrlSym);
    } else {
      const lastViewed = localStorage.getItem("marketmind_last_symbol");
      if (lastViewed) {
        setSymbol(lastViewed);
      }
    }
  }, [urlSymbol]);

  // Fetch full stock analysis when symbol changes
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

  // Handle autocomplete search inputs
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

  // Close search dropdown on click outside
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

  const rawCurrentPrice = Number(data?.overview?.current_price || 0);
  const formattedCurrentPrice = isNaN(rawCurrentPrice)
    ? "0.00"
    : rawCurrentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rawPredictedPrice = Number(data?.predicted_price || 0);
  const formattedPredictedPrice = isNaN(rawPredictedPrice) || rawPredictedPrice === 0
    ? "N/A"
    : `₹${rawPredictedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* TOP WORKSPACE HEADER & SEARCH */}
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
              className="bg-[#0f1522] border border-[#242f45] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#00e699] w-full"
            />
            <button
              type="submit"
              className="bg-[#00e699] hover:bg-[#00ffaa] text-[#070a0f] font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-[#00e699]/20"
            >
              Analyze
            </button>
          </form>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1522] border border-[#242f45] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelectRecommendation(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#161f30] border-b border-[#1b2230]/50 last:border-0 flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] font-mono text-[#00e699]">{item.symbol}</span>
                  </div>
                  <span className="text-[10px] text-[#8b90a3] font-mono bg-[#070a0f] px-2 py-0.5 rounded border border-[#242f45]">
                    {item.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-80 bg-[#0f1522] border border-[#1b2230] rounded-3xl flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00e699] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8b90a3]">Analyzing market metrics for {symbol}...</span>
        </div>
      ) : error || !data ? (
        <div className="p-8 bg-[#0f1522] border border-[#ff5366]/30 rounded-3xl text-center space-y-3">
          <p className="text-sm text-[#ff5366] font-bold">Failed to load analysis for {symbol}</p>
          <p className="text-xs text-[#8b90a3]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00e699] text-[#070a0f] text-xs font-bold rounded-xl cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ACTIVE RESEARCH TARGET HEADER */}
          <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
                Active Research Target
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-2">{data.name}</h2>
              <span className="text-xs font-mono font-bold text-[#8b90a3] bg-[#070a0f] px-2 py-0.5 rounded border border-[#242f45] mt-1 inline-block">
                Symbol: {data.symbol}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ScoreBadge score={data.ai_score} />
            </div>
          </div>

          {/* METRICS METRIC GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-extrabold text-[#8b90a3] uppercase block">Current Price</span>
              <span className="text-xl font-black text-white mt-1 block font-mono">
                ₹{formattedCurrentPrice}
              </span>
              <span className={`text-xs font-bold mt-1 block ${(data.overview?.period_change_pct || 0) >= 0 ? "text-[#00e699]" : "text-[#ff5366]"}`}>
                {(data.overview?.period_change_pct || 0) >= 0 ? "+" : ""}{data.overview?.period_change_pct || 0}% (365d)
              </span>
            </div>

            <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-extrabold text-[#8b90a3] uppercase block">AI Model Forecast</span>
              <span className="text-xl font-black text-[#00e699] mt-1 block font-mono">
                {formattedPredictedPrice}
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">Random Forest Regressor</span>
            </div>

            <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-extrabold text-[#8b90a3] uppercase block">RSI (14-Day)</span>
              <span className="text-xl font-black text-white mt-1 block font-mono">
                {data.indicators?.rsi?.toFixed(2) ?? "N/A"}
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">
                {data.indicators?.rsi && data.indicators.rsi > 70
                  ? "Overbought"
                  : data.indicators?.rsi && data.indicators.rsi < 30
                  ? "Oversold"
                  : "Neutral Range"}
              </span>
            </div>

            <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-extrabold text-[#8b90a3] uppercase block">Volatility Rate</span>
              <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
                {data.indicators?.volatility_pct || 0}%
              </span>
              <span className="text-[10px] text-[#8b90a3] mt-1 block">Risk: {data.risk_label}</span>
            </div>
          </div>

          {/* PRICE CHART & VOICE BRIEFING */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
                  {data.name} Technical Price History
                </span>
                <span className="text-xs font-bold text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
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
                sentiment={data.sentiment?.overall_sentiment || "Neutral"}
              />
            </div>
          </div>

          {/* ML SIGNAL & EXPLAINABILITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">
                ML Model Assessment & Signal Rationale
              </span>
              <div className="p-4 rounded-2xl bg-[#070a0f] border border-[#242f45]">
                <span className="text-xs font-bold text-[#8b90a3] block">Decision Signal</span>
                <span className="text-2xl font-black text-[#00e699] mt-1 block">{data.signal}</span>
                <p className="text-xs text-[#8b90a3] mt-2 leading-relaxed">{data.signal_reason}</p>
              </div>
            </div>

            <ExplainabilityCard items={data.explainability} />
          </div>

          {/* MARKET SENTIMENT & RECENT NEWS COVERAGE SECTION */}
          <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Market Sentiment & Recent News Coverage
            </h3>

            {data.recent_news && data.recent_news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.recent_news.map((item: any, idx: number) => {
                  const uniqueImages = [
                    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=600&auto=format&fit=crop",
                  ];
                  const articleImage = item.image_url || uniqueImages[idx % uniqueImages.length];

                  return (
                    <div
                      key={idx}
                      className="bg-[#070a0f] border border-[#1b2230] rounded-2xl overflow-hidden hover:border-[#00e699]/50 transition-all shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        {articleImage && (
                          <div className="relative h-36 w-full overflow-hidden bg-[#070a0f]">
                            <img
                              src={articleImage}
                              alt={item.title || "News"}
                              className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 bg-[#070a0f]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-white">
                              {item.source || "Financial Wire"}
                            </div>
                          </div>
                        )}

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-[#8b90a3]">
                            <span>{item.published_at || "Recent"}</span>
                            <span className="font-mono text-[#00e699]">{item.source}</span>
                          </div>

                          <h4 className="text-xs font-black text-white leading-snug hover:text-[#00e699] transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-[#1b2230] flex items-center justify-between text-xs">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            item.sentiment === "Positive" || item.sentiment === "Bullish"
                              ? "bg-[#00e699]/10 text-[#00e699] border border-[#00e699]/30"
                              : item.sentiment === "Negative" || item.sentiment === "Bearish"
                              ? "bg-[#ff5366]/10 text-[#ff5366] border border-[#ff5366]/30"
                              : "bg-slate-700/30 text-slate-300"
                          }`}
                        >
                          {item.sentiment || "Neutral"}
                        </span>

                        <a
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#00e699] hover:underline"
                        >
                          Read Article →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8b90a3]">No recent market news coverage found for {data.symbol}.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#8b90a3] p-8">Loading Workspace...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}