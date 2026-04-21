import os
from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status as http_status
from sqlalchemy.orm import Session

from .. import schemas
from ..constants import REPORT_TYPES, STATUSES
from ..database import get_db
from ..services import patient_service, report_service

router = APIRouter(prefix="/api/reports", tags=["reports"])

UPLOAD_DIR = "uploads"
ALLOWED_UPLOAD_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}


def _parse_report_date(report_date: str) -> date:
	try:
		return date.fromisoformat(report_date)
	except ValueError as exc:
		raise HTTPException(
			status_code=http_status.HTTP_400_BAD_REQUEST,
			detail="Invalid report_date format. Use YYYY-MM-DD",
		) from exc


def _save_uploaded_file(file: UploadFile | None) -> str | None:
	if file is None:
		return None

	if file.content_type not in ALLOWED_UPLOAD_TYPES:
		raise HTTPException(
			status_code=http_status.HTTP_400_BAD_REQUEST,
			detail="Only PDF and image files are allowed",
		)

	os.makedirs(UPLOAD_DIR, exist_ok=True)
	filename = f"{uuid4()}_{file.filename}"
	destination = os.path.join(UPLOAD_DIR, filename)

	with open(destination, "wb") as buffer:
		buffer.write(file.file.read())

	return f"/uploads/{filename}"


@router.get("", response_model=list[schemas.LabReportResponse])
def list_reports(
	report_type: str | None = None,
	status: str | None = None,
	date_from: str | None = None,
	date_to: str | None = None,
	patient_id: str | None = None,
	db: Session = Depends(get_db),
):
	if report_type is not None and report_type not in REPORT_TYPES:
		raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid report type")

	if status is not None and status not in STATUSES:
		raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid status")

	return report_service.get_all_reports(
		db=db,
		report_type=report_type,
		status=status,
		date_from=date_from,
		date_to=date_to,
		patient_id=patient_id,
	)


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)) -> dict:
	return report_service.get_dashboard_stats(db)


@router.get("/{report_id}", response_model=schemas.LabReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
	return report_service.get_report_by_id(db, report_id)


@router.post("/{patient_id}", response_model=schemas.LabReportResponse, status_code=http_status.HTTP_201_CREATED)
def create_report(
	patient_id: str,
	report_type: str = Form(...),
	report_date: str = Form(...),
	result_value: float = Form(...),
	unit: str = Form(...),
	reference_min: float = Form(...),
	reference_max: float = Form(...),
	file: UploadFile | None = File(None),
	db: Session = Depends(get_db),
):
	if report_type not in REPORT_TYPES:
		raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid report type")

	patient = patient_service.get_patient_by_id(db, patient_id)
	parsed_date = _parse_report_date(report_date)
	file_path = _save_uploaded_file(file)

	payload = schemas.LabReportCreate(
		report_type=report_type,
		report_date=parsed_date,
		result_value=result_value,
		unit=unit,
		reference_min=reference_min,
		reference_max=reference_max,
	)
	return report_service.create_report(db, patient.id, payload, file_path)


@router.put("/{report_id}", response_model=schemas.LabReportResponse)
def update_report(
	report_id: int,
	report_type: str = Form(...),
	report_date: str = Form(...),
	result_value: float = Form(...),
	unit: str = Form(...),
	reference_min: float = Form(...),
	reference_max: float = Form(...),
	file: UploadFile | None = File(None),
	db: Session = Depends(get_db),
):
	if report_type not in REPORT_TYPES:
		raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid report type")

	parsed_date = _parse_report_date(report_date)
	file_path = _save_uploaded_file(file)
	payload = schemas.LabReportCreate(
		report_type=report_type,
		report_date=parsed_date,
		result_value=result_value,
		unit=unit,
		reference_min=reference_min,
		reference_max=reference_max,
	)
	return report_service.update_report(db, report_id, payload, file_path)


@router.delete("/{report_id}", status_code=http_status.HTTP_200_OK)
def delete_report(report_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
	return report_service.delete_report(db, report_id)
