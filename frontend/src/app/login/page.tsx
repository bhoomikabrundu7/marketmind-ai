"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed. Check credentials.");
      }

      localStorage.setItem("marketmind_token", data.access_token);
      localStorage.setItem("marketmind_user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Failed to reach backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bento-card p-8 space-y-6 bg-[#161b22] border border-[#2d333b] rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to MarketMind</h2>
          <p className="text-xs text-[#8b90a3] mt-1">Access saved portfolios, custom watchlists, and investment simulations</p>
        </div>

        {error && (
          <div className="p-3 bg-[#ff5366]/10 border border-[#ff5366]/30 rounded-xl text-xs font-bold text-[#ff5366]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#8b90a3] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@marketmind.ai"
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8b90a3] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0fa3b1]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Terminal"}
          </button>
        </form>

        <p className="text-xs text-center text-[#8b90a3]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#06c8d9] font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}