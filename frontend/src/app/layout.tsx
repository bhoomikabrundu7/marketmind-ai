"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import "@/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hide sidebar completely on Landing Page, Login, and Register pages
  const isAuthOrLanding = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-white min-h-screen flex flex-col font-sans antialiased">
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="flex flex-1">
          {!isAuthOrLanding && (
            <Sidebar collapsed={sidebarCollapsed} />
          )}

          <main className="flex-1 p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}