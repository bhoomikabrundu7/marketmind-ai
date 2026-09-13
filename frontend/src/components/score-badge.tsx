import React from "react";

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

export default function ScoreBadge({ score, label = "MarketMind Score" }: ScoreBadgeProps) {
  const getColor = (val: number) => {
    if (val >= 70) return "border-[#00d084] text-[#00d084] bg-[#00d084]/10";
    if (val >= 50) return "border-[#0fa3b1] text-[#06c8d9] bg-[#0fa3b1]/10";
    return "border-[#ff5366] text-[#ff5366] bg-[#ff5366]/10";
  };

  return (
    <div className="flex items-center gap-4 bg-[#161b22] border border-[#2d333b] rounded-2xl p-4">
      <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black ${getColor(score)}`}>
        {score}
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">{label}</span>
        <span className="text-sm font-bold text-white mt-0.5 block">
          {score >= 70 ? "Strong Research Signal" : score >= 50 ? "Constructive Signal" : "High Risk / Caution"}
        </span>
      </div>
    </div>
  );
}