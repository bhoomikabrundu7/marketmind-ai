"use client";

import React from "react";

interface RiskGaugeProps {
  label: string;
  score: number; // 0 to 100
}

export default function RiskGauge({ label, score }: RiskGaugeProps) {
  // Map 0-100 score to -65deg to +65deg needle rotation
  const angle = -65 + (Math.min(Math.max(score, 0), 100) * 1.3);

  const getRiskColor = (s: number) => {
    if (s < 30) return "text-[#00d084]";
    if (s < 60) return "text-[#ffb81c]";
    return "text-[#ff5366]";
  };

  return (
    <div className="bento-card flex flex-col items-center justify-center text-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] self-start mb-2">
        Riskometer Gauge
      </span>

      <div className="relative w-52 h-26 overflow-hidden mt-2">
        {/* Arc Background */}
        <div className="w-52 h-52 rounded-full border-[14px] border-t-[#00d084] border-r-[#ff5366] border-b-[#ff5366] border-l-[#ffb81c] rotate-45" />

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-white rounded-full origin-bottom -translate-x-1/2 transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />

        {/* Needle Center Pin */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-white -translate-x-1/2 translate-y-1/2 border-2 border-[#161b22]" />
      </div>

      <div className="flex justify-between w-48 text-[10px] font-bold text-[#8b90a3] mt-2">
        <span>LOW</span>
        <span>MODERATE</span>
        <span>HIGH</span>
      </div>

      <div className="mt-3">
        <span className={`text-base font-black tracking-tight ${getRiskColor(score)}`}>
          {label.toUpperCase()} RISK
        </span>
        <span className="text-[10px] text-[#8b90a3] block mt-0.5">
          Risk Index: {score} / 100
        </span>
      </div>
    </div>
  );
}