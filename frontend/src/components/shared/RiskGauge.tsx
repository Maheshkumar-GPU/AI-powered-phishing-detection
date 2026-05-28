import React from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

export function RiskGauge({ score, size = 120, className = "" }: RiskGaugeProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score * circumference;

  let color = "hsl(140 100% 50%)";
  if (score > 0.4) color = "hsl(40 100% 50%)";
  if (score > 0.75) color = "hsl(345 100% 60%)";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono tracking-tighter" style={{ color }}>
          {Math.round(score * 100)}%
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Risk</span>
      </div>
    </div>
  );
}
