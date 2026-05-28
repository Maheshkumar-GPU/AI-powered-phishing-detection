import os
import joblib
import numpy as np
from app.ml.feature_extractor import extract_features, features_to_vector
from app.config import settings
from app.utils.logger import logger


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

    def _rule_based_predict(self, features: dict) -> tuple[str, float, float]:
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
        if features["url_length"] > 75:
            score += 5
        if features["subdomain_count"] >= 3:
            score += 10
        if features["dash_count"] >= 3:
            score += 5
        if features["url_similarity_index"] > 0:
            score += features["url_similarity_index"] * 20
        if features["entropy"] > 4.5:
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
                prediction, confidence, risk_score = self._rule_based_predict(features)
        else:
            prediction, confidence, risk_score = self._rule_based_predict(features)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "features": features,
            "model_used": "ml_model" if self.model is not None else "rule_based",
        }
