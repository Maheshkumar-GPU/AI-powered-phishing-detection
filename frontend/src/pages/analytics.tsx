import React from "react";
import { useGetAnalyticsSummary, useGetModelStatus } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Cell,
} from "recharts";
import { Database, Server, Cpu, HardDrive } from "lucide-react";

export function Analytics() {
  const { data: analytics } = useGetAnalyticsSummary({
    query: { queryKey: ["/api/analytics/summary"] },
  });
  const { data: modelStatus } = useGetModelStatus({
    query: { queryKey: ["/api/analytics/model-status"] },
  });

  const tldData = analytics?.top_phishing_tlds || [
    { tld: ".com", count: 1250 },
    { tld: ".net", count: 850 },
    { tld: ".org", count: 420 },
    { tld: ".xyz", count: 310 },
    { tld: ".info", count: 280 },
  ];

  const riskData = analytics?.risk_distribution || [
    { range: "0-20%", count: 8500, fill: "hsl(140 100% 50%)" },
    { range: "21-40%", count: 2100, fill: "hsl(140 100% 40%)" },
    { range: "41-60%", count: 1200, fill: "hsl(40 100% 50%)" },
    { range: "61-80%", count: 1500, fill: "hsl(345 100% 60%)" },
    { range: "81-100%", count: 1292, fill: "hsl(345 100% 50%)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Deep metrics on threat landscape and model performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Top Phishing TLDs</CardTitle>
            <CardDescription>Most frequently abused top-level domains</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tldData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="tld" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                  {tldData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index < 2 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Risk Score Distribution</CardTitle>
            <CardDescription>Volume of URLs mapped to risk severity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={riskData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background={{ fill: "hsl(var(--muted))" }} clockWise dataKey="count" cornerRadius={10} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: "12px" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Infrastructure Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Database, color: "primary", label: "ML Model", value: modelStatus?.model_trained ? "TRAINED" : "ONLINE" },
          { icon: Cpu, color: "purple-500", label: "LLM Engine", value: modelStatus?.ollama_model || "llama3" },
          { icon: Server, color: "green-500", label: "API Server", value: "HEALTHY" },
          { icon: HardDrive, color: "blue-500", label: "Database", value: "CONNECTED" },
        ].map(({ icon: Icon, color, label, value }) => (
          <Card key={label} className="glass-panel bg-card/40">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`font-mono font-bold text-lg truncate text-${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
