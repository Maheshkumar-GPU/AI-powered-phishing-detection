import React, { useState } from "react";
import { Link } from "wouter";
import { useGetHistory, useDeleteScan } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { Search, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function History() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [predictionFilter, setPredictionFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useGetHistory(
    {
      page,
      limit: 20,
      search: search || undefined,
      prediction: predictionFilter !== "all" ? predictionFilter : undefined,
    },
    {
      query: {
        queryKey: ["/api/history", { page, limit: 20, search, prediction: predictionFilter !== "all" ? predictionFilter : undefined }],
      },
    }
  );

  const deleteMutation = useDeleteScan();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this scan record?")) {
      deleteMutation.mutate(
        { scanId: id },
        {
          onSuccess: () => {
            toast.success("Scan deleted");
            queryClient.invalidateQueries({ queryKey: ["/api/history"] });
          },
          onError: () => toast.error("Failed to delete scan"),
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and manage past URL intelligence scans.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-[250px] bg-card border-border"
            />
          </div>
          <Select value={predictionFilter} onValueChange={setPredictionFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-card border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="legitimate">Legitimate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="glass-panel border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[120px] text-right">Risk Score</TableHead>
              <TableHead className="w-[180px]">Scanned At</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : !history || history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No scan records found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              history.map((scan) => (
                <TableRow key={scan.id} className="border-border hover:bg-muted/10 transition-colors group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{scan.id.toString().padStart(5, "0")}
                  </TableCell>
                  <TableCell className="font-mono text-sm max-w-[300px] truncate">{scan.url}</TableCell>
                  <TableCell><ThreatBadge prediction={scan.prediction} /></TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={scan.risk_score > 0.75 ? "text-destructive font-bold" : scan.risk_score > 0.4 ? "text-amber-500 font-bold" : "text-green-500 font-bold"}>
                      {Math.round(scan.risk_score * 100)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(scan.scanned_at), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/scanner?id=${scan.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(scan.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-border bg-card hover:bg-muted">
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!history || history.length < 20} className="border-border bg-card hover:bg-muted">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
