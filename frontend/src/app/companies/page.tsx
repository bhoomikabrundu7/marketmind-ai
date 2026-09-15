"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  TrendingUp,
  Check,
  Plus,
  Zap,
  Globe,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

interface CompanyItem {
  symbol: string;
  name: string;
  exchange: "NYSE" | "NASDAQ" | "NSE";
  category: "us" | "nse";
  sector: string;
  marketCap: string;
  price: string;
  changePct: string;
  isPositive: boolean;
  aiSignal: "STRONG BUY" | "BUY" | "HOLD" | "SELL";
  aiScore: number;
  logoUrl: string;
}

const COMPANY_DIRECTORY: CompanyItem[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    category: "us",
    sector: "Semiconductors & AI",
    marketCap: "$ 3.12 T",
    price: "$ 125.40",
    changePct: "+4.2%",
    isPositive: true,
    aiSignal: "STRONG BUY",
    aiScore: 94,
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    category: "us",
    sector: "Consumer Electronics",
    marketCap: "$ 3.42 T",
    price: "$ 230.50",
    changePct: "-1.1%",
    isPositive: false,
    aiSignal: "BUY",
    aiScore: 88,
    logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    category: "us",
    sector: "Cloud & Enterprise AI",
    marketCap: "$ 3.25 T",
    price: "$ 448.90",
    changePct: "+2.8%",
    isPositive: true,
    aiSignal: "STRONG BUY",
    aiScore: 91,
    logoUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Ltd.",
    exchange: "NSE",
    category: "nse",
    sector: "Conglomerate & Energy",
    marketCap: "₹ 17.2 T",
    price: "₹ 1,257.50",
    changePct: "+2.1%",
    isPositive: true,
    aiSignal: "BUY",
    aiScore: 86,
    logoUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    category: "us",
    sector: "E-Commerce & AWS",
    marketCap: "$ 2.05 T",
    price: "$ 186.20",
    changePct: "+1.9%",
    isPositive: true,
    aiSignal: "BUY",
    aiScore: 87,
    logoUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. (Google)",
    exchange: "NASDAQ",
    category: "us",
    sector: "Search & Cloud Infrastructure",
    marketCap: "$ 2.22 T",
    price: "$ 178.50",
    changePct: "+0.4%",
    isPositive: true,
    aiSignal: "HOLD",
    aiScore: 78,
    logoUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    exchange: "NSE",
    category: "nse",
    sector: "IT Services & Consulting",
    marketCap: "₹ 15.1 T",
    price: "₹ 4,210.00",
    changePct: "+1.5%",
    isPositive: true,
    aiSignal: "BUY",
    aiScore: 84,
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    category: "us",
    sector: "Automotive & Clean Energy",
    marketCap: "$ 780 B",
    price: "$ 245.10",
    changePct: "-3.4%",
    isPositive: false,
    aiSignal: "HOLD",
    aiScore: 72,
    logoUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "ADANIENT.NS",
    name: "Adani Enterprises Ltd.",
    exchange: "NSE",
    category: "nse",
    sector: "Infrastructure & Mining",
    marketCap: "₹ 3.6 T",
    price: "₹ 3,140.00",
    changePct: "+0.8%",
    isPositive: true,
    aiSignal: "HOLD",
    aiScore: 75,
    logoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    exchange: "NSE",
    category: "nse",
    sector: "Digital Services & IT",
    marketCap: "₹ 7.8 T",
    price: "₹ 1,890.00",
    changePct: "+1.2%",
    isPositive: true,
    aiSignal: "BUY",
    aiScore: 83,
    logoUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "AA",
    name: "Alcoa Corporation",
    exchange: "NYSE",
    category: "us",
    sector: "Metals & Aluminum Mining",
    marketCap: "$ 7.8 B",
    price: "$ 42.50",
    changePct: "-0.5%",
    isPositive: false,
    aiSignal: "HOLD",
    aiScore: 68,
    logoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop"
  },
  {
    symbol: "AAL",
    name: "American Airlines Group Inc.",
    exchange: "NASDAQ",
    category: "us",
    sector: "Aviation & Transport",
    marketCap: "$ 9.2 B",
    price: "$ 14.10",
    changePct: "-1.8%",
    isPositive: false,
    aiSignal: "HOLD",
    aiScore: 65,
    logoUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=200&auto=format&fit=crop"
  }
];

