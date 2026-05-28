import httpx
import json
from typing import AsyncGenerator
from app.config import settings
from app.utils.logger import logger


SYSTEM_PROMPT = """You are an expert SOC (Security Operations Center) cybersecurity analyst AI assistant named PhishGuard.

Your responsibilities:
- Analyze phishing threats and suspicious URLs
- Explain cybersecurity risks clearly and professionally
- Provide structured threat summaries and verdicts
- Explain ML predictions in simple, understandable terms
- Give actionable, prioritized recommendations
- Help beginner users understand phishing attacks

Guidelines:
- Keep responses concise, intelligent, and professional
- Use structured output when analyzing scan results
- Explain technical concepts simply without being condescending
- Always provide actionable next steps
- Be definitive in your verdicts — don't hedge unnecessarily"""


ANALYSIS_PROMPT_TEMPLATE = """Analyze the following phishing scan result and return a structured JSON response.

URL: {url}
ML Prediction: {prediction}
Confidence: {confidence:.1%}
Risk Score: {risk_score:.1%}

Extracted Features:
{features}

Generate a detailed analysis with this exact JSON structure:
{{
  "threat_summary": "2-3 sentence summary of the threat",
  "risk_explanation": "Why this URL is risky or safe",
  "attack_type": "Type of attack (e.g., Credential Harvesting, Brand Spoofing, Malware Distribution, etc.) or 'None Detected'",
  "technical_analysis": {{
    "key_indicators": ["list", "of", "suspicious", "indicators"],
    "legitimate_signals": ["list", "of", "legitimate", "signals"]
  }},
  "recommendations": ["actionable", "recommendation", "list"],
  "final_verdict": "DANGEROUS | SUSPICIOUS | SAFE",
  "severity_level": "CRITICAL | HIGH | MEDIUM | LOW | NONE"
}}

Return ONLY valid JSON. No markdown, no extra text."""


class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = 120.0

    async def _is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    async def analyze_url(self, url: str, prediction: str, confidence: float,
                          risk_score: float, features: dict) -> dict:
        features_text = "\n".join(
            f"  - {k.replace('_', ' ').title()}: {v}"
            for k, v in features.items()
        )
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(
            url=url,
            prediction=prediction,
            confidence=confidence,
            risk_score=risk_score,
            features=features_text,
        )

        if not await self._is_available():
            logger.warning("Ollama not available. Using fallback analysis.")
            return self._fallback_analysis(prediction, risk_score, features)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "system": SYSTEM_PROMPT,
                        "stream": False,
                        "format": "json",
                        "options": {"temperature": 0.1, "top_p": 0.9},
                    },
                )
                response.raise_for_status()
                data = response.json()
                raw_text = data.get("response", "")
                return json.loads(raw_text)
        except json.JSONDecodeError as e:
            logger.error(f"Ollama returned invalid JSON: {e}")
            return self._fallback_analysis(prediction, risk_score, features)
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return self._fallback_analysis(prediction, risk_score, features)

    async def chat(self, messages: list[dict]) -> str:
        if not await self._is_available():
            return ("I'm currently unable to connect to the Ollama AI service. "
                    "Please ensure Ollama is running locally with: `ollama serve`")

        formatted = [{"role": m["role"], "content": m["content"]} for m in messages]
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + formatted,
                        "stream": False,
                        "options": {"temperature": 0.3},
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            return f"AI service error: {str(e)}. Please check that Ollama is running."

    def _fallback_analysis(self, prediction: str, risk_score: float, features: dict) -> dict:
        is_phishing = prediction == "phishing"
        indicators = []
        legitimate = []

        if not features.get("is_https"):
            indicators.append("No HTTPS encryption")
        else:
            legitimate.append("Uses HTTPS encryption")
        if features.get("has_ip_address"):
            indicators.append("IP address used instead of domain name")
        if features.get("has_at_symbol"):
            indicators.append("Contains @ symbol (URL obfuscation)")
        if features.get("has_suspicious_keywords"):
            indicators.append("Contains phishing-related keywords")
        if features.get("has_uncommon_tld"):
            indicators.append("Uses uncommon/suspicious TLD")
        if features.get("subdomain_count", 0) >= 3:
            indicators.append("Excessive subdomain nesting")
        if features.get("double_slash_redirect"):
            indicators.append("Double-slash redirect detected")
        if not indicators:
            legitimate.append("No major suspicious URL patterns detected")

        if is_phishing:
            verdict = "DANGEROUS" if risk_score > 0.7 else "SUSPICIOUS"
            severity = "CRITICAL" if risk_score > 0.85 else "HIGH" if risk_score > 0.7 else "MEDIUM"
        else:
            verdict = "SAFE"
            severity = "NONE" if risk_score < 0.2 else "LOW"

        return {
            "threat_summary": (
                f"This URL shows {'significant' if is_phishing else 'minimal'} phishing indicators "
                f"with a {risk_score:.0%} risk score. "
                f"{'Exercise extreme caution.' if is_phishing else 'URL appears relatively safe.'}"
            ),
            "risk_explanation": (
                f"ML model classified this as {prediction} with "
                f"{len(indicators)} suspicious indicator(s) detected."
            ),
            "attack_type": "Credential Harvesting / Brand Spoofing" if is_phishing else "None Detected",
            "technical_analysis": {
                "key_indicators": indicators or ["No critical indicators found"],
                "legitimate_signals": legitimate,
            },
            "recommendations": (
                ["Do not click this link", "Report to your IT security team",
                 "Run a full system scan if already visited", "Change passwords if credentials were entered"]
                if is_phishing else
                ["URL appears safe but always verify the sender", "Check the full URL before entering credentials"]
            ),
            "final_verdict": verdict,
            "severity_level": severity,
        }


ollama_client = OllamaClient()
