"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchStockAnalysis, searchCompanies, StockAnalysisResponse, TickerInfo } from "@/lib/api";

interface GrowthPoint {
  year: number;
  invested: number;
  expected_value: number;
}

export default function SimulatorPage() {
  const [calcType, setCalcType] = useState<"generic" | "company">("generic");
  const [mode, setMode] = useState<"sip" | "lumpsum">("sip");
  const [amount, setAmount] = useState<number>(10000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);

  // Company Mode State
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TickerInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch stock analysis when company selection changes
  useEffect(() => {
    if (calcType !== "company" || !selectedSymbol) return;
    setLoadingStock(true);
    fetchStockAnalysis(selectedSymbol)
      .then((data) => {
        setStockData(data);
        const annualReturn = Math.max(5, Math.min(40, Math.abs(data.overview.period_change_pct)));
        setExpectedReturn(Math.round(annualReturn));
      })
      .catch((err) => console.error("Simulator stock fetch error", err))
      .finally(() => setLoadingStock(false));
  }, [calcType, selectedSymbol]);

  // Live auto-recommendation search as user types starting letters
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
        console.error("Search recommendations failed", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close recommendations dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCompany = (item: TickerInfo) => {
    setSelectedSymbol(item.symbol);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Real-time compound return calculation
  const simulation = useMemo(() => {
    let totalInvested = 0;
    let finalBalance = 0;
    const trajectory: GrowthPoint[] = [];
    const r = expectedReturn / 100;

    if (mode === "sip") {
      const monthlyRate = r / 12;
      let currentBalance = 0;

      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          currentBalance = (currentBalance + amount) * (1 + monthlyRate);
        }
        trajectory.push({
          year: y,
          invested: Math.round(amount * 12 * y),
          expected_value: Math.round(currentBalance),
        });
      }
      totalInvested = amount * 12 * years;
      finalBalance = currentBalance;
    } else {
      totalInvested = amount;
      let currentBalance = amount;

      for (let y = 1; y <= years; y++) {
        currentBalance = currentBalance * (1 + r);
        trajectory.push({
          year: y,
          invested: amount,
          expected_value: Math.round(currentBalance),
        });
      }
      finalBalance = currentBalance;
    }

    return {
      totalInvested: Math.round(totalInvested),
      finalBalance: Math.round(finalBalance),
      wealthGained: Math.round(finalBalance - totalInvested),
      trajectory,
    };
  }, [mode, amount, years, expectedReturn]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Investment Simulator</h1>
          <p className="text-xs text-[#8b90a3] mt-1">
            Compound wealth growth projection modeler & company stock backtester
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-[#161b22] border border-[#2d333b] rounded-xl">
          <button
            onClick={() => setCalcType("generic")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              calcType === "generic" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
            }`}
          >
            Generic Growth Calculator
          </button>
          <button
            onClick={() => setCalcType("company")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              calcType === "company" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
            }`}
          >
            Company Stock Backtest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="bento-card space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">
            Simulation Parameters
          </span>

          {/* Company Search Bar with Instant Recommendations */}
          {calcType === "company" && (
            <div className="relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Search & Select Company</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type company name (e.g. Tata, Apple, HDFC)..."
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#0fa3b1]"
              />

              {/* Recommended Dropdown List */}
              {isDropdownOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelectCompany(item)}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#0d1117] border-b border-[#2d333b]/50 last:border-0 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{item.symbol}</span>
                        <span className="text-[10px] text-[#8b90a3] block truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-[#06c8d9] font-mono bg-[#0fa3b1]/10 px-2 py-0.5 rounded">
                        {item.exchange}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {loadingStock ? (
                <span className="text-[10px] text-[#06c8d9] mt-1 block font-semibold">
                  Syncing live metrics for {selectedSymbol}...
                </span>
              ) : stockData ? (
                <div className="mt-2 p-2.5 bg-[#0d1117] border border-[#0fa3b1]/40 rounded-xl">
                  <span className="text-[10px] text-[#06c8d9] font-bold uppercase block">Selected Stock</span>
                  <span className="text-xs font-black text-white block truncate">{stockData.name}</span>
                  <span className="text-[10px] text-[#8b90a3]">
                    1-Yr Return: <span className="text-[#00d084] font-bold">+{stockData.overview.period_change_pct}%</span>
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* SIP / Lump Sum Toggle */}
          <div className="flex p-1 bg-[#0d1117] border border-[#2d333b] rounded-xl">
            <button
              onClick={() => setMode("sip")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                mode === "sip" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
              }`}
            >
              Monthly SIP
            </button>
            <button
              onClick={() => setMode("lumpsum")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                mode === "lumpsum" ? "bg-[#0fa3b1] text-black" : "text-[#8b90a3] hover:text-white"
              }`}
            >
              Lump Sum
            </button>
          </div>

          {/* Amount Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#8b90a3]">{mode === "sip" ? "Monthly Investment" : "One-Time Investment"}</span>
              <span className="font-bold text-white">₹{amount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={mode === "sip" ? 500 : 5000}
              max={mode === "sip" ? 200000 : 5000000}
              step={mode === "sip" ? 500 : 5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-[#0fa3b1]"
            />
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#8b90a3]">Duration (Years)</span>
              <span className="font-bold text-white">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#0fa3b1]"
            />
          </div>

          {/* Expected Return Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#8b90a3]">Expected Annual Return</span>
              <span className="font-bold text-[#06c8d9]">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={0.5}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-[#0fa3b1]"
            />
          </div>
        </div>

        {/* Results Cards & Trajectory Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Total Invested</span>
              <span className="text-xl font-black text-white mt-1 block">₹{simulation.totalInvested.toLocaleString()}</span>
            </div>
            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Wealth Gained</span>
              <span className="text-xl font-black text-[#00d084] mt-1 block">+₹{simulation.wealthGained.toLocaleString()}</span>
            </div>
            <div className="bento-card">
              <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">Projected Value</span>
              <span className="text-xl font-black text-[#06c8d9] mt-1 block">₹{simulation.finalBalance.toLocaleString()}</span>
            </div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
                Compound Trajectory: {calcType === "company" && stockData ? stockData.name : "Custom CAGR Strategy"}
              </span>
              <span className="text-xs font-bold text-[#06c8d9] bg-[#0fa3b1]/10 px-2.5 py-1 rounded-md">
                {years} Year Projection
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulation.trajectory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0fa3b1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0fa3b1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#8b90a3" fontSize={10} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis stroke="#8b90a3" fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161b22", borderColor: "#2d333b", borderRadius: "12px" }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Projected Value"]}
                  />
                  <Area type="monotone" dataKey="expected_value" stroke="#06c8d9" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}