from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ml.predictor import PhishingPredictor

_predictor: PhishingPredictor | None = None


def get_predictor() -> PhishingPredictor:
    global _predictor
    if _predictor is None:
        _predictor = PhishingPredictor()
    return _predictor
