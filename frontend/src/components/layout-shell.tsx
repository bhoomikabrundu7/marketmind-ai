"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Hide sidebar on public landing, login, and registration pages
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white antialiased">
      <Navbar onToggleSidebar={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1">
        {!isPublicPage && <Sidebar collapsed={collapsed} />}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}