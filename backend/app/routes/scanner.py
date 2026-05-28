from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ScanRequest, ScanResponse
from app.models import ScanRecord, Report
from app.dependencies import get_predictor
from app.ml.predictor import PhishingPredictor
from app.ollama.client import ollama_client
from app.utils.validators import sanitize_url
from app.utils.logger import logger
import json

router = APIRouter(prefix="/scanner", tags=["Scanner"])


@router.post("/scan", response_model=ScanResponse)
async def scan_url(
    payload: ScanRequest,
    request: Request,
    db: Session = Depends(get_db),
    predictor: PhishingPredictor = Depends(get_predictor),
):
    url = sanitize_url(payload.url)
    logger.info(f"Scanning URL: {url}")

    result = predictor.predict(url)
    prediction = result["prediction"]
    confidence = result["confidence"]
    risk_score = result["risk_score"]
    features = result["features"]

    ai_analysis = await ollama_client.analyze_url(
        url=url,
        prediction=prediction,
        confidence=confidence,
        risk_score=risk_score,
        features=features,
    )

    record = ScanRecord(
        url=url,
        prediction=prediction,
        confidence=confidence,
        risk_score=risk_score,
        features=features,
        ai_analysis=ai_analysis,
        threat_summary=ai_analysis.get("threat_summary", ""),
        ip_address=request.client.host if request.client else None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    report = Report(
        scan_id=record.id,
        url=url,
        report_data={
            "scan_id": record.id,
            "url": url,
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "features": features,
            "ai_analysis": ai_analysis,
            "model_used": result.get("model_used", "unknown"),
        },
    )
    db.add(report)
    db.commit()

    logger.info(f"Scan complete — {prediction} (risk: {risk_score:.2%})")
    return ScanResponse(
        id=record.id,
        url=record.url,
        prediction=record.prediction,
        confidence=record.confidence,
        risk_score=record.risk_score,
        features=features,
        ai_analysis=ai_analysis,
        scanned_at=record.scanned_at,
    )


@router.get("/scan/{scan_id}")
async def get_scan(scan_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return record
