"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/" },
  { name: "Companies", href: "/companies" },
  { name: "Analysis", href: "/analysis" },
  { name: "Watchlist", href: "/watchlist" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Simulator", href: "/simulator" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("marketmind_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  // Do not display sidebar if user is not logged in
  if (!isAuthenticated) return null;

  return (
    <aside className="w-56 bg-[#0d1117] border-r border-[#2d333b] flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-4 space-y-6">
        <div className="px-3 py-2">
          <Link href="/" className="text-base font-black text-white tracking-tight">
            MarketMind <span className="text-[#06c8d9]">AI</span>
          </Link>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0fa3b1]/15 text-[#06c8d9] border border-[#0fa3b1]/30"
                    : "text-[#8b90a3] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}