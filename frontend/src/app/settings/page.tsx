"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  id?: number;
  full_name?: string;
  email?: string;
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [strategy, setStrategy] = useState("Balanced Growth");
  const [riskTolerance, setRiskTolerance] = useState("Moderate");
  const [currency, setCurrency] = useState("INR (₹)");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load logged-in user profile from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("marketmind_user");
    if (storedUser) {
      try {
        const parsed: UserProfile = JSON.parse(storedUser);
        setFullName(parsed.full_name || "");
        setEmail(parsed.email || "");
      } catch (err) {
        console.error("Failed to parse user profile session", err);
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Update stored session object
    const storedUser = localStorage.getItem("marketmind_user");
    let currentUser: UserProfile = storedUser ? JSON.parse(storedUser) : {};
    currentUser.full_name = fullName;
    currentUser.email = email;

    localStorage.setItem("marketmind_user", JSON.stringify(currentUser));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs text-[#8b90a3] mt-1">
          Manage user preferences, research engine profiles, and security defaults
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#00d084]/10 border border-[#00d084]/30 rounded-xl text-xs font-bold text-[#00d084]">
          ✓ Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* User Profile Card */}
        <div className="bento-card space-y-4">
          <div className="flex items-center gap-2 text-[#06c8d9]">
            <span className="text-sm">👤</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">User Profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@marketmind.ai"
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
              />
            </div>
          </div>
        </div>

        {/* AI Engine & Research Preferences */}
        <div className="bento-card space-y-4">
          <div className="flex items-center gap-2 text-[#06c8d9]">
            <span className="text-sm">🛡️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">Research & Engine Preferences</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Default Research Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
              >
                <option value="Balanced Growth">Balanced Growth</option>
                <option value="Momentum Alpha">Momentum Alpha</option>
                <option value="Value & Dividend">Value & Dividend</option>
                <option value="Risk Averse Capital Protection">Risk Averse Capital Protection</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Risk Tolerance Profile</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8b90a3] block mb-1">Base Currency Display</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="bento-card space-y-4">
          <div className="flex items-center gap-2 text-[#06c8d9]">
            <span className="text-sm">🔔</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications & Security</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#2d333b] rounded-xl">
            <div>
              <span className="text-xs font-bold text-white block">Email Market Signals & Alerts</span>
              <span className="text-[10px] text-[#8b90a3]">Receive daily technical breakout digests and risk warnings</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#0fa3b1]"
            />
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs rounded-xl transition-colors"
          >
            Save Account Settings
          </button>
        </div>
      </form>
    </div>
  );
}