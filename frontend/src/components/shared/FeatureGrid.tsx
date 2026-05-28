import React from "react";
import { FeatureSet } from "@/lib/api-client";
import { CheckCircle2, XCircle } from "lucide-react";

interface FeatureGridProps {
  features: FeatureSet;
}

export function FeatureGrid({ features }: FeatureGridProps) {
  const featureItems = [
    { label: "HTTPS", value: features.is_https ? "Yes" : "No", good: features.is_https },
    { label: "IP Address", value: features.has_ip_address ? "Yes" : "No", good: !features.has_ip_address },
    { label: "At Symbol (@)", value: features.has_at_symbol ? "Yes" : "No", good: !features.has_at_symbol },
    { label: "Port in URL", value: features.has_port ? "Yes" : "No", good: !features.has_port },
    { label: "Uncommon TLD", value: features.has_uncommon_tld ? "Yes" : "No", good: !features.has_uncommon_tld },
    { label: "Suspicious Keywords", value: features.has_suspicious_keywords ? "Yes" : "No", good: !features.has_suspicious_keywords },
    { label: "Double Slash Redirect", value: features.double_slash_redirect ? "Yes" : "No", good: !features.double_slash_redirect },
    { label: "URL Length", value: features.url_length.toString(), good: features.url_length < 75 },
    { label: "Domain Length", value: features.domain_length.toString(), good: features.domain_length < 30 },
    { label: "Subdomains", value: features.subdomain_count.toString(), good: features.subdomain_count < 3 },
    { label: "Entropy", value: features.entropy.toFixed(2), good: features.entropy < 4.5 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {featureItems.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border">
          <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold">{item.value}</span>
            {item.good ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
