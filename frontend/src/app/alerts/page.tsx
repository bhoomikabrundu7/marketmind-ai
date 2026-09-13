"use client";

import { useState } from "react";

interface AlertItem {
  id: number;
  symbol: string;
  condition: string;
  targetPrice: number;
  status: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, symbol: "AAPL", condition: "Price Above", targetPrice: 240, status: "Active" },
    { id: 2, symbol: "TATAMOTORS.NS", condition: "Price Below", targetPrice: 900, status: "Active" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState("Price Above");
  const [targetPrice, setTargetPrice] = useState("");

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;

    const newAlert: AlertItem = {
      id: Date.now(),
      symbol: symbol.trim().toUpperCase(),
      condition,
      targetPrice: parseFloat(targetPrice),
      status: "Active",
    };

    setAlerts([...alerts, newAlert]);
    setSymbol("");
    setTargetPrice("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Price & Volatility Alerts</h1>
          <p className="text-xs text-[#8b90a3] mt-1">Configure automated notifications for technical breakouts and risk events</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs px-4 py-2 rounded-xl transition-colors"
        >
          + Create Custom Alert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((a) => (
          <div key={a.id} className="bento-card flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-white block">{a.symbol}</span>
              <span className="text-xs text-[#8b90a3] block">
                {a.condition}: ₹{a.targetPrice.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#00d084] bg-[#00d084]/10 border border-[#00d084]/30 px-2 py-1 rounded-md">
              {a.status}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Create Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#2d333b] p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">New Custom Alert</h3>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8b90a3] block mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. NVDA, TCS.NS"
                  className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8b90a3] block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Price Above">Price Above</option>
                  <option value="Price Below">Price Below</option>
                  <option value="RSI Overbought (>70)">RSI Overbought (&gt;70)</option>
                  <option value="RSI Oversold (<30)">RSI Oversold (&lt;30)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8b90a3] block mb-1">Target Price / Threshold</label>
                <input
                  type="number"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#0d1117] text-[#8b90a3] text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0fa3b1] text-black text-xs font-bold rounded-xl"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}