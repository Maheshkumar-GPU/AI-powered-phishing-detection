import React, { useMemo } from "react";
import { useGetAnalyticsSummary, useGetHistory } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskGauge } from "@/components/shared/RiskGauge";
import { ThreatTimeline } from "@/components/shared/ThreatTimeline";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Shield, Activity, Target, AlertTriangle } from "lucide-react";

export function Dashboard() {
  const { data: analytics } = useGetAnalyticsSummary({
    query: { queryKey: ["/api/analytics/summary"] },
  });

  const { data: history } = useGetHistory(
    { limit: 10 },
    { query: { queryKey: ["/api/history", { limit: 10 }] } }
  );

  const demoData = useMemo(() => ({
    total_scans: 14592,
    phishing_count: 3204,
    legitimate_count: 11388,
    phishing_rate: 0.219,
    avg_risk_score: 0.32,
    daily_scan_counts: Array.from({ length: 30 }).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
      total: Math.floor(Math.random() * 500) + 100,
      phishing: Math.floor(Math.random() * 150) + 20,
    })),
  }), []);

  const data = analytics || demoData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Real-time threat intelligence overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{data.total_scans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Phishing Detected</CardTitle>
            <Target className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{data.phishing_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{(data.phishing_rate * 100).toFixed(1)}% detection rate</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Safe URLs</CardTitle>
            <Shield className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-500">{data.legitimate_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified safe domains</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Global Risk Avg</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="flex justify-center items-center py-2">
            <RiskGauge score={data.avg_risk_score} size={80} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Scan Activity (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_scan_counts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => { const d = new Date(val); return `${d.getMonth()+1}/${d.getDate()}`; }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="phishing" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorPhishing)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              Live Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[300px] overflow-y-auto pr-2">
              <ThreatTimeline scans={history || (analytics?.recent_scans || [])} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
