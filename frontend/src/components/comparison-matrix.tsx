"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface PeerItem {
  symbol: string;
  current_price: number;
  period_change_pct: number;
  volatility_pct: number;
  ai_score: number;
  cluster_label?: string;
}

interface ComparisonMatrixProps {
  peers: PeerItem[];
}

export default function ComparisonMatrix({ peers }: ComparisonMatrixProps) {
  if (!peers || peers.length === 0) return null;

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="p-4 bg-[#0d1117]/50 border-b border-[#2d333b]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
          Peer Group K-Means Clustering & Comparison
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0d1117] border-b border-[#2d333b] text-[#8b90a3] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Equity Ticker</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">6M Return</th>
              <th className="py-3.5 px-4">Volatility</th>
              <th className="py-3.5 px-4">MarketMind Score</th>
              <th className="py-3.5 px-4">Cluster Tier</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d333b]">
            {peers.map((peer) => (
              <tr key={peer.symbol} className="hover:bg-[#0d1117]/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">{peer.symbol}</td>
                <td className="py-3.5 px-4 font-bold text-white">
                  ₹{peer.current_price.toLocaleString()}
                </td>
                <td
                  className={`py-3.5 px-4 font-bold ${
                    peer.period_change_pct >= 0 ? "text-[#00d084]" : "text-[#ff5366]"
                  }`}
                >
                  {peer.period_change_pct >= 0 ? `+${peer.period_change_pct}%` : `${peer.period_change_pct}%`}
                </td>
                <td className="py-3.5 px-4 text-[#8b90a3] font-semibold">
                  {peer.volatility_pct}%
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-black text-[#06c8d9] bg-[#0fa3b1]/10 px-2 py-0.5 rounded border border-[#0fa3b1]/30">
                    {peer.ai_score} / 100
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#8b90a3] font-medium">
                  {peer.cluster_label || "Group Standard"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/analysis/${encodeURIComponent(peer.symbol)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#06c8d9] hover:underline"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}