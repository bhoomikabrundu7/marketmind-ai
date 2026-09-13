"use client";

import React from "react";
import { FeatureImportanceItem } from "@/lib/api";
import { BrainCircuit, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ExplainabilityCardProps {
  items: FeatureImportanceItem[];
}

export default function ExplainabilityCard({ items }: ExplainabilityCardProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const maxImpact = Math.max(
    ...items.map((i) => Math.abs(Number(i.impact) || 0)),
    0.0001
  );

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#06c8d9]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
            SHAP Model Explainability
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#8b90a3] bg-[#0d1117] border border-[#2d333b] px-2.5 py-1 rounded-md">
          Feature Drivers
        </span>
      </div>

      <p className="text-xs text-[#8b90a3] mb-4">
        Top market factors influencing the Random Forest price prediction output:
      </p>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const numImpact = Number(item.impact) || 0;
          const pct = Math.min((Math.abs(numImpact) / maxImpact) * 100, 100);
          const isPos = item.direction === "Positive";

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white flex items-center gap-1.5">
                  {isPos ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00d084]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#ff5366]" />
                  )}
                  {item.feature}
                </span>
                <span className={isPos ? "text-[#00d084]" : "text-[#ff5366]"}>
                  {numImpact > 0 ? `+${numImpact}` : numImpact}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden border border-[#2d333b]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPos ? "bg-[#00d084]" : "bg-[#ff5366]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}