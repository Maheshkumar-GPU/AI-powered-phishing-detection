import React, { useState } from "react";
import { useScanUrl, useGetScan } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/shared/RiskGauge";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { FeatureGrid } from "@/components/shared/FeatureGrid";
import { AIAnalysisPanel } from "@/components/shared/AIAnalysisPanel";
import { Search, ShieldAlert, ArrowRight, Activity, Loader2, ServerCrash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function Scanner() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialId = searchParams.get("id");

  const [url, setUrl] = useState("");
  const [scanId, setScanId] = useState<number | null>(initialId ? parseInt(initialId) : null);

  const scanMutation = useScanUrl();
  const { data: scanResult, isLoading: scanLoading } = useGetScan(
    scanId!,
    { query: { enabled: !!scanId, queryKey: ["/api/scanner/scan", scanId] } }
  );

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    scanMutation.mutate(
      { data: { url } },
      {
        onSuccess: (data) => {
          setScanId(data.id);
          window.history.replaceState({}, "", `/scanner?id=${data.id}`);
        },
        onError: () => toast.error("Failed to scan URL. Is the backend running?"),
      }
    );
  };

  const isScanning = scanMutation.isPending || (!!scanId && scanLoading);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">URL Deep Scan</h1>
        <p className="text-muted-foreground">Enter a URL to perform a comprehensive machine learning and AI threat analysis.</p>

        <form onSubmit={handleScan} className="mt-8 relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isScanning ? "animate-pulse opacity-75" : ""}`} />
          <div className="relative flex items-center">
            <Input
              data-testid="input-url-scan"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-16 text-lg px-6 bg-card border-border rounded-l-lg rounded-r-none font-mono focus-visible:ring-primary"
              disabled={isScanning}
            />
            <Button
              data-testid="button-scan"
              type="submit"
              className="h-16 px-8 rounded-l-none rounded-r-lg font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
              disabled={isScanning}
            >
              {isScanning ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Scanning...</>
              ) : (
                <>Analyze<ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className={`overflow-hidden border ${scanResult.prediction.toLowerCase() === "phishing" ? "border-destructive/50 neon-glow-red" : "border-border glass-panel"}`}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <ThreatBadge prediction={scanResult.prediction} className="text-lg px-4 py-1" />
                    <span className="text-sm font-mono text-muted-foreground px-3 py-1 rounded bg-muted/50">
                      ID: {scanResult.id.toString().padStart(6, "0")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-mono break-all">{scanResult.url}</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Scanned at {new Date(scanResult.scanned_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 bg-muted/20 p-6 rounded-2xl">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 font-semibold tracking-wider">CONFIDENCE</div>
                    <div className="text-3xl font-mono font-bold">{(scanResult.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="w-px h-16 bg-border mx-2" />
                  <RiskGauge score={scanResult.risk_score} size={140} />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="glass-panel h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />Extracted Features
                    </CardTitle>
                    <CardDescription>Machine learning raw inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeatureGrid features={scanResult.features} />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="glass-panel h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <ShieldAlert className="w-5 h-5 mr-2 text-primary" />AI Threat Intelligence
                    </CardTitle>
                    <CardDescription>Deep context analysis by SOC AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {scanResult.ai_analysis ? (
                      <AIAnalysisPanel analysis={scanResult.ai_analysis} />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-lg">
                        <ServerCrash className="w-10 h-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Analysis Unavailable</h3>
                        <p className="text-muted-foreground max-w-sm">The AI threat analysis could not be generated. The Ollama model may be offline.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
