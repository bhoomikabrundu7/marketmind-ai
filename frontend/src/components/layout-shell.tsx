"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Hide sidebar on public landing, login, and registration pages
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white antialiased">
      <Navbar onToggleSidebar={() => setIsOpen(!isOpen)} />
      <div className="flex flex-1">
        {!isPublicPage && <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}