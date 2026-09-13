"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface VoiceBriefingProps {
  symbol: string;
  companyName: string;
  signal: string;
  riskLabel: string;
  sentiment: string;
}

export default function VoiceBriefing({ symbol, companyName, signal, riskLabel, sentiment }: VoiceBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const textToRead = `MarketMind research briefing for ${companyName}. The current technical signal is ${signal}, while the overall risk level remains ${riskLabel}. Recent financial news sentiment is ${sentiment}.`;

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-[#06c8d9] animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#8b90a3]" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3]">
            AI Voice Research Briefing
          </span>
        </div>
        <button
          onClick={handleToggleSpeech}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#2d333b] hover:border-[#0fa3b1] text-xs font-bold text-white transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-[#ff5366]" /> Stop Briefing
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-[#00d084]" /> Listen Briefing
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-[#8b90a3] mt-3 leading-relaxed">
        &quot;{textToRead}&quot;
      </p>
    </div>
  );
}