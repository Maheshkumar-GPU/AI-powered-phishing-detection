from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ScanRecord
from app.schemas import ScanRecordOut
from typing import Optional

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/", response_model=list[ScanRecordOut])
async def get_history(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    prediction: Optional[str] = Query(None, pattern="^(phishing|legitimate)$"),
    search: Optional[str] = None,
):
    offset = (page - 1) * limit
    query = db.query(ScanRecord)

    if prediction:
        query = query.filter(ScanRecord.prediction == prediction)
    if search:
        query = query.filter(ScanRecord.url.contains(search))

    records = (
        query.order_by(ScanRecord.scanned_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return records


@router.get("/count")
async def get_history_count(
    db: Session = Depends(get_db),
    prediction: Optional[str] = None,
):
    query = db.query(ScanRecord)
    if prediction:
        query = query.filter(ScanRecord.prediction == prediction)
    return {"count": query.count()}


@router.delete("/{scan_id}")
async def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        return {"deleted": False, "message": "Record not found"}
    db.delete(record)
    db.commit()
    return {"deleted": True}


@router.delete("/")
async def clear_all_history(db: Session = Depends(get_db)):
    deleted = db.query(ScanRecord).delete()
    db.commit()
    return {"deleted": deleted}
