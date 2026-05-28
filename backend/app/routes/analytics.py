from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Float, text
from app.database import get_db
from app.models import ScanRecord
from app.schemas import AnalyticsSummary, ScanRecordOut
import tldextract

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(db: Session = Depends(get_db)):
    total_scans = db.query(func.count(ScanRecord.id)).scalar() or 0
    phishing_count = (
        db.query(func.count(ScanRecord.id))
        .filter(ScanRecord.prediction == "phishing")
        .scalar() or 0
    )
    legitimate_count = total_scans - phishing_count
    avg_risk_score = db.query(func.avg(ScanRecord.risk_score)).scalar() or 0.0
    phishing_rate = phishing_count / total_scans if total_scans > 0 else 0.0

    recent = (
        db.query(ScanRecord)
        .order_by(ScanRecord.scanned_at.desc())
        .limit(10)
        .all()
    )

    all_records = db.query(ScanRecord.risk_score).all()
    low = sum(1 for r in all_records if r.risk_score < 0.3)
    medium = sum(1 for r in all_records if 0.3 <= r.risk_score < 0.6)
    high = sum(1 for r in all_records if 0.6 <= r.risk_score < 0.85)
    critical = sum(1 for r in all_records if r.risk_score >= 0.85)
    risk_distribution = [
        {"range": "Low (0-30%)", "count": low},
        {"range": "Medium (30-60%)", "count": medium},
        {"range": "High (60-85%)", "count": high},
        {"range": "Critical (85-100%)", "count": critical},
    ]

    phishing_records = (
        db.query(ScanRecord.url)
        .filter(ScanRecord.prediction == "phishing")
        .all()
    )
    tld_counts: dict[str, int] = {}
    for (url,) in phishing_records:
        try:
            ext = tldextract.extract(url)
            tld = f".{ext.suffix}" if ext.suffix else "unknown"
            tld_counts[tld] = tld_counts.get(tld, 0) + 1
        except Exception:
            pass
    top_phishing_tlds = sorted(
        [{"tld": k, "count": v} for k, v in tld_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:8]

    try:
        daily_raw = (
            db.execute(
                text(
                    "SELECT DATE(scanned_at) as day, COUNT(*) as total, "
                    "SUM(CASE WHEN prediction='phishing' THEN 1 ELSE 0 END) as phishing_count "
                    "FROM scan_records "
                    "GROUP BY DATE(scanned_at) "
                    "ORDER BY day DESC LIMIT 14"
                )
            ).fetchall()
        )
        daily_scan_counts = [
            {"date": str(row[0]), "total": row[1], "phishing": row[2]}
            for row in daily_raw
        ]
        daily_scan_counts.reverse()
    except Exception:
        daily_scan_counts = []

    return AnalyticsSummary(
        total_scans=total_scans,
        phishing_count=phishing_count,
        legitimate_count=legitimate_count,
        phishing_rate=round(phishing_rate, 4),
        avg_risk_score=round(float(avg_risk_score), 4),
        recent_scans=[
            ScanRecordOut(
                id=r.id,
                url=r.url,
                prediction=r.prediction,
                confidence=r.confidence,
                risk_score=r.risk_score,
                scanned_at=r.scanned_at,
            )
            for r in recent
        ],
        risk_distribution=risk_distribution,
        top_phishing_tlds=top_phishing_tlds,
        daily_scan_counts=daily_scan_counts,
    )


@router.get("/model-status")
async def model_status():
    import os
    from app.config import settings
    model_exists = os.path.exists(settings.MODEL_PATH)
    scaler_exists = os.path.exists(settings.SCALER_PATH)
    return {
        "model_trained": model_exists and scaler_exists,
        "model_path": settings.MODEL_PATH,
        "scaler_path": settings.SCALER_PATH,
        "ollama_model": settings.OLLAMA_MODEL,
        "ollama_url": settings.OLLAMA_BASE_URL,
    }
