"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";

interface RiskGaugeProps {
  score?: number;
  label?: string;
  signal?: string;
}

export default function RiskGauge({ score = 50, label = "Moderate Risk", signal }: RiskGaugeProps) {
  const riskScore = Math.min(100, Math.max(0, Number(score) || 50));

  // Needle rotation mapped from -90deg (0/100) to +90deg (100/100)
  const needleAngle = -90 + (riskScore / 100) * 180;

  // Calculate Trade Action Recommendation & Actionable Guidance Sentence
  let actionRecommendation = "HOLD / ACCUMULATE";
  let actionBadgeColor = "text-amber-400 bg-amber-400/10 border-amber-400/30";
  let statusIcon = <MinusCircle className="w-4 h-4 text-amber-400" />;
  let explanationSentence = "";

  if (signal) {
    const sigUpper = signal.toUpperCase();
    if (sigUpper.includes("BUY") || sigUpper.includes("BULLISH")) {
      actionRecommendation = "STRONG BUY";
      actionBadgeColor = "text-[#00e699] bg-[#00e699]/10 border-[#00e699]/30";
      statusIcon = <CheckCircle2 className="w-4 h-4 text-[#00e699]" />;
    } else if (sigUpper.includes("SELL") || sigUpper.includes("BEARISH")) {
      actionRecommendation = "SELL / REDUCE";
      actionBadgeColor = "text-[#ff5366] bg-[#ff5366]/10 border-[#ff5366]/30";
      statusIcon = <AlertTriangle className="w-4 h-4 text-[#ff5366]" />;
    } else {
      actionRecommendation = "HOLD / WATCH";
      actionBadgeColor = "text-amber-400 bg-amber-400/10 border-amber-400/30";
      statusIcon = <MinusCircle className="w-4 h-4 text-amber-400" />;
    }
  } else {
    if (riskScore <= 35) {
      actionRecommendation = "BUY / ACCUMULATE";
      actionBadgeColor = "text-[#00e699] bg-[#00e699]/10 border-[#00e699]/30";
      statusIcon = <CheckCircle2 className="w-4 h-4 text-[#00e699]" />;
    } else if (riskScore <= 65) {
      actionRecommendation = "HOLD / ACCUMULATE";
      actionBadgeColor = "text-amber-400 bg-amber-400/10 border-amber-400/30";
      statusIcon = <MinusCircle className="w-4 h-4 text-amber-400" />;
    } else {
      actionRecommendation = "SELL / REDUCE";
      actionBadgeColor = "text-[#ff5366] bg-[#ff5366]/10 border-[#ff5366]/30";
      statusIcon = <AlertTriangle className="w-4 h-4 text-[#ff5366]" />;
    }
  }

  // Realistic Risk & Sentiment Sentence
  if (riskScore <= 35) {
    explanationSentence = `Low volatility (${riskScore}/100) presents a favorable risk-reward entry window. Market conditions support a confidence BUY stance for long-term upside potential.`;
  } else if (riskScore <= 65) {
    explanationSentence = `Moderate risk exposure (${riskScore}/100) indicates active price consolidation. Recommended strategy is to HOLD current positions and accumulate gradually on key dips.`;
  } else {
    explanationSentence = `Elevated market volatility (${riskScore}/100) signals downside risk exposure. Investors are advised to SELL or tighten stop-loss orders to protect capital.`;
  }

  const getLabelColor = () => {
    if (riskScore <= 35) return "text-[#00e699]";
    if (riskScore <= 65) return "text-amber-400";
    return "text-[#ff5366]";
  };

  return (
    <div className="bg-[#0f1522] border border-[#1b2230] p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b90a3] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ffcc00]" />
          Riskometer & Trade Guidance
        </span>
        <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-md border ${actionBadgeColor}`}>
          {actionRecommendation}
        </span>
      </div>

      {/* Speedometer Arc Gauge */}
      <div className="flex flex-col items-center justify-center pt-2 relative">
        <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
          {/* Low Risk Arc (Green) */}
          <path
            d="M 20,100 A 80,80 0 0,1 52.8,30.8"
            fill="none"
            stroke="#00e699"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Moderate Risk Arc (Yellow/Amber) */}
          <path
            d="M 59.8,24.8 A 80,80 0 0,1 140.2,24.8"
            fill="none"
            stroke="#eab308"
            strokeWidth="16"
          />
          {/* High Risk Arc (Red) */}
          <path
            d="M 147.2,30.8 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#ff5366"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Pivot Shadow Base */}
          <circle cx="100" cy="100" r="10" fill="#070a0f" stroke="#242f45" strokeWidth="3" />

          {/* Animated Needle */}
          <g
            transform={`rotate(${needleAngle}, 100, 100)`}
            className="transition-transform duration-700 ease-out"
          >
            <line x1="100" y1="100" x2="100" y2="32" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="5" fill="#00e699" />
          </g>
        </svg>

        {/* Gauge Scale Labels */}
        <div className="w-48 flex justify-between text-[10px] font-mono font-bold text-[#8b90a3] -mt-2">
          <span className="text-[#00e699]">LOW</span>
          <span className="text-amber-400">MODERATE</span>
          <span className="text-[#ff5366]">HIGH</span>
        </div>
      </div>

      {/* Dynamic Risk Rating & Score */}
      <div className="text-center space-y-1">
        <h4 className={`text-base font-black uppercase tracking-tight ${getLabelColor()}`}>
          {label || "MODERATE RISK"}
        </h4>
        <p className="text-[11px] font-mono text-[#8b90a3]">
          Risk Index Score: <strong className="text-white">{riskScore} / 100</strong>
        </p>
      </div>

      {/* REALISTIC ACTION SENTENCE BOX (Buy / Sell / Hold Sentence) */}
      <div className="bg-[#070a0f] border border-[#242f45] p-3.5 rounded-2xl flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{statusIcon}</div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b90a3] block">
            Action Recommendation: <strong className="text-white">{actionRecommendation}</strong>
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
            {explanationSentence}
          </p>
        </div>
      </div>
    </div>
  );
}