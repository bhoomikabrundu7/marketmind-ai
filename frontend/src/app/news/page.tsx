"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url?: string;
  source: string;
  published_at: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  sentimentScore: number;
}

export default function MarketNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "Bullish" | "Bearish" | "Neutral">("ALL");

  useEffect(() => {
    // Simulated live financial news feed with image assets & sentiment scoring
    const mockNews: NewsArticle[] = [
      {
        uuid: "1",
        title: "DeepSeek Optimizes Memory Architecture, Impacting Global Semiconductor Outlook",
        description: "Recent breakthroughs in KV-cache reduction signal potential shifts in hardware procurement cycles for major tech players.",
        snippet: "The memory-shortage thesis assumes AI usage and memory demand rise together. Recent technical disclosures challenge this baseline assumption...",
        url: "#",
        image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
        source: "Reuters Financial",
        published_at: "2 hours ago",
        sentiment: "Bullish",
        sentimentScore: 0.82,
      },
      {
        uuid: "2",
        title: "Tech Giants Rally as Enterprise Cloud Spending Exceeds Wall Street Estimates",
        description: "Q3 metrics indicate accelerated adoption of automated workflows and artificial intelligence tooling across enterprise sectors.",
        snippet: "Enterprise demand remains robust as businesses allocate larger budgets toward cloud infrastructure and automated intelligence integration...",
        url: "#",
        image_url: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=600&auto=format&fit=crop",
        source: "Bloomberg Terminal",
        published_at: "4 hours ago",
        sentiment: "Bullish",
        sentimentScore: 0.74,
      },
      {
        uuid: "3",
        title: "Regulatory Scrutiny Increases Around Algorithmic Trading and Automated Execution",
        description: "Global financial authorities propose new transparency frameworks for high-frequency model-driven market participants.",
        snippet: "Regulators are closely evaluating volatility triggers caused by automated algorithmic models during high-volume trading sessions...",
        url: "#",
        image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop",
        source: "Financial Times",
        published_at: "6 hours ago",
        sentiment: "Bearish",
        sentimentScore: -0.45,
      },
      {
        uuid: "4",
        title: "Renewable Energy Equities Stabilize Following Regional Infrastructure Funding",
        description: "Long-term grid modernization initiatives provide baseline price support for clean energy and automotive storage manufacturers.",
        snippet: "Green energy assets experience renewed institutional interest as regional capital expenditure commitments clear legislative hurdles...",
        url: "#",
        image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop",
        source: "Wall Street Journal",
        published_at: "8 hours ago",
        sentiment: "Neutral",
        sentimentScore: 0.05,
      },
    ];

    setTimeout(() => {
      setArticles(mockNews);
      setLoading(false);
    }, 400);
  }, []);

  const filteredArticles = articles.filter(
    (a) => selectedFilter === "ALL" || a.sentiment === selectedFilter
  );

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
            NLP Intelligence
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">Market Sentiment & News</h1>
          <p className="text-xs text-[#8b90a3] mt-1">Real-time headline aggregation, image feeds, and automated sentiment scoring</p>
        </div>

        {/* Sentiment Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-xl border border-[#242f45]">
          {(["ALL", "Bullish", "Bearish", "Neutral"] as const).map((filt) => (
            <button
              key={filt}
              onClick={() => setSelectedFilter(filt)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === filt
                  ? "bg-[#00e699] text-[#070a0f] shadow-md shadow-[#00e699]/20 font-black"
                  : "text-[#8b90a3] hover:text-white"
              }`}
            >
              {filt}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Grid */}
      {loading ? (
        <div className="h-64 bg-[#0f1522] border border-[#1b2230] rounded-3xl flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00e699] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8b90a3]">Processing financial wire feeds...</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-[#0f1522] border border-[#1b2230] rounded-3xl py-16 text-center text-xs text-[#8b90a3]">
          No articles found for the selected sentiment filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => {
            const isBullish = article.sentiment === "Bullish";
            const isBearish = article.sentiment === "Bearish";

            return (
              <div
                key={article.uuid}
                className="bg-[#0f1522] border border-[#1b2230] rounded-3xl overflow-hidden hover:border-[#00e699]/50 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Article Thumbnail Image */}
                  {article.image_url && (
                    <div className="relative h-48 w-full overflow-hidden bg-[#070a0f]">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#070a0f]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white">
                        {article.source}
                      </div>
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isBullish
                          ? "bg-[#00e699] text-[#070a0f]"
                          : isBearish
                          ? "bg-[#ff5366] text-white"
                          : "bg-slate-700 text-white"
                      }`}>
                        {article.sentiment} ({article.sentimentScore})
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#8b90a3]">
                      <span>{article.published_at}</span>
                      {!article.image_url && (
                        <span className="font-mono text-[#00e699]">{article.source}</span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-white leading-snug hover:text-[#00e699] transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
                      {article.snippet}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-[#1b2230] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8b90a3]">Impact Score: {(article.sentimentScore * 100).toFixed(0)}%</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#00e699] hover:underline flex items-center gap-1"
                  >
                    Read Full Coverage →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}