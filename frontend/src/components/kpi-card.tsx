import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
}

export default function KPICard({ title, value, subtitle, change, changeLabel }: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bento-card flex flex-col justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">{title}</span>
      <div className="mt-3">
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            {isPositive && <TrendingUp className="w-3.5 h-3.5 text-[#00d084]" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5 text-[#ff5366]" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5 text-[#8b90a3]" />}
            <span
              className={`text-xs font-extrabold ${
                isPositive ? "text-[#00d084]" : isNegative ? "text-[#ff5366]" : "text-[#8b90a3]"
              }`}
            >
              {change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </span>
            {changeLabel && <span className="text-xs text-[#8b90a3] ml-1">{changeLabel}</span>}
          </div>
        )}
        {subtitle && <p className="text-xs text-[#8b90a3] mt-2 line-clamp-1">{subtitle}</p>}
      </div>
    </div>
  );
}