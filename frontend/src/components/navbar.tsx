"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchCompanies, TickerInfo } from "@/lib/api";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("marketmind_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Live prefix search lookup
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

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#161b22]/90 backdrop-blur-xl border-b border-[#2d333b]/80 shadow-2xl">
      <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#0d1117] border border-[#2d333b] text-[#8b90a3] hover:text-white transition-colors"
            title="Toggle Navigation"
          >
            ☰
          </button>
        )}

        <Link href="/" className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06c8d9] animate-pulse" />
          MarketMind <span className="text-[#06c8d9]">AI</span>
        </Link>

        {/* Global Search Bar Engine */}
        <div className="relative w-72 md:w-96" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol or name (e.g. AA, Tata, Reliance)..."
              className="w-full bg-[#0d1117]/90 border border-[#2d333b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8b90a3] focus:outline-none focus:border-[#0fa3b1] transition-all"
            />
          </form>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#2d333b] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto backdrop-blur-2xl">
              <div className="px-3 py-2 bg-[#0d1117] border-b border-[#2d333b] text-[10px] font-bold text-[#8b90a3] uppercase tracking-wider">
                Matching Equities
              </div>
              {results.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#0d1117] border-b border-[#2d333b]/40 last:border-0 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#06c8d9] transition-colors block">
                      {item.name}
                    </span>
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
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0fa3b1]/20 border border-[#0fa3b1] flex items-center justify-center text-xs font-bold text-[#06c8d9]">
              {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-[#ff5366] hover:underline">
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-white bg-[#0d1117] hover:bg-[#2d333b] px-4 py-2 rounded-xl border border-[#2d333b] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold text-black bg-[#0fa3b1] hover:bg-[#06c8d9] px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#0fa3b1]/20"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}