"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchStockAnalysis, StockAnalysisResponse } from "@/lib/api";
import KPICard from "@/components/kpi-card";
import ScoreBadge from "@/components/score-badge";
import PriceChart from "@/components/price-chart";
import RiskGauge from "@/components/risk-gauge";
import ExplainabilityCard from "@/components/explainability-card";
import VoiceBriefing from "@/components/voice-briefing";

function BackgroundHeroVideo() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none opacity-40"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/90 via-[#0d1117]/85 to-[#0d1117] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0d1117]/60 to-[#0d1117] pointer-events-none" />
    </div>
  );
}

function PublicLandingPage() {
  const router = useRouter();

  const capabilities = [
    { title: "Search Companies", desc: "Instant directory access across Indian & US markets" },
    { title: "Analyze Stocks", desc: "Deep technical feeds and automated decision signals" },
    { title: "Technical Indicators", desc: "Real-time RSI, MACD, Moving Averages, and Volatility" },
    { title: "AI Forecasting", desc: "Predictive price trend modeling using Random Forest" },
    { title: "News Sentiment", desc: "NLP-based financial headline impact scoring" },
    { title: "Risk Analysis", desc: "Anomaly detection and volatility rating metrics" },
    { title: "Investment Simulator", desc: "Scenario backtesting without financial risk" },
    { title: "Watchlist Hub", desc: "Database-synced real-time market tracking" },
    { title: "Portfolio Tracking", desc: "Unrealized P&L and asset allocation metrics" },
    { title: "Market Alerts", desc: "Fast notifications on key market price thresholds" },
  ];

  const aiTech = [
    "Random Forest",
    "LSTM",
    "Technical Analysis",
    "NLP Sentiment Analysis",
    "Isolation Forest",
    "K-Means",
    "SHAP",
    "Risk Analysis",
  ];

  const steps = [
    { num: "01", title: "Search", desc: "Find any company or ticker." },
    { num: "02", title: "Explore", desc: "View market data, company info, and historical performance." },
    { num: "03", title: "Analyze", desc: "Use technical indicators, AI models, sentiment, and risk intelligence." },
    { num: "04", title: "Understand", desc: "Review combined research insights and make informed decisions." },
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-3xl border border-[#2d333b]/60 shadow-2xl">
        <BackgroundHeroVideo />

        <div className="relative z-20 max-w-4xl space-y-6 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0fa3b1]/15 border border-[#0fa3b1]/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#06c8d9] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#06c8d9]">
              Commercial SaaS Financial Intelligence Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight">
            Understand the Market. <br />
            <span className="text-[#06c8d9]">Analyze Smarter.</span>
          </h1>

          <p className="text-sm md:text-base text-[#8b90a3] max-w-2xl mx-auto leading-relaxed font-medium">
            MarketMind AI brings market data, technical analysis, AI-powered insights, sentiment analysis, and risk intelligence together in one research platform.
          </p>

          <div className="relative z-30 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-[#0fa3b1]/20 cursor-pointer"
            >
              Get Started →
            </button>
            <button
              onClick={() => router.push("/companies")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#161b22]/90 hover:bg-[#2d333b] border border-[#2d333b] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all backdrop-blur-md cursor-pointer"
            >
              Explore MarketMind AI
            </button>
          </div>

          <p className="text-[11px] font-semibold text-[#6c798a] pt-2">
            Built for smarter stock research — not financial advice.
          </p>
        </div>
      </section>

      {/* 2. WHAT IS MARKETMIND AI? */}
      <section className="max-w-4xl mx-auto text-center space-y-4 px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9] bg-[#0fa3b1]/10 px-3 py-1 rounded-md">
          Platform Overview
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          One Platform for Smarter Market Research
        </h2>
        <p className="text-sm sm:text-base text-[#8b90a3] leading-relaxed max-w-3xl mx-auto">
          MarketMind AI helps users research companies, understand market trends, analyze technical indicators, evaluate risk, explore financial sentiment, and use AI-powered analysis — all from one platform.
        </p>
      </section>

      {/* 3. WHY MARKETMIND AI? */}
      <section className="space-y-8 px-4">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Efficiency & Depth</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Why MarketMind AI?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bento-card hover:border-[#0fa3b1]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0fa3b1]/10 border border-[#0fa3b1]/30 flex items-center justify-center text-[#06c8d9] font-bold text-sm">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">Research Faster</h3>
            <p className="text-xs text-[#8b90a3] leading-relaxed">
              Find important company and market information in one place instead of switching between multiple tools.
            </p>
          </div>

          <div className="bento-card hover:border-[#0fa3b1]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0fa3b1]/10 border border-[#0fa3b1]/30 flex items-center justify-center text-[#06c8d9] font-bold text-sm">
              📊
            </div>
            <h3 className="text-base font-bold text-white">Analyze More</h3>
            <p className="text-xs text-[#8b90a3] leading-relaxed">
              Combine market data, technical indicators, sentiment and AI models for a broader view of a company.
            </p>
          </div>

          <div className="bento-card hover:border-[#0fa3b1]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0fa3b1]/10 border border-[#0fa3b1]/30 flex items-center justify-center text-[#06c8d9] font-bold text-sm">
              🛡️
            </div>
            <h3 className="text-base font-bold text-white">Understand Risk</h3>
            <p className="text-xs text-[#8b90a3] leading-relaxed">
              Look beyond potential returns with volatility, risk indicators and abnormal market behavior analysis.
            </p>
          </div>

          <div className="bento-card hover:border-[#0fa3b1]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0fa3b1]/10 border border-[#0fa3b1]/30 flex items-center justify-center text-[#06c8d9] font-bold text-sm">
              💡
            </div>
            <h3 className="text-base font-bold text-white">Make Data Easier</h3>
            <p className="text-xs text-[#8b90a3] leading-relaxed">
              Turn complex market information into clear charts, metrics and actionable research insights.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHAT MAKES IT DIFFERENT? */}
      <section className="bento-card max-w-5xl mx-auto p-8 sm:p-12 space-y-8 bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#2d333b]">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Integrated Architecture</span>
          <h2 className="text-3xl font-black text-white tracking-tight">More Than Just a Stock Chart</h2>
          <p className="text-xs text-[#8b90a3] max-w-xl mx-auto">
            MarketMind AI connects key layers of market research into a unified analytical workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          {[
            { label: "Market Data", icon: "🌐" },
            { label: "Technical Analysis", icon: "📈" },
            { label: "AI Models", icon: "🤖" },
            { label: "News & Sentiment", icon: "📰" },
            { label: "Risk Intelligence", icon: "⚖️" },
            { label: "Research Insights", icon: "🎯" },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-[#0d1117] border border-[#2d333b] rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-[#0fa3b1]/40 transition-colors">
              <span className="text-base">{item.icon}</span>
              <span className="text-[11px] font-bold text-white">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHAT YOU CAN DO */}
      <section className="space-y-6 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Core Capabilities</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Everything Covered in One Workspace</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {capabilities.map((c, i) => (
            <div key={i} className="p-4 bg-[#161b22] border border-[#2d333b] rounded-2xl hover:border-[#0fa3b1]/40 transition-all space-y-1">
              <h4 className="text-xs font-bold text-white block">{c.title}</h4>
              <p className="text-[10px] text-[#8b90a3] leading-tight">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="space-y-8 max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Simple Workflow</span>
          <h2 className="text-3xl font-black text-white tracking-tight">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bento-card relative space-y-2">
              <span className="text-2xl font-mono font-black text-[#06c8d9]/40 block">{s.num}</span>
              <h3 className="text-sm font-bold text-white">{s.title}</h3>
              <p className="text-xs text-[#8b90a3] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. AI-POWERED MARKET INTELLIGENCE */}
      <section className="bento-card max-w-5xl mx-auto p-8 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Under the Hood</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI-Powered Market Intelligence</h2>
          <p className="text-xs text-[#8b90a3] max-w-xl mx-auto">
            Multiple analytical techniques work together to provide a broader research perspective on market equities.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {aiTech.map((tech, i) => (
            <span
              key={i}
              className="text-xs font-bold font-mono text-white bg-[#0d1117] border border-[#2d333b] px-3.5 py-1.5 rounded-xl hover:border-[#0fa3b1]/50 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* 8. VALUE COMPARISON */}
      <section className="max-w-4xl mx-auto space-y-6 px-4">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#06c8d9]">Value Comparison</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Everything You Need to Research a Company. In One Place.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#161b22]/50 border border-[#2d333b]/60 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-[#ff5366] uppercase tracking-wider block">Traditional Research</span>
            <ul className="text-xs text-[#8b90a3] space-y-2 font-mono">
              <li>❌ Multiple fragmented websites</li>
              <li>❌ Disconnected stock charts & indicators</li>
              <li>❌ Manual news sentiment scanning</li>
              <li>❌ Separate third-party risk calculations</li>
              <li>❌ Manual cross-tool comparison</li>
            </ul>
          </div>

          <div className="p-6 bg-[#0fa3b1]/10 border border-[#0fa3b1]/40 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-[#06c8d9] uppercase tracking-wider block">MarketMind AI</span>
            <ul className="text-xs text-white space-y-2 font-semibold">
              <li>✅ Unified commercial research terminal</li>
              <li>✅ Integrated technical feeds & RSI analytics</li>
              <li>✅ Automated NLP headline sentiment</li>
              <li>✅ Machine learning price forecasting</li>
              <li>✅ Risk scores & anomaly metrics in 1 dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="bento-card max-w-4xl mx-auto p-10 text-center space-y-6 bg-gradient-to-r from-[#0fa3b1]/20 via-[#161b22] to-[#0fa3b1]/20 border border-[#0fa3b1]/40">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Turn Market Data Into Market Intelligence.
          </h2>
          <p className="text-xs text-[#8b90a3]">
            Explore companies, understand market behavior, analyze risk, and discover AI-powered insights with MarketMind AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-3.5 bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-[#0fa3b1]/30 cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push("/companies")}
            className="px-8 py-3.5 bg-[#0d1117] hover:bg-[#2d333b] border border-[#2d333b] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Explore Features
          </button>
        </div>
      </section>
    </div>
  );
}

function AuthenticatedDashboardContent() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");

  const [symbol, setSymbol] = useState<string>("AAPL");
  const [data, setData] = useState<StockAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol.toUpperCase());
      return;
    }

    const lastViewed = localStorage.getItem("marketmind_last_symbol");
    if (lastViewed) {
      setSymbol(lastViewed);
    }
  }, [urlSymbol]);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    fetchStockAnalysis(symbol)
      .then((res) => {
        setData(res);
        localStorage.setItem("marketmind_last_symbol", symbol);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#0fa3b1] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#8b90a3]">Loading MarketMind Terminal for {symbol}...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bento-card border-[#ff5366]/30 text-center">
        <p className="text-sm text-[#ff5366] font-bold">Failed to load stock data for {symbol}.</p>
        <p className="text-xs text-[#8b90a3] mt-1">{error || "Ensure FastAPI backend is running on http://127.0.0.1:8000"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Command Center Header */}
      <div className="bg-[#161b22] border border-[#2d333b] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#06c8d9] bg-[#0fa3b1]/10 px-2.5 py-1 rounded-md">
            Market Command Center
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            {data.name} ({data.symbol})
          </h1>
          <p className="text-xs text-[#8b90a3] mt-1">Commercial-grade financial research & AI intelligence dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/analysis?symbol=${encodeURIComponent(data.symbol)}`}
            className="bg-[#0fa3b1] hover:bg-[#06c8d9] text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            Launch Detailed Analysis →
          </Link>
          <ScoreBadge score={data.ai_score} />
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Current Price" value={`₹${data.overview.current_price.toLocaleString()}`} change={data.overview.period_change_pct} changeLabel="period return" />
        <KPICard title="AI Predicted Price" value={data.predicted_price ? `₹${data.predicted_price.toLocaleString()}` : "N/A"} subtitle="Random Forest regressor output" />
        <KPICard title="Risk Classification" value={data.risk_label} subtitle={`Annualized Volatility: ${data.indicators.volatility_pct}%`} />
        <KPICard title="News Sentiment" value={data.sentiment.overall_sentiment} subtitle={`Avg Score: ${data.sentiment.average_score.toFixed(2)} (${data.sentiment.total_articles} headlines)`} />
      </div>

      {/* Price Chart & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bento-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">Price Chart & Trend Analysis</span>
            <span className="text-xs text-[#06c8d9] font-bold bg-[#0fa3b1]/10 px-2.5 py-1 rounded-md">365 Sessions</span>
          </div>
          <PriceChart data={data.price_history} height={360} />
        </div>

        <div className="space-y-6">
          <RiskGauge label={data.risk_label} score={data.risk_score} />
          <VoiceBriefing symbol={data.symbol} companyName={data.name} signal={data.signal} riskLabel={data.risk_label} sentiment={data.sentiment.overall_sentiment} />
        </div>
      </div>

      {/* Decision Rationale & SHAP Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bento-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] block">AI Research Assessment & Reasoning</span>
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#2d333b]">
            <span className="text-xs font-bold text-[#8b90a3] block">Decision Signal</span>
            <span className="text-xl font-black text-[#06c8d9] mt-1 block">{data.signal}</span>
            <p className="text-xs text-[#8b90a3] mt-2 leading-relaxed">{data.signal_reason}</p>
          </div>
        </div>
        <ExplainabilityCard items={data.explainability} />
      </div>
    </div>
  );
}

function PageContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("marketmind_token");
    setIsLoggedIn(!!token);
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0fa3b1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? <AuthenticatedDashboardContent /> : <PublicLandingPage />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#8b90a3]">Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}