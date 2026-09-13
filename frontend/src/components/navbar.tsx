"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchCompanies, TickerInfo } from "@/lib/api";
import {
  Menu,
  Search,
  Moon,
  Sun,
  Zap,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export default function Navbar({ onToggleSidebar, currentTheme = "dark", onThemeChange }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("marketmind_token");
    const storedUser = localStorage.getItem("marketmind_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser({ email: "user@marketmind.ai" });
      }
    } else if (token) {
      setUser({ email: "user@marketmind.ai" });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchCompanies(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    localStorage.setItem("marketmind_last_symbol", symbol);
    router.push(`/analysis?symbol=${encodeURIComponent(symbol)}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const cleanSym = query.trim().toUpperCase();
      localStorage.setItem("marketmind_last_symbol", cleanSym);
      router.push(`/analysis?symbol=${encodeURIComponent(cleanSym)}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("marketmind_token");
    localStorage.removeItem("marketmind_user");
    window.location.href = "/login";
  };

  const isLight = currentTheme === "light";
  const isDefault = currentTheme === "default";

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b shadow-xl transition-colors ${
      isLight ? "bg-white border-slate-200 text-slate-800" : isDefault ? "bg-[#0d131f] border-[#242f45] text-white" : "bg-[#070a0f] border-[#1b2230] text-white"
    }`}>
      <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
              isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:text-black" : "bg-[#0f1522] border-[#242f45] text-[#8b90a3] hover:text-white"
            }`}
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="text-lg font-black tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00e699] fill-[#00e699]" />
          MarketMind <span className="text-[#00e699]">AI</span>
        </Link>
      </div>

      <div className="relative w-64 sm:w-80 md:w-96" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8b90a3] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or name (e.g. AAPL, Reliance, TCS)..."
            className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs placeholder-[#8b90a3] focus:outline-none transition-all ${
              isLight
                ? "bg-slate-100 border border-slate-200 text-slate-900 focus:border-emerald-500"
                : "bg-[#0f1522] border border-[#242f45] text-white focus:border-[#00e699]"
            }`}
          />
        </form>

        {isOpen && results.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto backdrop-blur-2xl border ${
            isLight ? "bg-white border-slate-200" : "bg-[#0f1522] border-[#1b2230]"
          }`}>
            <div className={`px-3 py-2 border-b text-[10px] font-bold uppercase tracking-wider ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-[#070a0f] border-[#1b2230] text-[#8b90a3]"
            }`}>
              Matching Equities
            </div>
            {results.map((item) => (
              <button
                key={item.symbol}
                onClick={() => handleSelect(item.symbol)}
                className={`w-full text-left px-3.5 py-2.5 border-b last:border-0 flex items-center justify-between transition-colors group ${
                  isLight ? "hover:bg-slate-50 border-slate-100" : "hover:bg-[#161f30] border-[#1b2230]/50"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold transition-colors block ${isLight ? "text-slate-800 group-hover:text-emerald-600" : "text-white group-hover:text-[#00e699]"}`}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#00e699]">{item.symbol}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-[#070a0f] border-[#1b2230] text-[#8b90a3]"
                }`}>
                  {item.exchange}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher Options */}
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: "dark", label: "Dark", icon: Moon },
            { id: "light", label: "Light", icon: Sun },
            { id: "default", label: "Default", icon: Zap },
          ].map((t) => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onThemeChange && onThemeChange(t.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTheme === t.id
                    ? "bg-[#00e699] text-[#070a0f] shadow-sm font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00e699]/15 border border-[#00e699]/40 flex items-center justify-center text-xs font-black text-[#00e699]">
                {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "FE"}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-[#ff5366] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-[#8b90a3] hover:text-white transition-colors px-3 py-2 flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/register"
                className="text-xs font-extrabold text-[#070a0f] bg-[#00e699] hover:bg-[#00ffaa] px-5 py-2 rounded-full transition-all shadow-lg shadow-[#00e699]/20 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}