"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [language, setLanguage] = useState<"en" | "kn">("kn");

  // Dynamic, professional research scripts based on market signal & sentiment
  const textToRead = useMemo(() => {
    const isBullish = signal.toLowerCase().includes("buy") || signal.toLowerCase().includes("bullish");
    const isBearish = signal.toLowerCase().includes("sell") || signal.toLowerCase().includes("bearish");

    if (language === "kn") {
      // Professional Kannada Transliteration variations
      if (isBullish) {
        return `Namaskara. ${companyName} (${symbol}) moolaka market nalli ethara bullish momentum kanisthide. AI model indicator ${signal} signal needuthedhe. Overall market sentiment ${sentiment} eedee, mathu risk level ${riskLabel} edee.`;
      } else if (isBearish) {
        return `Namaskara. ${companyName} (${symbol}) trading visheshane nalli attentive agi irabeku. Current AI indicator ${signal} signal needidhe. News sentiment ${sentiment} edee, risk level ${riskLabel} edee. Strict risk management follow maadi.`;
      } else {
        return `Namaskara. ${companyName} (${symbol}) eega neutral trading range nalli eedhe. Current Technical signal ${signal} eedhe, mathu overall risk level ${riskLabel} eedhe. Clear market directiongosgara wait maadhiii.`;
      }
    } else {
      // Professional English variations
      if (isBullish) {
        return `MarketMind AI briefing for ${companyName}, symbol ${symbol}. The quantitative model registers a ${signal} signal supported by positive price momentum. Overall news sentiment remains ${sentiment} with a ${riskLabel} risk assessment.`;
      } else if (isBearish) {
        return `MarketMind research alert for ${companyName}, symbol ${symbol}. The technical indicators reflect a ${signal} signal. Recent market sentiment is ${sentiment}, with an estimated risk rating of ${riskLabel}. Exercise proper risk control.`;
      } else {
        return `MarketMind technical update for ${companyName}, symbol ${symbol}. The asset is currently trading in a consolidated structure with a ${signal} indication. Market sentiment stands at ${sentiment} alongside a ${riskLabel} risk metric.`;
      }
    }
  }, [symbol, companyName, signal, riskLabel, sentiment, language]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoiceUri) {
        const indianVoice = availableVoices.find((v) => v.lang.includes("en-IN") || v.name.includes("India"));
        const defaultVoice = indianVoice || availableVoices.find((v) => v.lang.startsWith("en")) || availableVoices[0];
        setSelectedVoiceUri(defaultVoice.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceUri]);

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
      utterance.pitch = 1.0;

      if (selectedVoiceUri) {
        const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-[#00e699] animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#8b90a3]" />
          )}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e699] bg-[#00e699]/10 px-2.5 py-1 rounded-md border border-[#00e699]/30">
            AI Voice Research Briefing ({language === "kn" ? "Kannada" : "English"})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsPlaying(false);
              setLanguage(language === "kn" ? "en" : "kn");
            }}
            className="px-3 py-1.5 rounded-xl bg-[#070a0f] border border-[#242f45] text-xs font-bold text-[#00e699] hover:border-[#00e699] transition-all cursor-pointer"
          >
            {language === "kn" ? "Switch to English" : "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ (Kannada)"}
          </button>

          <select
            value={selectedVoiceUri}
            onChange={(e) => setSelectedVoiceUri(e.target.value)}
            className="bg-[#070a0f] border border-[#242f45] rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#00e699] max-w-[140px] sm:max-w-[160px] truncate cursor-pointer"
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>

          <button
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isPlaying
                ? "bg-[#ff5366]/15 border-[#ff5366]/40 text-[#ff5366]"
                : "bg-[#070a0f] border-[#242f45] hover:border-[#00e699] text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#ff5366]" /> Stop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#00e699]" /> Listen
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#8b90a3] leading-relaxed font-medium">
        &quot;{textToRead}&quot;
      </p>
    </div>
  );
}