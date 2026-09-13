"use client";

import React from "react";
import { NewsArticle } from "@/lib/api";
import { ExternalLink, Newspaper } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const isPositive = article.sentiment === "Positive";
  const isNegative = article.sentiment === "Negative";

  return (
    <div className="p-4 rounded-xl bg-[#0d1117] border border-[#2d333b] hover:border-[#0fa3b1]/50 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between text-[10px] font-bold mb-2">
          <span className="text-[#8b90a3] flex items-center gap-1">
            <Newspaper className="w-3 h-3 text-[#06c8d9]" />
            {article.publisher}
          </span>
          {article.published && (
            <span className="text-[#8b90a3]">
              {new Date(article.published).toLocaleDateString()}
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-white group-hover:text-[#06c8d9] transition-colors line-clamp-2 leading-relaxed">
          {article.title}
        </h4>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2d333b]/60 flex items-center justify-between">
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
            isPositive
              ? "bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/30"
              : isNegative
              ? "bg-[#ff5366]/10 text-[#ff5366] border border-[#ff5366]/30"
              : "bg-[#8b90a3]/10 text-[#8b90a3] border border-[#2d333b]"
          }`}
        >
          {article.sentiment || "Neutral"}
        </span>

        {article.link && (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#8b90a3] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}