"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "otp">("details");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Request OTP from FastAPI
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send verification code.");

      setSuccessMsg(`OTP sent to ${email}. Check your terminal logs or inbox.`);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Could not reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) {
      setError("Please enter the 6-digit verification OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch("http://127.0.0.1:8000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpInput }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.detail || "Invalid verification code.");

      // 2. Complete Account Registration
      const regRes = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username: username.startsWith("@") ? username : `@${username}`,
          email,
          password,
          referral_code: referralCode,
          initial_watchlist: ["AAPL", "RELIANCE.NS", "NVDA"],
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.detail || "Registration failed.");

      // 3. Auto Login
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const loginRes = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem("marketmind_token", loginData.access_token);
        localStorage.setItem("marketmind_user", JSON.stringify(loginData.user));
        window.location.href = "/";
      } else {
        window.location.href = "/login?registered=true";
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#090d12] border border-[#1e2631] rounded-3xl p-8 space-y-6 shadow-2xl">
        {/* Header Indicator Pills */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-2 bg-[#1d3557] rounded-full" />
          <div className="w-2 h-2 bg-[#1e2631] rounded-full" />
          <div className="w-2 h-2 bg-[#1e2631] rounded-full" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your Account</h1>
          <p className="text-xs text-[#6c798a] mt-1">
            Enter your details to get started with MarketMind AI.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#ff5366]/10 border border-[#ff5366]/30 rounded-2xl text-xs font-bold text-[#ff5366]">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#00d084]/10 border border-[#00d084]/30 rounded-2xl text-xs font-bold text-[#00d084]">
            {successMsg}
          </div>
        )}

        {step === "details" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and Last Name"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#455060] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">Choose your Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#455060] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#455060] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#455060] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Referral Code <span className="text-[#6c798a] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter Referral Code"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-xs text-white placeholder-[#455060] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-bold text-sm py-3.5 rounded-2xl transition-all disabled:opacity-50 mt-2 shadow-lg"
            >
              {loading ? "Sending OTP..." : "Continue to Verification →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-1.5">Enter 6-Digit Email OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit OTP code"
                className="w-full bg-[#121820] border border-[#1e2631] rounded-2xl px-4 py-3 text-center tracking-widest text-base font-mono text-white focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-1/3 bg-[#121820] text-[#6c798a] font-bold text-xs py-3.5 rounded-2xl border border-[#1e2631]"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] text-white font-bold text-sm py-3.5 rounded-2xl transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-center text-[#6c798a]">
          By continuing, you agree to our{" "}
          <span className="text-white underline cursor-pointer">Terms of Service</span> and{" "}
          <span className="text-white underline cursor-pointer">Privacy Policy</span>.
        </p>

        <p className="text-xs text-center text-[#6c798a]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#2563eb] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}