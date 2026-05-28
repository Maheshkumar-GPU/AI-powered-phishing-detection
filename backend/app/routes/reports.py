from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Report, ScanRecord
from app.schemas import ReportOut

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=list[ReportOut])
async def list_reports(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 20,
):
    offset = (page - 1) * limit
    reports = (
        db.query(Report)
        .order_by(Report.generated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return reports


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/scan/{scan_id}", response_model=ReportOut)
async def get_report_by_scan(scan_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.scan_id == scan_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report for this scan not found")
    return report


@router.delete("/{report_id}")
async def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"deleted": True}
