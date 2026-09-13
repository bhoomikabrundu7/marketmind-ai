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
    <div className="min-h-screen bg-[#070a0f] text-white p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
            Market Coverage
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">
            Company Directory & Ticker Hub
          </h1>
          <p className="text-xs text-[#8b90a3] mt-1">
            Explore covered equities across global and domestic exchanges with real-time AI decision signals
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-[#0f1522] border border-[#1b2230] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by company name or ticker (e.g. Tata, Reliance, AAPL)..."
            className="w-full bg-[#070a0f] border border-[#242f45] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#00e699] transition-all"
          />
        </div>

        {/* Exchange Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-xl border border-[#242f45] w-full sm:w-auto justify-center">
          <button
            onClick={() => setExchangeFilter("ALL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              exchangeFilter === "ALL"
                ? "bg-[#00e699] text-[#070a0f] shadow-md shadow-[#00e699]/20 font-black"
                : "text-[#8b90a3] hover:text-white"
            }`}
          >
            All Markets
          </button>
          <button
            onClick={() => setExchangeFilter("NSE")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              exchangeFilter === "NSE"
                ? "bg-[#00e699] text-[#070a0f] shadow-md shadow-[#00e699]/20 font-black"
                : "text-[#8b90a3] hover:text-white"
            }`}
          >
            NSE (India)
          </button>
          <button
            onClick={() => setExchangeFilter("US")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              exchangeFilter === "US"
                ? "bg-[#00e699] text-[#070a0f] shadow-md shadow-[#00e699]/20 font-black"
                : "text-[#8b90a3] hover:text-white"
            }`}
          >
            US Equities
          </button>
        </div>
      </div>

      {/* Directory Grid Display */}
      {loading ? (
        <div className="h-64 bg-[#0f1522] border border-[#1b2230] rounded-3xl flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00e699] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8b90a3]">Loading covered equities...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-[#0f1522] border border-[#1b2230] rounded-3xl py-16 text-center text-xs text-[#8b90a3]">
          No companies found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((comp) => {
            const isSaved = watchlistSymbols.includes(comp.symbol);
            const isPositive = (comp.changePct ?? 0) >= 0;

            return (
              <div
                key={comp.symbol}
                className="bg-[#0f1522] border border-[#1b2230] rounded-2xl p-5 hover:border-[#00e699]/50 transition-all shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Header: Company Name & Exchange Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white block truncate">{comp.name}</h3>
                      <span className="text-xs font-mono font-bold text-[#00e699]">{comp.symbol}</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#8b90a3] bg-[#070a0f] px-2 py-0.5 rounded border border-[#242f45] shrink-0">
                      {comp.exchange}
                    </span>
                  </div>

                  {/* Live Market & AI Signal Metrics */}
                  {comp.price !== undefined ? (
                    <div className="pt-2 border-t border-[#1b2230] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8b90a3] uppercase font-bold block">Live Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-white block">
                            ₹{comp.price.toLocaleString()}
                          </span>
                          {comp.changePct !== undefined && (
                            <span
                              className={`text-[10px] font-bold ${
                                isPositive ? "text-[#00e699]" : "text-[#ff5366]"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {comp.changePct}%
                            </span>
                          )}
                        </div>
                      </div>

                      {comp.signal && (
                        <span className="text-[10px] font-extrabold text-[#00e699] bg-[#00e699]/10 border border-[#00e699]/30 px-2.5 py-1 rounded-full">
                          {comp.signal}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#1b2230] text-[10px] text-[#8b90a3]">
                      Fetching real-time market feeds...
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#1b2230]">
                  <Link
                    href={`/analysis?symbol=${encodeURIComponent(comp.symbol)}`}
                    className="w-full text-center bg-[#070a0f] hover:bg-[#121824] border border-[#242f45] text-white font-bold text-xs py-2 rounded-xl transition-colors"
                  >
                    Launch Terminal →
                  </Link>

                  <button
                    onClick={() => handleToggleWatchlist(comp.symbol, comp.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSaved
                        ? "bg-[#00e699]/20 text-[#00e699] border border-[#00e699]"
                        : "bg-[#070a0f] text-[#8b90a3] hover:text-white border border-[#242f45]"
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