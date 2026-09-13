"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchStockAnalysis } from "@/lib/api";
import {
  Zap,
  Calendar,
  Globe,
  Landmark,
  DollarSign,
  BarChart3,
  Users,
  TrendingDown,
  TrendingUp,
  Rocket,
  AlertTriangle,
  LineChart,
  PieChart,
  Activity,
  Trophy,
  Briefcase,
  Building2,
  Lightbulb,
  Monitor,
  ShieldAlert,
  BrainCircuit,
  Newspaper,
  CandlestickChart
} from "lucide-react";

interface TopAsset {
  rank: number;
  asset: string;
  sector: string;
  volume: string;
  trend: "up" | "down";
  pct: string;
}

const TOP_ASSETS_DATA: TopAsset[] = [
  { rank: 1, asset: "NVIDIA Corp. (NVDA)", sector: "Semiconductors", volume: "$ 45.2 B", trend: "up", pct: "+4.2%" },
  { rank: 2, asset: "Reliance Ind. (RELIANCE.NS)", sector: "Conglomerate", volume: "$ 12.4 B", trend: "up", pct: "+2.1%" },
  { rank: 3, asset: "Apple Inc. (AAPL)", sector: "Consumer Tech", volume: "$ 38.1 B", trend: "down", pct: "-1.1%" },
  { rank: 4, asset: "Tata Consultancy (TCS.NS)", sector: "Information Tech", volume: "$ 8.7 B", trend: "up", pct: "+1.5%" },
  { rank: 5, asset: "Tesla Inc. (TSLA)", sector: "Automotive", volume: "$ 28.5 B", trend: "down", pct: "-3.4%" },
];

