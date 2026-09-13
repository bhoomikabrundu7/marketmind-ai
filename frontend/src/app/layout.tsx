"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("marketmind_theme");
    if (saved) setTheme(saved);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("marketmind_theme", newTheme);
  };

  const bgClass =
    theme === "light"
      ? "bg-[#f8fafc] text-slate-900"
      : theme === "default"
      ? "bg-[#0d131f] text-white"
      : "bg-[#070a0f] text-white";

  return (
    <html lang="en">
      <body className={`${bgClass} min-h-screen flex flex-col antialiased transition-colors`}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
        />

        <div className="flex flex-1 relative">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {/* Pass theme property down to children or wrapper */}
            <div data-theme={theme}>{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}