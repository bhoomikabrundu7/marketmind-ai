"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Star,
  Briefcase,
  Gamepad2
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Terminal Overview", href: "/", icon: LayoutDashboard },
    { name: "Company Directory", href: "/companies", icon: Building2 },
    { name: "Stock Analysis", href: "/analysis", icon: TrendingUp },
    { name: "My Watchlist", href: "/watchlist", icon: Star },
    { name: "Portfolio Hub", href: "/portfolio", icon: Briefcase },
    { name: "AI Simulator", href: "/simulator", icon: Gamepad2 },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Background Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar Navigation Drawer */}
      <aside className="fixed lg:relative top-0 left-0 z-50 w-64 bg-[#070a0f] border-r border-[#1b2230] h-full min-h-screen p-4 flex flex-col justify-between flex-shrink-0 shadow-2xl transition-all">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#1b2230]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e699]">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="text-[#8b90a3] hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-[#0f1522] border border-[#242f45] cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#00e699] text-[#070a0f] shadow-lg shadow-[#00e699]/20 font-black"
                      : "text-[#8b90a3] hover:text-white hover:bg-[#0f1522]"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-[#0f1522] border border-[#1b2230] rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e699] animate-pulse" />
            <span className="text-[11px] font-bold text-white">Engine Status</span>
          </div>
          <p className="text-[10px] text-[#8b90a3]">
            ML Random Forest & NLP Sentiment Feeds Active
          </p>
        </div>
      </aside>
    </>
  );
}