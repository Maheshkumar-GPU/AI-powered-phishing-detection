import os
import re
import joblib
import numpy as np
from urllib.parse import urlparse
import tldextract
from app.ml.feature_extractor import extract_features, features_to_vector
from app.config import settings
from app.utils.logger import logger

UUID_PATTERN = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    re.IGNORECASE,
)

TRUSTED_DOMAINS = {
    "google.com", "googleapis.com", "google.co.in", "google.co.uk",
    "youtube.com", "youtu.be",
    "microsoft.com", "microsoftonline.com", "live.com", "outlook.com",
    "office.com", "office365.com", "sharepoint.com", "teams.microsoft.com",
    "apple.com", "icloud.com",
    "amazon.com", "aws.amazon.com", "amazonaws.com",
    "facebook.com", "instagram.com", "whatsapp.com", "fb.com",
    "twitter.com", "x.com",
    "linkedin.com",
    "github.com", "githubusercontent.com", "gitlab.com",
    "openai.com", "chatgpt.com",
    "anthropic.com", "claude.ai",
    "netflix.com",
    "spotify.com",
    "dropbox.com",
    "slack.com",
    "zoom.us",
    "cloudflare.com",
    "reddit.com", "redd.it",
    "wikipedia.org",
    "stackoverflow.com",
    "npmjs.com",
    "pypi.org",
    "docker.com",
    "vercel.app", "netlify.app", "replit.app", "replit.com",
    "notion.so",
    "figma.com",
    "stripe.com",
    "twilio.com",
    "sendgrid.net",
    "hubspot.com",
    "salesforce.com",
    "shopify.com",
    "wordpress.com", "wordpress.org",
    "medium.com",
    "substack.com",
    "discord.com", "discordapp.com",
    "telegram.org",
    "canva.com",
    "adobe.com",
}


def _get_registered_domain(url: str) -> str:
    ext = tldextract.extract(url)
    if ext.domain and ext.suffix:
        return f"{ext.domain}.{ext.suffix}".lower()
    return ""


def _is_trusted_domain(url: str) -> bool:
    registered = _get_registered_domain(url)
    return registered in TRUSTED_DOMAINS


def _path_is_uuid_like(url: str) -> bool:
    parsed = urlparse(url)
    return bool(UUID_PATTERN.search(parsed.path))


def _adjust_for_context(url: str, prediction: str, confidence: float, risk_score: float) -> tuple[str, float, float]:
    """
    Apply post-processing corrections to catch common false positives.

    Rules (applied in order — first match wins):
      1. Trusted domain  → force legitimate, high confidence.
      2. UUID path on a .com/.org/.net/.io/.co/.edu/.gov domain  → halve risk score.
    """
    if _is_trusted_domain(url):
        logger.info(f"Trusted domain override applied for: {url}")
        return "legitimate", 0.98, 0.02

    registered = _get_registered_domain(url)
    ext = tldextract.extract(url)
    suffix = f".{ext.suffix}".lower() if ext.suffix else ""
    common_tlds = {".com", ".org", ".net", ".io", ".co", ".edu", ".gov", ".app", ".dev"}

    if _path_is_uuid_like(url) and suffix in common_tlds:
        risk_score = round(risk_score * 0.5, 4)
        if risk_score < 0.35:
            prediction = "legitimate"
            confidence = round(max(confidence, 1.0 - risk_score), 4)
        logger.info(f"UUID-path correction applied for: {url} → risk {risk_score}")

    return prediction, confidence, risk_score


class PhishingPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.SCALER_PATH):
            try:
                self.model = joblib.load(settings.MODEL_PATH)
                self.scaler = joblib.load(settings.SCALER_PATH)
                logger.info("ML model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                self.model = None
                self.scaler = None
        else:
            logger.warning("Trained model not found. Using rule-based fallback predictor.")

    def _rule_based_predict(self, features: dict, url: str = "") -> tuple[str, float, float]:
        score = 0.0
        max_score = 100.0

        if not features["is_https"]:
            score += 15
        if features["has_ip_address"]:
            score += 25
        if features["has_at_symbol"]:
            score += 20
        if features["has_suspicious_keywords"]:
            score += 15
        if features["has_uncommon_tld"]:
            score += 10
        if features["double_slash_redirect"]:
            score += 10
        if features["url_length"] > 100:
            score += 5
        if features["subdomain_count"] >= 3:
            score += 10
        if features["url_similarity_index"] > 0:
            score += features["url_similarity_index"] * 20

        has_uuid_path = _path_is_uuid_like(url) if url else False

        if not has_uuid_path:
            if features["dash_count"] >= 5:
                score += 5
            if features["entropy"] > 5.0:
                score += 5
        else:
            parsed = urlparse(url)
            domain_dashes = parsed.netloc.count("-")
            if domain_dashes >= 3:
                score += 5

        score = min(score, max_score)
        risk_score = round(score / max_score, 4)

        if risk_score >= 0.5:
            prediction = "phishing"
            confidence = round(0.5 + risk_score * 0.5, 4)
        else:
            prediction = "legitimate"
            confidence = round(1.0 - risk_score, 4)

        confidence = min(confidence, 0.99)
        return prediction, confidence, risk_score

    def predict(self, url: str) -> dict:
        features = extract_features(url)

        if self.model is not None and self.scaler is not None:
            try:
                vector = np.array(features_to_vector(features)).reshape(1, -1)
                vector_scaled = self.scaler.transform(vector)
                pred_int = int(self.model.predict(vector_scaled)[0])
                proba = self.model.predict_proba(vector_scaled)[0]

                if pred_int == 0:
                    prediction = "phishing"
                    confidence = round(float(proba[0]), 4)
                else:
                    prediction = "legitimate"
                    confidence = round(float(proba[1]), 4)

                phishing_prob = float(proba[0])
                risk_score = round(phishing_prob, 4)
            except Exception as e:
                logger.error(f"ML prediction failed, using rule-based: {e}")
                prediction, confidence, risk_score = self._rule_based_predict(features, url)
        else:
            prediction, confidence, risk_score = self._rule_based_predict(features, url)

        prediction, confidence, risk_score = _adjust_for_context(
            url, prediction, confidence, risk_score
        )

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "features": features,
            "model_used": "ml_model" if self.model is not None else "rule_based",
        }
