"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calculator,
  Building2,
  ArrowUpRight,
  Zap,
  Activity,
  Layers
} from "lucide-react";

interface StockBacktestPreset {
  symbol: string;
  name: string;
  historicalCAGR: number;
  marketCap: string;
  category: string;
}

const STOCK_PRESETS: StockBacktestPreset[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", historicalCAGR: 48.5, marketCap: "$3.12 T", category: "Global Tech / AI" },
  { symbol: "RELIANCE.NS", name: "Reliance Ind.", historicalCAGR: 18.2, marketCap: "₹17.2 T", category: "Domestic Conglomerate" },
  { symbol: "AAPL", name: "Apple Inc.", historicalCAGR: 24.8, marketCap: "$3.42 T", category: "Consumer Tech" },
  { symbol: "TCS.NS", name: "Tata Consultancy", historicalCAGR: 15.6, marketCap: "₹15.1 T", category: "IT Services" },
  { symbol: "MSFT", name: "Microsoft Corp.", historicalCAGR: 26.4, marketCap: "$3.25 T", category: "Cloud & Software" },
];

export default function InvestmentSimulatorPage() {
  const router = useRouter();

  // Mode Selection
  const [simulatorMode, setSimulatorMode] = useState<"generic" | "backtest">("generic");
  const [investmentType, setInvestmentType] = useState<"sip" | "lump">("sip");

  // Input States
  const [monthlyAmount, setMonthlyAmount] = useState<number>(10000);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(100000);
  const [durationYears, setDurationYears] = useState<number>(10);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [selectedStock, setSelectedStock] = useState<StockBacktestPreset>(STOCK_PRESETS[0]);

  // Hover Tooltip State for SVG Chart
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; invested: number; value: number; x: number; y: number } | null>(null);

  // Determine active rate based on simulator mode
  const activeRate = simulatorMode === "backtest" ? selectedStock.historicalCAGR : expectedReturnRate;

  // COMPOUND MATHEMATICAL TRAJECTORY ENGINE
  const trajectoryData = useMemo(() => {
    const points: { year: number; invested: number; totalValue: number; wealthGained: number }[] = [];
    const r = activeRate / 100;

    if (investmentType === "sip") {
      const p = monthlyAmount;
      const monthlyRate = r / 12;

      for (let y = 1; y <= durationYears; y++) {
        const n = y * 12;
        // Accurate Monthly SIP Compound Formula: P * [((1 + i)^n - 1) / i] * (1 + i)
        const totalValue = p * (((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate));
        const invested = p * n;
        const wealthGained = Math.max(0, totalValue - invested);

        points.push({
          year: y,
          invested: Math.round(invested),
          totalValue: Math.round(totalValue),
          wealthGained: Math.round(wealthGained),
        });
      }
    } else {
      const p = lumpSumAmount;
      for (let y = 1; y <= durationYears; y++) {
        // Accurate Lump Sum Formula: P * (1 + r)^y
        const totalValue = p * Math.pow(1 + r, y);
        const invested = p;
        const wealthGained = Math.max(0, totalValue - invested);

        points.push({
          year: y,
          invested: Math.round(invested),
          totalValue: Math.round(totalValue),
          wealthGained: Math.round(wealthGained),
        });
      }
    }

    const finalResult = points[points.length - 1] || { invested: 0, totalValue: 0, wealthGained: 0 };
    return { points, finalResult };
  }, [investmentType, monthlyAmount, lumpSumAmount, durationYears, activeRate]);

  // SVG CHART PATH CALCULATOR
  const svgChart = useMemo(() => {
    const pts = trajectoryData.points;
    if (!pts.length) return { pathString: "", areaString: "", investedPathString: "", yMax: 1, pointsMapped: [] };

    const svgW = 750;
    const svgH = 260;
    const padX = 20;
    const padY = 25;

    const maxVal = Math.max(...pts.map((d) => d.totalValue)) * 1.05;

    const pointsMapped = pts.map((d, idx) => {
      const x = padX + (idx / (pts.length - 1 || 1)) * (svgW - 2 * padX);
      const y = svgH - padY - (d.totalValue / maxVal) * (svgH - 2 * padY);
      const yInv = svgH - padY - (d.invested / maxVal) * (svgH - 2 * padY);
      return { x, y, yInv, ...d };
    });

    const pathString = "M " + pointsMapped.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
    const investedPathString = "M " + pointsMapped.map((p) => `${p.x.toFixed(1)},${p.yInv.toFixed(1)}`).join(" L ");
    
    const firstX = pointsMapped[0].x.toFixed(1);
    const lastX = pointsMapped[pointsMapped.length - 1].x.toFixed(1);
    const bottomY = (svgH - padY).toFixed(1);

    const areaString = `${pathString} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    return { pathString, areaString, investedPathString, yMax: maxVal, pointsMapped };
  }, [trajectoryData]);

  return (
    <div className="space-y-6 bg-[#070a0f] min-h-screen text-white font-sans selection:bg-[#00e699] selection:text-[#070a0f]">
      
      {/* PAGE HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b2230] pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-[#00e699]" />
            Investment Simulator
          </h1>
          <p className="text-xs text-[#8b90a3] mt-1 font-medium">
            Compound wealth growth projection modeler & company stock backtester
          </p>
        </div>

        {/* TOP RIGHT MAIN MODE SWITCHER */}
        <div className="flex items-center bg-[#0f1522] p-1.5 rounded-2xl border border-[#242f45] text-xs font-mono shrink-0 shadow-lg">
          <button
            onClick={() => setSimulatorMode("generic")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              simulatorMode === "generic"
                ? "bg-[#00e699] text-[#070a0f] font-black shadow-md shadow-[#00e699]/20"
                : "text-[#8b90a3] hover:text-white"
            }`}
          >
            Generic Growth Calculator
          </button>
          <button
            onClick={() => setSimulatorMode("backtest")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              simulatorMode === "backtest"
                ? "bg-[#00e699] text-[#070a0f] font-black shadow-md shadow-[#00e699]/20"
                : "text-[#8b90a3] hover:text-white"
            }`}
          >
            Company Stock Backtest
          </button>
        </div>
      </div>

      {/* TOP 3 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* TOTAL INVESTED */}
        <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b90a3] text-[10px] font-extrabold uppercase tracking-widest">
            <span>Total Invested</span>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono my-3 tracking-tight">
            ₹{trajectoryData.finalResult.invested.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#8b90a3] font-medium">
            Principal capital deployed over {durationYears} years
          </div>
        </div>

        {/* WEALTH GAINED */}
        <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b90a3] text-[10px] font-extrabold uppercase tracking-widest">
            <span>Wealth Gained</span>
            <TrendingUp className="w-5 h-5 text-[#00e699]" />
          </div>
          <div className="text-3xl font-black text-[#00e699] font-mono my-3 tracking-tight">
            +₹{trajectoryData.finalResult.wealthGained.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#00e699] font-bold">
            ▲ Net compound growth profit generated
          </div>
        </div>

        {/* PROJECTED VALUE */}
        <div className="bg-[#0f1522] border border-[#1b2230] p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b90a3] text-[10px] font-extrabold uppercase tracking-widest">
            <span>Projected Value</span>
            <DollarSign className="w-5 h-5 text-[#ffcc00]" />
          </div>
          <div className="text-3xl font-black text-white font-mono my-3 tracking-tight">
            ₹{trajectoryData.finalResult.totalValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#ffcc00] font-bold">
            Maturity evaluation at {activeRate}% annual CAGR
          </div>
        </div>

      </div>

      {/* MAIN CONTENT WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: SIMULATION PARAMETERS CONTROL CARD */}
        <div className="lg:col-span-4 bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-[#1b2230] pb-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00e699]" />
              Simulation Parameters
            </span>
          </div>

          {/* SIP vs Lump Sum Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#070a0f] p-1.5 rounded-2xl border border-[#242f45] text-xs font-mono">
            <button
              onClick={() => setInvestmentType("sip")}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                investmentType === "sip"
                  ? "bg-[#00e699] text-[#070a0f] font-black"
                  : "text-[#8b90a3] hover:text-white"
              }`}
            >
              Monthly SIP
            </button>
            <button
              onClick={() => setInvestmentType("lump")}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                investmentType === "lump"
                  ? "bg-[#00e699] text-[#070a0f] font-black"
                  : "text-[#8b90a3] hover:text-white"
              }`}
            >
              Lump Sum
            </button>
          </div>

          {/* SLIDER 1: Investment Amount */}
          {investmentType === "sip" ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8b90a3]">Monthly Investment</span>
                <span className="font-bold text-white">₹{monthlyAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="500"
                max="200000"
                step="500"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full accent-[#00e699] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8b90a3]">Lump Sum Investment</span>
                <span className="font-bold text-white">₹{lumpSumAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="5000000"
                step="5000"
                value={lumpSumAmount}
                onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                className="w-full accent-[#00e699] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* SLIDER 2: Duration */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8b90a3]">Duration (Years)</span>
              <span className="font-bold text-white">{durationYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              className="w-full accent-[#00e699] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* MODE SPECIFIC CONTROLS */}
          {simulatorMode === "generic" ? (
            /* SLIDER 3: Expected Annual Return */
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8b90a3]">Expected Annual Return</span>
                <span className="font-bold text-[#00e699]">{expectedReturnRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="0.5"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full accent-[#00e699] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
              />
            </div>
          ) : (
            /* STOCK BACKTEST SELECTOR */
            <div className="space-y-3 pt-1 border-t border-[#1b2230]">
              <span className="text-xs font-bold text-[#8b90a3] uppercase block">
                Select Benchmark Asset
              </span>
              <div className="space-y-2">
                {STOCK_PRESETS.map((stk) => (
                  <div
                    key={stk.symbol}
                    onClick={() => setSelectedStock(stk)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                      selectedStock.symbol === stk.symbol
                        ? "bg-[#00e699]/15 border-[#00e699] text-white"
                        : "bg-[#070a0f] border-[#242f45] text-[#8b90a3] hover:border-white/30"
                    }`}
                  >
                    <div>
                      <strong className="text-white block font-sans text-xs">{stk.name}</strong>
                      <span className="text-[10px] text-[#00e699]">{stk.symbol}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#ffcc00] block">+{stk.historicalCAGR}% CAGR</span>
                      <span className="text-[9px] text-[#8b90a3]">{stk.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BREAKDOWN ALLOCATION MATRIX */}
          <div className="bg-[#070a0f] border border-[#242f45] p-4 rounded-2xl space-y-3 text-xs font-mono">
            <span className="text-[10px] font-bold text-[#8b90a3] uppercase block">
              Asset Allocation Ratio
            </span>
            <div className="w-full bg-[#1b2230] h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{
                  width: `${(
                    (trajectoryData.finalResult.invested / (trajectoryData.finalResult.totalValue || 1)) *
                    100
                  ).toFixed(1)}%`,
                }}
              />
              <div
                className="bg-[#00e699] h-full transition-all duration-500"
                style={{
                  width: `${(
                    (trajectoryData.finalResult.wealthGained / (trajectoryData.finalResult.totalValue || 1)) *
                    100
                  ).toFixed(1)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] pt-1">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Invested (
                {(
                  (trajectoryData.finalResult.invested / (trajectoryData.finalResult.totalValue || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
              <span className="flex items-center gap-1.5 text-[#00e699]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e699]" /> Wealth Gained (
                {(
                  (trajectoryData.finalResult.wealthGained / (trajectoryData.finalResult.totalValue || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ANIMATED REALISTIC COMPOUND TRAJECTORY CHART */}
        <div className="lg:col-span-8 bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between border-b border-[#1b2230] pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00e699]" />
              Compound Trajectory: {simulatorMode === "backtest" ? `${selectedStock.name} (${selectedStock.symbol})` : "Custom CAGR Strategy"}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#00e699] bg-[#00e699]/10 border border-[#00e699]/30 px-2.5 py-1 rounded-md">
              {durationYears} Year Projection
            </span>
          </div>

          {/* DYNAMIC SVG ANIMATED GRAPH */}
          <div className="relative h-72 w-full bg-[#070a0f] rounded-2xl border border-[#242f45] p-4 flex flex-col justify-between overflow-hidden">
            
            <svg className="w-full h-full overflow-visible" viewBox="0 0 750 260" preserveAspectRatio="none">
              <defs>
                <linearGradient id="simAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e699" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00e699" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Horizontal Grid lines */}
              <line x1="0" y1="45" x2="750" y2="45" stroke="#1f293d" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="115" x2="750" y2="115" stroke="#1f293d" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="185" x2="750" y2="185" stroke="#1f293d" strokeWidth="1" strokeDasharray="4 4" />

              {/* Gradient Area Fill under projected trajectory */}
              {svgChart.areaString && (
                <path d={svgChart.areaString} fill="url(#simAreaGrad)" className="transition-all duration-500" />
              )}

              {/* Baseline Invested Principal Path */}
              {svgChart.investedPathString && (
                <path
                  d={svgChart.investedPathString}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  className="transition-all duration-500 opacity-60"
                />
              )}

              {/* Main Projected Compound Growth Path */}
              {svgChart.pathString && (
                <path
                  d={svgChart.pathString}
                  fill="none"
                  stroke="#00e699"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )}

              {/* Interactive Data Dots along the path */}
              {svgChart.pointsMapped.map((pt) => (
                <g key={pt.year} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#00e699"
                    stroke="#070a0f"
                    strokeWidth="2"
                    className="transition-all hover:scale-150"
                    onMouseEnter={() => setHoveredPoint({ year: pt.year, invested: pt.invested, value: pt.totalValue, x: pt.x, y: pt.y })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 bg-[#0f1522] border border-[#00e699] p-3 rounded-xl shadow-2xl pointer-events-none text-xs font-mono space-y-1 transform -translate-x-1/2 -translate-y-full"
                style={{ left: `${(hoveredPoint.x / 750) * 100}%`, top: `${(hoveredPoint.y / 260) * 100}%` }}
              >
                <div className="font-bold text-white border-b border-[#242f45] pb-1">Year {hoveredPoint.year} Projection</div>
                <div className="text-blue-400">Invested: ₹{hoveredPoint.invested.toLocaleString("en-IN")}</div>
                <div className="text-[#00e699]">Total Value: ₹{hoveredPoint.value.toLocaleString("en-IN")}</div>
              </div>
            )}

            {/* X-AXIS YEAR TICK LABELS */}
            <div className="flex justify-between text-[10px] text-[#8b90a3] font-mono border-t border-[#1b2230] pt-2">
              {trajectoryData.points.map((p) => (
                <span key={p.year}>Yr {p.year}</span>
              ))}
            </div>
          </div>

          {/* BOTTOM DETAILED YEARLY PROJECTION TABLE */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#8b90a3] uppercase block tracking-wider">
              Yearly Milestones Breakdown
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {[1, Math.ceil(durationYears / 2), durationYears].map((yrIndex) => {
                const milestone = trajectoryData.points.find((p) => p.year === yrIndex);
                if (!milestone) return null;
                return (
                  <div key={yrIndex} className="bg-[#070a0f] border border-[#242f45] p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#8b90a3] block">Year {milestone.year}</span>
                    <span className="text-[#00e699] font-black block">₹{milestone.totalValue.toLocaleString("en-IN")}</span>
                    <span className="text-[9px] text-blue-400 block">Inv: ₹{milestone.invested.toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
              <div className="bg-[#070a0f] border border-[#00e699]/30 p-3 rounded-2xl space-y-1 flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold text-[#00e699] block">CAGR Target</span>
                <span className="text-white font-black text-sm">{activeRate}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}