export default function CompanyDirectoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "nse" | "us">("all");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load user watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("marketmind_watchlist");
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    }
  }, []);

  const toggleWatchlist = (symbol: string) => {
    const updated = watchlist.includes(symbol)
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];

    setWatchlist(updated);
    localStorage.setItem("marketmind_watchlist", JSON.stringify(updated));
  };

  const handleLaunchTerminal = (symbol: string) => {
    localStorage.setItem("marketmind_last_symbol", symbol);
    router.push(`/analysis?symbol=${encodeURIComponent(symbol)}`);
  };

  const filteredCompanies = COMPANY_DIRECTORY.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "nse" && item.category === "nse") ||
      (activeTab === "us" && item.category === "us");

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 bg-[#070a0f] min-h-screen text-white font-sans selection:bg-[#00e699] selection:text-[#070a0f]">
      
      {/* HEADER TITLE BANNER */}
      <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e699]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e699]/10 border border-[#00e699]/30 text-[10px] font-extrabold text-[#00e699] uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          Market Coverage
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">Company Directory & Ticker Hub</h1>
        <p className="text-xs text-[#8b90a3] max-w-2xl leading-relaxed font-medium">
          Explore covered equities across global and domestic exchanges with real-time AI decision signals, market cap evaluation, and direct terminal analysis integration.
        </p>
      </div>

      {/* SEARCH BAR & FILTER TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f1522] border border-[#1b2230] p-4 rounded-2xl shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8b90a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name or ticker (e.g. Tata, Reliance, AAPL)..."
            className="w-full bg-[#070a0f] border border-[#242f45] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#00e699] transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-[#070a0f] p-1.5 rounded-xl border border-[#242f45] text-xs font-mono">
          {[
            { id: "all", label: "All Markets" },
            { id: "nse", label: "NSE (India)" },
            { id: "us", label: "US Equities" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#00e699] text-[#070a0f] font-black shadow-md shadow-[#00e699]/20"
                  : "text-[#8b90a3] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPANY CARDS GRID */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-[#0f1522] border border-[#1b2230] p-12 rounded-3xl text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#8b90a3] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No Matching Companies Found</h3>
          <p className="text-xs text-[#8b90a3]">Try adjusting your search query or market filter tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((comp) => {
            const isSaved = watchlist.includes(comp.symbol);

            return (
              <div
                key={comp.symbol}
                className="bg-[#0f1522] border border-[#1b2230] hover:border-[#00e699]/40 p-5 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e699]/5 rounded-full blur-2xl group-hover:bg-[#00e699]/10 transition-colors pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[#242f45] group-hover:border-[#00e699]/50 transition-colors shadow-inner relative bg-[#070a0f] shrink-0">
                        <img
                          src={comp.logoUrl}
                          alt={comp.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-[#00e699] transition-colors line-clamp-1">
                          {comp.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-[#00e699] tracking-wider block">
                          {comp.symbol}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#070a0f] border border-[#242f45] text-[#8b90a3]">
                      {comp.exchange}
                    </span>
                  </div>

                  {/* Sector Tag & AI Signal Badge */}
                  <div className="flex items-center justify-between gap-2 border-y border-[#1b2230]/70 py-2.5 text-xs font-mono">
                    <span className="text-[10px] text-[#8b90a3] truncate font-medium max-w-[150px]">
                      {comp.sector}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        comp.aiSignal === "STRONG BUY" || comp.aiSignal === "BUY"
                          ? "bg-[#00e699]/10 text-[#00e699] border-[#00e699]/30"
                          : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {comp.aiSignal} ({comp.aiScore})
                    </span>
                  </div>

                  {/* Real-World Price & Market Cap Data */}
                  <div className="grid grid-cols-2 gap-2 bg-[#070a0f] p-3 rounded-2xl border border-[#1b2230]">
                    <div>
                      <span className="text-[9px] text-[#8b90a3] uppercase font-bold block">Current Price</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-white font-mono">{comp.price}</span>
                        <span className={`text-[9px] font-bold ${comp.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {comp.changePct}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-[#8b90a3] uppercase font-bold block">Market Cap</span>
                      <span className="text-xs font-black text-[#ffcc00] font-mono mt-0.5 block">
                        {comp.marketCap}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action Buttons */}
                <div className="flex items-center gap-2 pt-4 mt-2 border-t border-[#1b2230]/50 relative z-10">
                  <button
                    onClick={() => handleLaunchTerminal(comp.symbol)}
                    className="flex-1 py-2.5 px-3 bg-[#070a0f] hover:bg-[#00e699] text-[#8b90a3] hover:text-[#070a0f] border border-[#242f45] hover:border-[#00e699] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn shadow-md"
                  >
                    <span>Launch Terminal</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => toggleWatchlist(comp.symbol)}
                    title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      isSaved
                        ? "bg-[#00e699] border-[#00e699] text-[#070a0f]"
                        : "bg-[#070a0f] border-[#242f45] text-[#8b90a3] hover:text-white hover:border-white/30"
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
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