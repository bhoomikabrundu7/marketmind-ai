"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchStockAnalysis, searchCompanies, StockAnalysisResponse, TickerInfo } from "@/lib/api";

interface WatchlistItem {
  id: number | string;
  symbol: string;
  name: string;
  analysis?: StockAnalysisResponse | null;
  loading?: boolean;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [inputSymbol, setInputSymbol] = useState("");
  const [searchResults, setSearchResults] = useState<TickerInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch saved watchlist tickers from FastAPI backend database
  const fetchWatchlist = async () => {
    const token = localStorage.getItem("marketmind_token");
    if (!token) {
      // Fallback to localStorage if guest session
      const saved = localStorage.getItem("marketmind_watchlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWatchlist(parsed);
          enrichWatchlistWithLiveData(parsed);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/watchlists/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: WatchlistItem[] = await res.json();
        setWatchlist(data);
        enrichWatchlistWithLiveData(data);
      }
    } catch (err) {
      console.error("Failed to load watchlist from database", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch live stock price analytics & AI scores for each saved ticker
  const enrichWatchlistWithLiveData = async (items: WatchlistItem[]) => {
    const updated = await Promise.all(
      items.map(async (item) => {
        try {
          const liveData = await fetchStockAnalysis(item.symbol);
          return { ...item, analysis: liveData, loading: false };
        } catch (err) {
          return { ...item, analysis: null, loading: false };
        }
      })
    );
    setWatchlist(updated);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // 3. Live search recommendations starting from typed letters
  useEffect(() => {
    if (!inputSymbol.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchCompanies(inputSymbol);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputSymbol]);

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
    setInputSymbol(item.symbol);
    setIsDropdownOpen(false);
  };

  // 4. Add ticker to database
  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSymbol.trim()) return;

    setAdding(true);
    setError(null);

    const token = localStorage.getItem("marketmind_token");

    try {
      // Validate ticker & fetch live metadata first
      const stockData = await fetchStockAnalysis(inputSymbol.trim().toUpperCase());

      if (token) {
        const res = await fetch("http://127.0.0.1:8000/api/v1/watchlists/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symbol: stockData.symbol,
            name: stockData.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to save ticker.");
        }

        const savedItem: WatchlistItem = await res.json();
        setWatchlist((prev) => [{ ...savedItem, analysis: stockData }, ...prev]);
      } else {
        // Fallback for guest mode
        const localItem: WatchlistItem = {
          id: Date.now(),
          symbol: stockData.symbol,
          name: stockData.name,
          analysis: stockData,
        };
        const updated = [localItem, ...watchlist];
        setWatchlist(updated);
        localStorage.setItem("marketmind_watchlist", JSON.stringify(updated));
      }

      setInputSymbol("");
    } catch (err: any) {
      setError(err.message || "Failed to add ticker to watchlist.");
    } finally {
      setAdding(false);
    }
  };

  // 5. Delete ticker from database
  const handleRemoveTicker = async (id: number | string, symbol: string) => {
    const token = localStorage.getItem("marketmind_token");

    if (token && typeof id === "number") {
      try {
        await fetch(`http://127.0.0.1:8000/api/v1/watchlists/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to delete ticker", err);
      }
    }

    const updated = watchlist.filter((item) => item.symbol !== symbol);
    setWatchlist(updated);
    if (!token) {
      localStorage.setItem("marketmind_watchlist", JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">My Watchlist</h1>
        <p className="text-xs text-[#8b90a3] mt-1">
          Track saved equities, real-time market movements, and fast-launch AI diagnostics
        </p>
      </div>

      {/* Add Ticker Form with Auto-Recommendations */}
      <div className="bento-card">
        {error && (
          <div className="mb-4 p-3 bg-[#ff5366]/10 border border-[#ff5366]/30 rounded-xl text-xs font-bold text-[#ff5366]">
            {error}
          </div>
        )}

        <form onSubmit={handleAddTicker} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-96" ref={dropdownRef}>
            <input
              type="text"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Add symbol (e.g. AAPL, NVDA, TCS.NS)..."
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#0fa3b1]"
            />

            {/* Recommendation Dropdown Menu */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.symbol}
                    onClick={() => handleSelectRecommendation(item)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#0d1117] border-b border-[#2d333b]/50 last:border-0 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
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

          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            {adding ? "Adding..." : "+ Add Ticker"}
          </button>
        </form>
      </div>

      {/* Watchlist Grid / Table */}
      {loading ? (
        <div className="h-64 bento-card flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0fa3b1] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8b90a3]">Loading saved tickers from database...</span>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="bento-card py-16 text-center text-xs text-[#8b90a3]">
          No tickers saved in database yet. Search and add companies above to track them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <div
              key={item.symbol}
              className="bento-card hover:border-[#0fa3b1]/50 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white block truncate">{item.name}</h3>
                    <span className="text-xs font-mono font-bold text-[#06c8d9]">{item.symbol}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveTicker(item.id, item.symbol)}
                    className="text-[#ff5366] hover:bg-[#ff5366]/10 px-2 py-1 rounded text-xs transition-colors"
                    title="Remove from Watchlist"
                  >
                    ✕
                  </button>
                </div>

                {item.analysis ? (
                  <div className="pt-2 border-t border-[#2d333b] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8b90a3] block uppercase font-bold">Live Price</span>
                      <span className="text-lg font-black text-white block">
                        ₹{item.analysis.overview.current_price.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8b90a3] block uppercase font-bold">1-Yr Return</span>
                      <span
                        className={`text-xs font-black block ${
                          item.analysis.overview.period_change_pct >= 0 ? "text-[#00d084]" : "text-[#ff5366]"
                        }`}
                      >
                        {item.analysis.overview.period_change_pct >= 0 ? "+" : ""}
                        {item.analysis.overview.period_change_pct}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-[10px] text-[#8b90a3]">Syncing live market feeds...</div>
                )}
              </div>

              {item.analysis && (
                <div className="flex items-center justify-between pt-3 border-t border-[#2d333b]/60">
                  <span className="text-[10px] font-bold text-[#06c8d9] bg-[#0fa3b1]/10 px-2 py-0.5 rounded">
                    AI Signal: {item.analysis.signal}
                  </span>

                  <Link
                    href={`/?symbol=${encodeURIComponent(item.symbol)}`}
                    className="text-xs font-bold text-white hover:text-[#06c8d9] flex items-center gap-1 transition-colors"
                  >
                    Launch Analysis →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}