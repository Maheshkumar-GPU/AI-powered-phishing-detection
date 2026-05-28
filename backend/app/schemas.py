from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Any
from datetime import datetime


class ScanRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            v = "http://" + v
        return v


class FeatureSet(BaseModel):
    url_length: int
    domain_length: int
    is_https: bool
    subdomain_count: int
    has_ip_address: bool
    has_at_symbol: bool
    dash_count: int
    dot_count: int
    has_suspicious_keywords: bool
    entropy: float
    special_char_count: int
    digit_count_in_hostname: int
    query_param_count: int
    has_port: bool
    has_uncommon_tld: bool
    double_slash_redirect: bool
    url_similarity_index: float
    char_continuation_rate: float
    tld_length: int


class ScanResponse(BaseModel):
    id: int
    url: str
    prediction: str
    confidence: float
    risk_score: float
    features: FeatureSet
    ai_analysis: Optional[dict] = None
    scanned_at: datetime

    class Config:
        from_attributes = True


class ScanRecordOut(BaseModel):
    id: int
    url: str
    prediction: str
    confidence: float
    risk_score: float
    scanned_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    role: str = "assistant"
    content: str
    created_at: datetime


class ReportOut(BaseModel):
    id: int
    scan_id: int
    url: str
    report_data: dict
    generated_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_scans: int
    phishing_count: int
    legitimate_count: int
    phishing_rate: float
    avg_risk_score: float
    recent_scans: list[ScanRecordOut]
    risk_distribution: list[dict]
    top_phishing_tlds: list[dict]
    daily_scan_counts: list[dict]
