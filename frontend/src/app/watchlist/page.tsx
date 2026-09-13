"use client";

import { useEffect, useState } from "react";
import { fetchStockAnalysis } from "@/lib/api";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(false);

  // Default initial watchlist symbols
  const defaultSymbols = ["AA", "AAL", "AAPL", "ADANIENT.NS", "ADANIPORTS.NS", "NVDA", "RELIANCE.NS", "TSLA"];

  useEffect(() => {
    const loadWatchlistData = async () => {
      setLoading(true);
      try {
        const saved = localStorage.getItem("marketmind_watchlist");
        const symbols: string[] = saved ? JSON.parse(saved) : defaultSymbols;

        const results = await Promise.all(
          symbols.map(async (sym) => {
            try {
              return await fetchStockAnalysis(sym);
            } catch {
              return null;
            }
          })
        );
        setWatchlist(results.filter(Boolean));
      } catch (err) {
        console.error("Failed to load watchlist", err);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistData();
  }, []);

  const handleLaunchAnalysis = (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    localStorage.setItem("marketmind_last_symbol", cleanSym);
    window.location.href = `/analysis?symbol=${encodeURIComponent(cleanSym)}`;
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    const cleanSym = newTicker.trim().toUpperCase();
    const saved = localStorage.getItem("marketmind_watchlist");
    const currentList: string[] = saved ? JSON.parse(saved) : defaultSymbols;

    if (!currentList.includes(cleanSym)) {
      const updated = [...currentList, cleanSym];
      localStorage.setItem("marketmind_watchlist", JSON.stringify(updated));
      handleLaunchAnalysis(cleanSym);
    }
    setNewTicker("");
  };

  const handleRemoveTicker = (symbolToRemove: string) => {
    const saved = localStorage.getItem("marketmind_watchlist");
    const currentList: string[] = saved ? JSON.parse(saved) : defaultSymbols;
    const updated = currentList.filter((s) => s !== symbolToRemove);
    localStorage.setItem("marketmind_watchlist", JSON.stringify(updated));
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbolToRemove));
  };

  return (
    <div className="space-y-6">
      {/* WATCHLIST HEADER & TICKER INPUT */}
      <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
            Saved Tracking Hub
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">My Watchlist</h1>
          <p className="text-xs text-[#8b90a3] mt-0.5">
            Track saved equities, real-time market movements, and fast-launch AI diagnostics
          </p>
        </div>

        <form onSubmit={handleAddTicker} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Add symbol (e.g. AAPL, NVDA)..."
            className="bg-[#070a0f] border border-[#242f45] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#00e699] w-full sm:w-60"
          />
          <button
            type="submit"
            className="bg-[#00e699] hover:bg-[#00ffaa] text-[#070a0f] font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          >
            + Add Ticker
          </button>
        </form>
      </div>

      {/* WATCHLIST ITEMS GRID */}
      {loading ? (
        <div className="h-64 bg-[#0f1522] border border-[#1b2230] rounded-3xl flex items-center justify-center text-xs text-[#8b90a3]">
          Loading watchlist metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => {
            const isPos = (item.overview?.period_change_pct || 0) >= 0;
            const rawPrice = Number(item.overview?.current_price || 0);
            const formattedPrice = isNaN(rawPrice)
              ? "N/A"
              : rawPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return (
              <div
                key={item.symbol}
                className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-2xl hover:border-[#00e699]/50 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-[#00e699]">{item.symbol}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveTicker(item.symbol)}
                      className="text-[#8b90a3] hover:text-[#ff5366] text-sm px-1 cursor-pointer transition-colors"
                      title="Remove from watchlist"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8b90a3] block">Live Price</span>
                      <span className="text-lg font-black text-white font-mono">
                        ₹{formattedPrice}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPos ? "bg-[#00e699]/15 text-[#00e699]" : "bg-[#ff5366]/15 text-[#ff5366]"}`}>
                      {isPos ? "+" : ""}{item.overview?.period_change_pct || 0}%
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1b2230] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 bg-[#070a0f] px-2 py-0.5 rounded border border-[#242f45]">
                    {item.signal || "Neutral"}
                  </span>
                  <button
                    onClick={() => handleLaunchAnalysis(item.symbol)}
                    className="text-[11px] font-bold text-[#00e699] hover:underline cursor-pointer"
                  >
                    Launch Analysis →
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