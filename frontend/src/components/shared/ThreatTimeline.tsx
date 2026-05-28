import React from "react";
import { Link } from "wouter";
import { ScanSummary } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import { ThreatBadge } from "./ThreatBadge";

interface ThreatTimelineProps {
  scans: ScanSummary[];
}

export function ThreatTimeline({ scans }: ThreatTimelineProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No recent scans to display.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scans.slice(0, 10).map((scan) => (
        <Link key={scan.id} href={`/scanner?id=${scan.id}`}>
          <div className="group block p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <div className="font-mono text-xs truncate max-w-[200px] text-foreground group-hover:text-primary transition-colors">
                {scan.url}
              </div>
              <ThreatBadge prediction={scan.prediction} className="scale-75 origin-top-right" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
              <span>{formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}</span>
              <span className="font-mono">RISK: {Math.round(scan.risk_score * 100)}%</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
