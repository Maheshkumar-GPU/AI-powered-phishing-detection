import React from "react";
import { AiAnalysis } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, ShieldAlert, CheckCircle, Lightbulb } from "lucide-react";

interface AIAnalysisPanelProps {
  analysis: AiAnalysis;
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  const getSeverityColor = (severity: string | null | undefined) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "text-destructive";
      case "high": return "text-destructive";
      case "medium": return "text-amber-500";
      case "low": return "text-green-500";
      case "none": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/10 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BrainCircuit className="w-4 h-4 mr-2 text-primary" />
              Threat Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.threat_summary || "No summary available."}
            </p>
            {analysis.attack_type && (
              <div className="mt-4 inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">
                TYPE: {analysis.attack_type.toUpperCase()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/10 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-primary" />
              Risk Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.risk_explanation || "No explanation available."}
            </p>
            {analysis.severity_level && (
              <div className={`mt-4 inline-flex items-center px-2 py-1 rounded bg-muted text-xs font-mono font-bold ${getSeverityColor(analysis.severity_level)}`}>
                SEVERITY: {analysis.severity_level.toUpperCase()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(analysis.technical_analysis?.key_indicators?.length || analysis.technical_analysis?.legitimate_signals?.length) ? (
        <Card className="bg-muted/10 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" />
              Technical Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.technical_analysis?.key_indicators && analysis.technical_analysis.key_indicators.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-destructive mb-3 uppercase tracking-wider">Suspicious Signals</h4>
                <ul className="space-y-2">
                  {analysis.technical_analysis.key_indicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 mr-2 shrink-0" />
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.technical_analysis?.legitimate_signals && analysis.technical_analysis.legitimate_signals.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-green-500 mb-3 uppercase tracking-wider">Legitimate Signals</h4>
                <ul className="space-y-2">
                  {analysis.technical_analysis.legitimate_signals.map((signal, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2 shrink-0" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="bg-muted/10 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
