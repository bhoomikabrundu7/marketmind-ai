"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { searchCompanies, fetchStockAnalysis, TickerInfo } from "@/lib/api";

interface CompanyCardData extends TickerInfo {
  price?: number;
  changePct?: number;
  signal?: string;
  loading?: boolean;
}

export default function CompaniesPage() {
  const [filterQuery, setFilterQuery] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "NSE" | "US">("ALL");
  const [companies, setCompanies] = useState<CompanyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);

  // Load baseline company catalog
  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const results = await searchCompanies(filterQuery);
        const mapped: CompanyCardData[] = results.map((item) => ({
          ...item,
          loading: true,
        }));
        setCompanies(mapped);
        enrichCompaniesWithLiveData(mapped);
      } catch (err) {
        console.error("Failed to load directory", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadCompanies();
    }, 200);

    return () => clearTimeout(timer);
  }, [filterQuery]);

  // Load saved watchlist symbols for quick toggle state
  useEffect(() => {
    const token = localStorage.getItem("marketmind_token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/v1/watchlists/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        setWatchlistSymbols(data.map((item) => item.symbol));
      })
      .catch((err) => console.error("Failed to load watchlist", err));
  }, []);

  // Fetch live prices and signals asynchronously for visible cards
  const enrichCompaniesWithLiveData = async (items: CompanyCardData[]) => {
    const updated = await Promise.all(
      items.map(async (item) => {
        try {
          const analysis = await fetchStockAnalysis(item.symbol);
          return {
            ...item,
            price: analysis.overview.current_price,
            changePct: analysis.overview.period_change_pct,
            signal: analysis.signal,
            loading: false,
          };
        } catch (err) {
          return { ...item, loading: false };
        }
      })
    );
    setCompanies(updated);
  };

  const handleToggleWatchlist = async (symbol: string, name: string) => {
    const token = localStorage.getItem("marketmind_token");
    if (!token) {
      alert("Please sign in to save tickers to your watchlist.");
      return;
    }

    const isSaved = watchlistSymbols.includes(symbol);

    if (isSaved) {
      setWatchlistSymbols((prev) => prev.filter((s) => s !== symbol));
    } else {
      setWatchlistSymbols((prev) => [...prev, symbol]);
      try {
        await fetch("http://127.0.0.1:8000/api/v1/watchlists/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ symbol, name }),
        });
      } catch (err) {
        console.error("Failed to add to watchlist", err);
      }
    }
  };

  // Filter companies by exchange selection
  const filteredCompanies = companies.filter((c) => {
    if (exchangeFilter === "NSE") return c.exchange === "NSE";
    if (exchangeFilter === "US") return c.exchange === "NASDAQ" || c.exchange === "NYSE";
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Company Directory & Market Coverage</h1>
        <p className="text-xs text-[#8b90a3] mt-1">
          Explore covered equities across global and domestic exchanges with real-time AI signals
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bento-card flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by company name or ticker (e.g. Tata, Reliance, AAPL)..."
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#0fa3b1]"
          />
        </div>

        {/* Exchange Filter Buttons */}
        <div className="flex items-center gap-2 bg-[#0d1117] p-1 rounded-xl border border-[#2d333b] w-full sm:w-auto justify-center">
          <button
            onClick={() => setExchangeFilter("ALL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              exchangeFilter === "ALL" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
            }`}
          >
            All Markets
          </button>
          <button
            onClick={() => setExchangeFilter("NSE")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              exchangeFilter === "NSE" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
            }`}
          >
            NSE (India)
          </button>
          <button
            onClick={() => setExchangeFilter("US")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              exchangeFilter === "US" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
            }`}
          >
            US Equities
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="h-64 bento-card flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0fa3b1] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8b90a3]">Loading covered equities...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bento-card py-16 text-center text-xs text-[#8b90a3]">
          No companies found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((comp) => {
            const isSaved = watchlistSymbols.includes(comp.symbol);
            return (
              <div
                key={comp.symbol}
                className="bento-card hover:border-[#0fa3b1]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Name & Exchange Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white block truncate">{comp.name}</h3>
                      <span className="text-xs font-mono font-bold text-[#06c8d9]">{comp.symbol}</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#8b90a3] bg-[#0d1117] px-2 py-0.5 rounded border border-[#2d333b] shrink-0">
                      {comp.exchange}
                    </span>
                  </div>

                  {/* Live Market & AI Details */}
                  {comp.price !== undefined ? (
                    <div className="pt-2 border-t border-[#2d333b] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8b90a3] uppercase font-bold block">Live Price</span>
                        <span className="text-base font-black text-white block">
                          ₹{comp.price.toLocaleString()}
                        </span>
                      </div>

                      {comp.signal && (
                        <span className="text-[10px] font-bold text-[#06c8d9] bg-[#0fa3b1]/10 px-2 py-1 rounded">
                          {comp.signal}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 text-[10px] text-[#8b90a3]">Fetching price analytics...</div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#2d333b]/60">
                  <Link
                    href={`/analysis?symbol=${encodeURIComponent(comp.symbol)}`}
                    className="w-full text-center bg-[#0d1117] hover:bg-[#2d333b] border border-[#2d333b] text-white font-bold text-xs py-2 rounded-xl transition-colors"
                  >
                    Launch View →
                  </Link>

                  <button
                    onClick={() => handleToggleWatchlist(comp.symbol, comp.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSaved
                        ? "bg-[#00d084]/20 text-[#00d084] border border-[#00d084]"
                        : "bg-[#0fa3b1]/10 text-[#06c8d9] hover:bg-[#0fa3b1]/20 border border-[#0fa3b1]/30"
                    }`}
                    title={isSaved ? "In Watchlist" : "Add to Watchlist"}
                  >
                    {isSaved ? "✓" : "+ Watch"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}