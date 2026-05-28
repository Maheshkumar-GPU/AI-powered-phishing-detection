import React from "react";
import { Link } from "wouter";
import { useListReports } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/EmptyState";

export function Reports() {
  const { data: reports, isLoading } = useListReports(
    { limit: 50 },
    { query: { queryKey: ["/api/reports", { limit: 50 }] } }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">Detailed forensic analysis documents generated from scans.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card className="glass-panel border-border">
          <EmptyState
            icon={FileText}
            title="No Reports Available"
            description="Reports are automatically generated when you perform deep scans. Try scanning a URL to generate your first intelligence report."
            actionLabel="Go to Scanner"
            actionHref="/scanner"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="glass-panel border-border group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    REP-{report.id.toString().padStart(4, "0")}
                  </span>
                </div>
                <CardTitle className="text-lg font-mono truncate" title={report.url}>
                  {report.url.replace(/^https?:\/\//, "")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(report.generated_at), "MMMM d, yyyy 'at' HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <Link href={`/scanner?id=${report.scan_id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs h-8 border-border bg-transparent hover:bg-muted">
                      <ExternalLink className="w-3 h-3 mr-2" />View Scan
                    </Button>
                  </Link>
                  <Button variant="secondary" className="flex-1 text-xs h-8 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                    <Download className="w-3 h-3 mr-2" />Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
