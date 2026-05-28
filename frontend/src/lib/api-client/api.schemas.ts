export interface HealthStatus {
  status: string;
}

export interface ScanInput {
  url: string;
}

export interface FeatureSet {
  url_length: number;
  domain_length: number;
  is_https: boolean;
  subdomain_count: number;
  has_ip_address: boolean;
  has_at_symbol: boolean;
  dash_count: number;
  dot_count: number;
  has_suspicious_keywords: boolean;
  entropy: number;
  special_char_count: number;
  digit_count_in_hostname: number;
  query_param_count: number;
  has_port: boolean;
  has_uncommon_tld: boolean;
  double_slash_redirect: boolean;
  url_similarity_index: number;
  char_continuation_rate: number;
  tld_length: number;
}

export interface TechnicalAnalysis {
  key_indicators?: string[];
  legitimate_signals?: string[];
}

export interface AiAnalysis {
  threat_summary?: string | null;
  risk_explanation?: string | null;
  attack_type?: string | null;
  technical_analysis?: TechnicalAnalysis;
  recommendations?: string[];
  final_verdict?: string | null;
  severity_level?: string | null;
}

export interface ScanResult {
  id: number;
  url: string;
  prediction: string;
  confidence: number;
  risk_score: number;
  features: FeatureSet;
  ai_analysis?: AiAnalysis;
  scanned_at: string;
}

export interface ScanSummary {
  id: number;
  url: string;
  prediction: string;
  confidence: number;
  risk_score: number;
  scanned_at: string;
}

export interface CountResult {
  count: number;
}

export interface DeleteResult {
  deleted?: boolean | number | null;
  message?: string | null;
}

export interface ChatInput {
  session_id: string;
  message: string;
}

export interface ChatMessage {
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatHistoryItem {
  role: string;
  content: string;
  created_at: string;
}

export interface RiskDistribution {
  range?: string;
  count?: number;
  fill?: string;
}

export interface TldCount {
  tld?: string;
  count?: number;
}

export interface DailyScanCount {
  date?: string;
  total?: number;
  phishing?: number;
}

export interface AnalyticsSummary {
  total_scans: number;
  phishing_count: number;
  legitimate_count: number;
  phishing_rate: number;
  avg_risk_score: number;
  recent_scans: ScanSummary[];
  risk_distribution: RiskDistribution[];
  top_phishing_tlds: TldCount[];
  daily_scan_counts: DailyScanCount[];
}

export interface ModelStatus {
  model_trained?: boolean;
  model_path?: string;
  scaler_path?: string;
  ollama_model?: string;
  ollama_url?: string;
}

export type ReportReportData = { [key: string]: unknown };

export interface Report {
  id: number;
  scan_id: number;
  url: string;
  report_data: ReportReportData;
  generated_at: string;
}

export type GetHistoryParams = {
  page?: number;
  limit?: number;
  prediction?: string | null;
  search?: string | null;
};

export type GetHistoryCountParams = {
  prediction?: string | null;
};

export type ListReportsParams = {
  page?: number;
  limit?: number;
};
