"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PriceSeriesPoint } from "@/lib/api";

interface PriceChartProps {
  data: PriceSeriesPoint[];
  height?: number;
}

export default function PriceChart({ data, height = 350 }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-[#8b90a3] text-sm">
        No price history available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0fa3b1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0fa3b1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#8b90a3" fontSize={11} tickLine={false} />
          <YAxis stroke="#8b90a3" fontSize={11} domain={["auto", "auto"]} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              borderColor: "#2d333b",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Area type="monotone" dataKey="close" stroke="#06c8d9" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}