function generateAnimatedLineChart(history: any[]): string {
  if (!history || history.length < 2) {
    return "M 0 80 L 50 60 L 100 70 L 150 40 L 200 55 L 250 20 L 300 35 L 350 10 L 400 25";
  }
  const prices = history.map((h) => Number(h.close || h.price || 0));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const width = 450;
  const height = 90;
  const padding = 10;

  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * width;
    const normalizedY = (price - minPrice) / priceRange;
    const y = height - padding - normalizedY * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(" L ")}`;
}

// ----------------------------------------------------------------------
// 1. MARKETMIND AI - PROFESSIONAL GLOBAL MACRO FINANCIAL DASHBOARD
// ----------------------------------------------------------------------
function AuthenticatedDashboardContent() {
  const router = useRouter();
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE.NS");
  const [timeframe, setTimeframe] = useState("YTD 2026");
  const [regionFilter, setRegionFilter] = useState("Global Markets");
  const [assetClass, setAssetClass] = useState("Equities");

  const [livePrice, setLivePrice] = useState<number>(1257.50);
  const [stockData, setStockData] = useState({
    name: "Reliance Industries Ltd.",
    symbol: "RELIANCE.NS",
    price: 1257.50,
    change: "+2.1%",
    priceHistory: [] as any[],
  });

  useEffect(() => {
    const loadStock = async () => {
      try {
        const res: any = await fetchStockAnalysis(selectedTicker);
        const o = res.overview || {};
        const currentPrice = o.current_price ?? res.current_price ?? 1257.50;
        setLivePrice(currentPrice);

        setStockData({
          name: res.name || selectedTicker,
          symbol: res.symbol || selectedTicker,
          price: currentPrice,
          change: "+2.1%",
          priceHistory: res.price_history || [],
        });
      } catch (err) {
        console.error("Failed to fetch stock analysis", err);
      }
    };
    loadStock();
  }, [selectedTicker]);

  const lineChartPath = generateAnimatedLineChart(stockData.priceHistory);

  return (
    <div className="bg-[#0b0f19] text-white min-h-screen p-3 sm:p-5 font-sans selection:bg-[#ffcc00] selection:text-black">
      
      {/* BRAND & GLOBAL FILTERS HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#ffcc00] text-black font-black px-3 py-1.5 rounded-lg text-lg tracking-tight shadow-md flex items-center gap-2">
            <Zap className="w-6 h-6 fill-black stroke-black" />
            <span>MarketMind</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">Global Macro Dashboard</h1>
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">Market Capitalization, Volume, and Global Investment Flow</p>
          </div>
        </div>

        {/* INTERACTIVE HEADER FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ffcc00]" />
            <span className="text-neutral-400">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="YTD 2026">YTD 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="1Y Trailing">1 Year Trailing</option>
            </select>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#ffcc00]" />
            <span className="text-neutral-400">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="Global Markets">Global Markets</option>
              <option value="North America">North America</option>
              <option value="APAC">APAC</option>
              <option value="EMEA">EMEA</option>
            </select>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#ffcc00]" />
            <span className="text-neutral-400">Asset Class:</span>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="Equities">Equities</option>
              <option value="Derivatives">Derivatives</option>
              <option value="Forex">Forex</option>
              <option value="Commodities">Commodities</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        
        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Market Cap</span>
            <DollarSign className="w-5 h-5 text-[#ffcc00]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            $ 115.4 T
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-auto">
            <span>↑ 2.4%</span> vs Last Month
          </div>
        </div>

        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>24H Global Volume</span>
            <BarChart3 className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            $ 845.2 B
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-auto">
            <span>↑ 5.2%</span> vs Last Week
          </div>
        </div>

        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Active Investors</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            1,245.8 M
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-auto">
            <span>↑ 1.1%</span> vs Last Month
          </div>
        </div>

        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Volatility (VIX)</span>
            <TrendingDown className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            14.2 <span className="text-xs text-neutral-400 font-normal">(Low)</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-auto">
            <span>↓ 5.4%</span> vs Last Week
          </div>
        </div>

        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Top Gainers Avg</span>
            <Rocket className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            + 6.7%
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-auto">
            <span>↑ 1.2%</span> vs Sector Avg
          </div>
        </div>

        <div className="bg-[#121826] border border-neutral-800 p-4 rounded-xl flex flex-col justify-between h-full shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Top Losers Avg</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-2">
            - 4.2%
          </div>
          <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-auto">
            <span>↓ 0.8%</span> vs Sector Avg
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION GRID: INDEX PERFORMANCE & SECTOR/COUNTRY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        
        {/* GLOBAL INDEX PERFORMANCE ANIMATED CHART */}
        <div className="lg:col-span-6 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-2.5 mb-2 gap-1">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#ffcc00]" />
              <span>Global Index Performance</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              All-Time High: <strong className="text-emerald-400">$ 117.2 T</strong> on 14 Aug 2026
            </span>
          </div>

          <div className="h-48 w-full bg-[#0b0f19] rounded-lg p-3 border border-neutral-800 flex flex-col justify-between flex-1 mt-1">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 450 90" preserveAspectRatio="none">
              <path
                d={lineChartPath}
                fill="none"
                stroke="#ffcc00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono border-t border-neutral-800 pt-2">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>
        </div>

        {/* MARKET CAP BY SECTOR DONUT */}
        <div className="lg:col-span-3 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="border-b border-neutral-800 pb-2.5 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#ffcc00]" />
              <span>Market Cap by Sector</span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-3 flex-1">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="32, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" strokeWidth="4" strokeDasharray="28, 100" strokeDashoffset="-32" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="18, 100" strokeDashoffset="-60" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="22, 100" strokeDashoffset="-78" />
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-[9px] text-neutral-400 uppercase font-bold leading-none">Total</span>
                <span className="text-xs font-black text-white font-mono mt-0.5">$115.4T</span>
              </div>
            </div>

            <div className="space-y-2 text-[11px] font-medium text-neutral-300">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" /> Technology (32%)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" /> Financials (28%)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" /> Healthcare (18%)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" /> Energy & Ind (22%)</div>
            </div>
          </div>
        </div>

        {/* MARKET CAP BY COUNTRY */}
        <div className="lg:col-span-3 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="border-b border-neutral-800 pb-2.5 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ffcc00]" />
              <span>Market Cap by Country</span>
            </span>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono flex-1 flex flex-col justify-center py-1">
            {[
              { country: "United States", val: "$ 52.4 T", w: "100%" },
              { country: "China", val: "$ 12.1 T", w: "35%" },
              { country: "Japan", val: "$ 6.2 T", w: "18%" },
              { country: "India", val: "$ 4.8 T", w: "14%" },
              { country: "United Kingdom", val: "$ 3.2 T", w: "9%" },
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-neutral-300 text-[10px] items-center">
                  <span>{c.country}</span>
                  <span className="font-bold text-[#ffcc00]">{c.val}</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded overflow-hidden">
                  <div className="bg-[#ffcc00] h-full rounded" style={{ width: c.w }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LOWER SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        
        {/* GLOBAL TRADING HEATMAP */}
        <div className="lg:col-span-4 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="border-b border-neutral-800 pb-2.5 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ffcc00]" />
              <span>Global Trading Heatmap</span>
            </span>
          </div>

          <div className="space-y-2.5 text-[10px] font-mono py-1 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-8 gap-1.5 text-neutral-400 font-bold text-center items-center">
              <span>Region</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="opacity-30">Sat</span><span className="opacity-30">Sun</span>
            </div>
            {[
              { region: "NY (US)", opacity: ["opacity-90", "opacity-100", "opacity-100", "opacity-80", "opacity-90", "opacity-10", "opacity-10"] },
              { region: "LND (EU)", opacity: ["opacity-70", "opacity-80", "opacity-90", "opacity-80", "opacity-70", "opacity-10", "opacity-10"] },
              { region: "TKY (APAC)", opacity: ["opacity-60", "opacity-70", "opacity-70", "opacity-60", "opacity-80", "opacity-10", "opacity-10"] },
              { region: "BOM (IN)", opacity: ["opacity-80", "opacity-90", "opacity-80", "opacity-100", "opacity-90", "opacity-10", "opacity-10"] },
            ].map((slot, idx) => (
              <div key={idx} className="grid grid-cols-8 gap-1.5 items-center">
                <span className="text-[9px] text-neutral-400 font-bold truncate">{slot.region}</span>
                {slot.opacity.map((op, oIdx) => (
                  <div key={oIdx} className={`h-5 bg-[#ffcc00] rounded ${op}`} />
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-2 border-t border-neutral-800/60 mt-1">
            <span>Low Vol</span>
            <div className="w-24 h-1.5 bg-gradient-to-r from-neutral-800 via-amber-500 to-[#ffcc00] rounded" />
            <span>High Vol</span>
          </div>
        </div>

        {/* TOP 5 GLOBAL EQUITIES BY VOLUME */}
        <div className="lg:col-span-5 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="border-b border-neutral-800 pb-2.5 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#ffcc00]" />
              <span>Top 5 Global Equities by Volume</span>
            </span>
          </div>

          <div className="space-y-1.5 text-xs flex-1 my-1">
            <div className="grid grid-cols-12 text-[10px] text-neutral-400 font-bold border-b border-neutral-900 pb-1.5 px-1">
              <span className="col-span-5">Asset</span>
              <span className="col-span-4">Sector</span>
              <span className="col-span-3 text-right">Volume</span>
            </div>
            {TOP_ASSETS_DATA.map((p) => {
              const tickerExtracted = p.asset.split("(")[1].replace(")", "");
              return (
                <div
                  key={p.rank}
                  onClick={() => setSelectedTicker(tickerExtracted)}
                  className={`grid grid-cols-12 items-center p-2 rounded cursor-pointer transition-all ${
                    selectedTicker === tickerExtracted ? "bg-[#ffcc00]/20 border border-[#ffcc00]" : "hover:bg-neutral-900/80"
                  }`}
                >
                  <span className="col-span-5 font-bold truncate text-[11px]">{p.rank}. {p.asset}</span>
                  <span className="col-span-4 text-neutral-400 text-[10px] truncate">{p.sector}</span>
                  <div className="col-span-3 text-right flex flex-col items-end justify-center">
                    <span className="font-mono font-bold text-[#ffcc00]">{p.volume}</span>
                    <span className={`text-[9px] font-bold ${p.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>{p.pct}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => router.push(`/analysis?symbol=${encodeURIComponent(selectedTicker)}`)}
            className="w-full py-2.5 mt-2 bg-[#ffcc00] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all shadow-md"
          >
            Execute Terminal Analysis ({selectedTicker}) →
          </button>
        </div>

        {/* PERFECTLY FITTED & PROPORTIONED INVESTOR DEMOGRAPHICS */}
        <div className="lg:col-span-3 bg-[#121826] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-full shadow-lg">
          <div className="border-b border-neutral-800 pb-2.5 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#ffcc00]" />
              <span>Investor Demographics</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 flex-1 space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="4.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeDasharray="72.4, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="27.6, 100" strokeDashoffset="-72.4" />
              </svg>
              <div className="absolute text-center flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-[11px] font-medium text-neutral-300 w-full px-2">
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" /> Institutional
                </span>
                <strong className="text-white font-mono">72.4%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" /> Retail
                </span>
                <strong className="text-white font-mono">27.6%</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER INSIGHTS BAR */}
      <div className="mt-4 bg-[#121826] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-300 gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#ffcc00]/20 text-[#ffcc00] rounded-lg">
            <Lightbulb className="w-5 h-5 text-[#ffcc00]" />
          </span>
          <span><strong>Key Insights:</strong> Technology sector drove 45% of global market gains this quarter. Indian markets showing highest YoY institutional inflow.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
          <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-neutral-400" /> Tech leads Sector</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-neutral-400" /> US leads Market Cap</span>
          <span className="flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-neutral-400" /> VIX remains low</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. LOGGED-OUT PUBLIC HOMEPAGE (REFINED SAAS LANDING EXPERIENCE)
// ----------------------------------------------------------------------
function PublicLandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#070a0f] overflow-hidden text-white font-sans selection:bg-[#00e699] selection:text-[#070a0f]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#00e699]/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-[#0066ff]/10 blur-[170px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-purple-600/10 blur-[170px] pointer-events-none rounded-full" />

      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 space-y-28 py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f1522] border border-[#1b2230] text-[11px] font-bold text-[#00e699] shadow-inner mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00e699] animate-pulse" />
            AI-Powered Market Intelligence Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Understand the Market. <br />
            <span className="text-[#00e699] bg-clip-text text-transparent bg-gradient-to-r from-[#00e699] via-emerald-300 to-teal-400">
              Analyze Smarter.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8b90a3] max-w-2xl mx-auto leading-relaxed font-medium">
            MarketMind AI brings market data, technical analysis, AI-powered insights, sentiment analysis, and risk intelligence together in one research platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-9 py-4 bg-[#00e699] hover:bg-[#00ffaa] text-[#070a0f] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#00e699]/20 transition-all hover:scale-105 cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("what-is-marketmind");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-9 py-4 bg-[#0f1522]/90 backdrop-blur-md border border-[#242f45] text-white font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer hover:border-[#00e699] transition-all"
            >
              Explore MarketMind AI
            </button>
          </div>

          <p className="text-[11px] font-medium text-[#8b90a3]/80 pt-2 tracking-wide">
            Built for smarter stock research — not financial advice.
          </p>
        </div>

        <div id="what-is-marketmind" className="bg-[#0f1522]/80 backdrop-blur-xl border border-[#1b2230] p-8 sm:p-12 rounded-3xl shadow-2xl text-center space-y-4 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e699]/5 rounded-full blur-2xl" />

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            One Platform for Smarter Market Research
          </h2>
          <p className="text-xs sm:text-sm text-[#8b90a3] max-w-2xl mx-auto leading-relaxed font-medium">
            MarketMind AI helps users research companies, understand market trends, analyze technical indicators, evaluate risk, explore financial sentiment, and use AI-powered analysis — all from one platform.
          </p>
        </div>

        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why MarketMind AI?
            </h2>
            <p className="text-xs text-[#8b90a3]">Streamline your analysis workflow in a single intelligence terminal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0f1522]/90 backdrop-blur-xl border border-[#1b2230] p-7 rounded-3xl space-y-3.5 shadow-xl hover:border-[#00e699]/40 transition-all group">
              <div className="w-11 h-11 rounded-2xl bg-[#00e699]/10 border border-[#00e699]/30 flex items-center justify-center text-[#00e699] font-bold text-lg group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-[#00e699]" />
              </div>
              <h3 className="text-base font-black text-white">Research Faster</h3>
              <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
                Find important company and market information in one place instead of switching between multiple tools.
              </p>
            </div>

            <div className="bg-[#0f1522]/90 backdrop-blur-xl border border-[#1b2230] p-7 rounded-3xl space-y-3.5 shadow-xl hover:border-[#0066ff]/40 transition-all group">
              <div className="w-11 h-11 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/30 flex items-center justify-center text-[#0066ff] font-bold text-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-[#0066ff]" />
              </div>
              <h3 className="text-base font-black text-white">Analyze More</h3>
              <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
                Combine market data, technical indicators, sentiment and AI models for a broader view of a company.
              </p>
            </div>

            <div className="bg-[#0f1522]/90 backdrop-blur-xl border border-[#1b2230] p-7 rounded-3xl space-y-3.5 shadow-xl hover:border-amber-400/40 transition-all group">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-lg group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-base font-black text-white">Understand Risk</h3>
              <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
                Look beyond potential returns with volatility, risk indicators and abnormal market behavior analysis.
              </p>
            </div>

            <div className="bg-[#0f1522]/90 backdrop-blur-xl border border-[#1b2230] p-7 rounded-3xl space-y-3.5 shadow-xl hover:border-purple-500/40 transition-all group">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg group-hover:scale-110 transition-transform">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-base font-black text-white">Make Data Easier to Understand</h3>
              <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
                Turn complex market information into clear charts, metrics and research insights.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1522]/90 backdrop-blur-xl border border-[#1b2230] p-8 sm:p-12 rounded-3xl shadow-2xl space-y-10 text-center relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">More Than Just a Stock Chart</h2>
            <p className="text-xs sm:text-sm text-[#8b90a3] max-w-xl mx-auto font-medium">
              MarketMind AI connects the pieces of market research in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono text-xs">
            {[
              { label: "Market Data", icon: <Globe className="w-6 h-6 text-[#00e699]" /> },
              { label: "Technical Analysis", icon: <CandlestickChart className="w-6 h-6 text-[#00e699]" /> },
              { label: "AI Models", icon: <BrainCircuit className="w-6 h-6 text-[#00e699]" /> },
              { label: "News & Sentiment", icon: <Newspaper className="w-6 h-6 text-[#00e699]" /> },
              { label: "Risk Intelligence", icon: <ShieldAlert className="w-6 h-6 text-[#00e699]" /> },
              { label: "Research Insights", icon: <Lightbulb className="w-6 h-6 text-[#00e699]" /> },
            ].map((node, idx) => (
              <div
                key={idx}
                className="bg-[#070a0f]/90 border border-[#242f45] hover:border-[#00e699]/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-all"
              >
                {node.icon}
                <span className="font-bold text-white text-[11px] text-center">{node.label}</span>
                <span className="text-[9px] text-[#00e699] font-mono font-bold">Step 0{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-6 bg-gradient-to-b from-[#0f1522] to-[#070a0f] border border-[#1b2230] p-10 sm:p-14 rounded-3xl shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white tracking-tight">Turn Market Data Into Market Intelligence.</h2>
          <p className="text-xs sm:text-sm text-[#8b90a3] max-w-md mx-auto font-medium leading-relaxed">
            Explore companies, understand market behavior, analyze risk and discover AI-powered insights with MarketMind AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-9 py-4 bg-[#00e699] hover:bg-[#00ffaa] text-[#070a0f] font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#00e699]/20 transition-all hover:scale-105 cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-9 py-4 bg-[#0f1522]/80 backdrop-blur-md border border-[#242f45] text-white font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer hover:border-[#00e699] transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. MAIN PAGE ROUTER (AUTHENTICATION SWITCH)
// ----------------------------------------------------------------------
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("marketmind_token");
    setIsLoggedIn(!!token);
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? (
    <Suspense fallback={<div className="text-xs text-[#8b90a3] p-8">Loading MarketMind Dashboard...</div>}>
      <AuthenticatedDashboardContent />
    </Suspense>
  ) : (
    <PublicLandingPage />
  );
}