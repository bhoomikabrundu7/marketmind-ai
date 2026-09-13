"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fetchStockAnalysis, searchCompanies, TickerInfo } from "@/lib/api";

interface Position {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPct: number;
}

const MATRIX_COLORS = ["#06c8d9", "#0fa3b1", "#00d084", "#ffb703", "#ff5366", "#9d4edd"];

export default function PortfolioPage() {
  // Lazy state initialization prevents localStorage data wipe on mount
  const [positions, setPositions] = useState<Position[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("marketmind_portfolio");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse stored portfolio state", e);
        }
      }
    }
    return [
      {
        id: "TCS.NS_default",
        symbol: "TCS.NS",
        name: "Tata Consultancy Services Ltd.",
        shares: 2,
        avgPrice: 50,
        currentPrice: 3850.5,
        totalValue: 7701.0,
        pnl: 7601.0,
        pnlPct: 7601.0,
      },
    ];
  });

  const [symbolInput, setSymbolInput] = useState("");
  const [sharesInput, setSharesInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const [searchResults, setSearchResults] = useState<TickerInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("marketmind_portfolio", JSON.stringify(positions));
    }
  }, [positions]);

  // Live auto-recommendation search as user types starting letters
  useEffect(() => {
    if (!symbolInput.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchCompanies(symbolInput);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("Company search error", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [symbolInput]);

  // Close dropdown menu on outside click
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
    setSymbolInput(item.symbol);
    setIsDropdownOpen(false);
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolInput || !sharesInput || !priceInput) {
      setError("Please fill in all fields.");
      return;
    }

    const shares = parseFloat(sharesInput);
    const avgPrice = parseFloat(priceInput);

    if (isNaN(shares) || shares <= 0 || isNaN(avgPrice) || avgPrice <= 0) {
      setError("Please enter valid positive numbers for shares and price.");
      return;
    }

    setLoadingAdd(true);
    setError(null);

    try {
      const stockData = await fetchStockAnalysis(symbolInput.trim().toUpperCase());
      const currentPrice = stockData.overview.current_price;
      const totalValue = shares * currentPrice;
      const totalCost = shares * avgPrice;
      const pnl = totalValue - totalCost;
      const pnlPct = (pnl / totalCost) * 100;

      const newPosition: Position = {
        id: `${stockData.symbol}_${Date.now()}`,
        symbol: stockData.symbol,
        name: stockData.name,
        shares,
        avgPrice,
        currentPrice,
        totalValue,
        pnl,
        pnlPct,
      };

      setPositions((prev) => [newPosition, ...prev]);
      setSymbolInput("");
      setSharesInput("");
      setPriceInput("");
    } catch (err: any) {
      setError(err.message || "Could not fetch stock market data for this symbol.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  // Portfolio Totals Calculation
  const totalValue = positions.reduce((acc, p) => acc + p.totalValue, 0);
  const totalInvested = positions.reduce((acc, p) => acc + p.shares * p.avgPrice, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Dynamic Portfolio Weight Allocation Matrix Data
  const allocationMatrix = useMemo(() => {
    if (totalValue === 0) return [];
    return positions.map((p) => ({
      name: p.name,
      symbol: p.symbol,
      value: p.totalValue,
      percentage: ((p.totalValue / totalValue) * 100).toFixed(1),
    }));
  }, [positions, totalValue]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Portfolio Tracker</h1>
        <p className="text-xs text-[#8b90a3] mt-1">
          Real-time valuation, cost-basis analysis, and dynamic asset allocation matrix
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card">
          <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Total Portfolio Value</span>
          <span className="text-2xl font-black text-white mt-1 block">
            ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bento-card">
          <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Total Invested Capital</span>
          <span className="text-2xl font-black text-[#8b90a3] mt-1 block">
            ₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bento-card">
          <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Unrealized Profit / Loss</span>
          <span
            className={`text-2xl font-black mt-1 block ${
              totalPnl >= 0 ? "text-[#00d084]" : "text-[#ff5366]"
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-bold ml-2">({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%)</span>
          </span>
        </div>
      </div>

      {/* Dynamic Asset Weight Allocation Matrix Section */}
      {allocationMatrix.length > 0 && (
        <div className="bento-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block mb-4">
            Dynamic Portfolio Allocation Matrix
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Pie Chart Matrix Visual */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationMatrix}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationMatrix.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MATRIX_COLORS[index % MATRIX_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161b22", borderColor: "#2d333b", borderRadius: "8px" }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Valuation"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Allocation Breakdown List */}
            <div className="md:col-span-2 space-y-2 max-h-56 overflow-y-auto pr-2">
              {allocationMatrix.map((item, index) => (
                <div key={item.symbol} className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-[#2d333b] rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: MATRIX_COLORS[index % MATRIX_COLORS.length] }}
                    />
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] font-mono text-[#06c8d9]">{item.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">{item.percentage}%</span>
                    <span className="text-[10px] text-[#8b90a3]">₹{item.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Position Form with Live Search Dropdown */}
      <div className="bento-card space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">
          Add New Holdings Position
        </span>

        {error && (
          <div className="p-3 bg-[#ff5366]/10 border border-[#ff5366]/30 rounded-xl text-xs font-bold text-[#ff5366]">
            {error}
          </div>
        )}

        <form onSubmit={handleAddPosition} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Symbol Search Bar */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-[#8b90a3] uppercase block mb-1">Company / Ticker</label>
            <input
              type="text"
              required
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="e.g. TATAMOTORS, AAPL..."
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
            />

            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.symbol}
                    onClick={() => handleSelectRecommendation(item)}
                    className="w-full text-left px-3 py-2 hover:bg-[#0d1117] border-b border-[#2d333b]/50 last:border-0 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white block">{item.symbol}</span>
                      <span className="text-[10px] text-[#8b90a3] truncate max-w-[120px] block">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-[#06c8d9] font-mono bg-[#0fa3b1]/10 px-1.5 py-0.5 rounded">
                      {item.exchange}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8b90a3] uppercase block mb-1">Shares Quantity</label>
            <input
              type="number"
              step="any"
              required
              value={sharesInput}
              onChange={(e) => setSharesInput(e.target.value)}
              placeholder="e.g. 25"
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8b90a3] uppercase block mb-1">Avg Buy Price (₹)</label>
            <input
              type="number"
              step="any"
              required
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="e.g. 950.50"
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
            />
          </div>

          <button
            type="submit"
            disabled={loadingAdd}
            className="bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingAdd ? "Fetching Price..." : "Add Position"}
          </button>
        </form>
      </div>

      {/* Holdings Table */}
      <div className="bento-card overflow-hidden">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block mb-4">
          Active Holdings ({positions.length})
        </span>

        {positions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8b90a3]">
            No active positions added yet. Use the form above to build your portfolio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2d333b] text-[10px] font-bold uppercase text-[#8b90a3]">
                  <th className="py-3 px-4">Asset / Company</th>
                  <th className="py-3 px-4">Shares</th>
                  <th className="py-3 px-4">Avg Buy Price</th>
                  <th className="py-3 px-4">Live Price</th>
                  <th className="py-3 px-4">Market Value</th>
                  <th className="py-3 px-4">Unrealized P&L</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d333b]/60 text-xs">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-[#0d1117]/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{pos.name}</span>
                      <span className="text-[10px] font-mono text-[#06c8d9]">{pos.symbol}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{pos.shares}</td>
                    <td className="py-3 px-4 text-[#8b90a3]">₹{pos.avgPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{pos.currentPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-white">₹{pos.totalValue.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={pos.pnl >= 0 ? "text-[#00d084]" : "text-[#ff5366]"}>
                        {pos.pnl >= 0 ? "+" : ""}₹{pos.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-[10px] ml-1">({pos.pnlPct >= 0 ? "+" : ""}{pos.pnlPct.toFixed(2)}%)</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemovePosition(pos.id)}
                        className="text-[#ff5366] hover:underline font-bold text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}