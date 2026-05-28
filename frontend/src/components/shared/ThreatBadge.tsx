import React from "react";

interface ThreatBadgeProps {
  prediction: string;
  className?: string;
}

export function ThreatBadge({ prediction, className = "" }: ThreatBadgeProps) {
  const pred = prediction?.toLowerCase() || "unknown";

  let colorClass = "bg-muted text-muted-foreground border-muted";
  let dotClass = "bg-muted-foreground";
  let glowClass = "";

  if (pred === "phishing" || pred === "dangerous") {
    colorClass = "bg-destructive/10 text-destructive border-destructive/20";
    dotClass = "bg-destructive animate-pulse";
    glowClass = "neon-glow-red";
  } else if (pred === "suspicious") {
    colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    dotClass = "bg-amber-500 animate-pulse";
    glowClass = "neon-glow-amber";
  } else if (pred === "legitimate" || pred === "safe") {
    colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
    dotClass = "bg-green-500";
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${colorClass} ${glowClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotClass}`} />
      {prediction.toUpperCase()}
    </div>
  );
}
