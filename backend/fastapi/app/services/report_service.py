import os
from datetime import date, datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..constants import STATUSES

NORMAL_STATUS = STATUSES[0]
ABNORMAL_STATUS = STATUSES[1]
PENDING_STATUS = STATUSES[2]


def compute_status(result_value: float, reference_min: float, reference_max: float) -> str:
	if reference_min is None or reference_max is None:
		return PENDING_STATUS

	if result_value < reference_min or result_value > reference_max:
		return ABNORMAL_STATUS

	return NORMAL_STATUS


def get_all_reports(
	db: Session,
	report_type: str | None = None,
	status: str | None = None,
	date_from: str | None = None,
	date_to: str | None = None,
	patient_id: str | None = None,
) -> list[models.LabReport]:
	query = (
		db.query(models.LabReport)
		.join(models.Patient)
		.options(joinedload(models.LabReport.patient))
	)

	if report_type:
		query = query.filter(models.LabReport.report_type == report_type)

	if status:
		query = query.filter(models.LabReport.status == status)

	if date_from:
		try:
			from_date = date.fromisoformat(date_from)
		except ValueError as exc:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Invalid date_from format. Use YYYY-MM-DD",
			) from exc
		query = query.filter(models.LabReport.report_date >= from_date)

	if date_to:
		try:
			to_date = date.fromisoformat(date_to)
		except ValueError as exc:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Invalid date_to format. Use YYYY-MM-DD",
			) from exc
		query = query.filter(models.LabReport.report_date <= to_date)

	if patient_id:
		query = query.filter(models.Patient.patient_id == patient_id)

	return query.order_by(desc(models.LabReport.created_at)).all()


def get_report_by_id(db: Session, report_id: int) -> models.LabReport:
	report = (
		db.query(models.LabReport)
		.options(joinedload(models.LabReport.patient))
		.filter(models.LabReport.id == report_id)
		.first()
	)
	if not report:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
	return report


def create_report(
	db: Session,
	patient_db_id: int,
	report_data: schemas.LabReportCreate,
	file_path: str | None = None,
) -> models.LabReport:
	computed_status = compute_status(
		report_data.result_value,
		report_data.reference_min,
		report_data.reference_max,
	)

	report = models.LabReport(
		patient_id=patient_db_id,
		report_type=report_data.report_type,
		report_date=report_data.report_date,
		result_value=report_data.result_value,
		unit=report_data.unit,
		reference_min=report_data.reference_min,
		reference_max=report_data.reference_max,
		status=computed_status,
		file_path=file_path,
	)
	db.add(report)
	db.commit()
	db.refresh(report)
	return get_report_by_id(db, report.id)


def update_report(
	db: Session,
	report_id: int,
	report_data: schemas.LabReportCreate,
	file_path: str | None = None,
) -> models.LabReport:
	report = get_report_by_id(db, report_id)

	report.report_type = report_data.report_type
	report.report_date = report_data.report_date
	report.result_value = report_data.result_value
	report.unit = report_data.unit
	report.reference_min = report_data.reference_min
	report.reference_max = report_data.reference_max
	report.status = compute_status(
		report_data.result_value,
		report_data.reference_min,
		report_data.reference_max,
	)

	if file_path is not None:
		report.file_path = file_path

	db.commit()
	db.refresh(report)
	return get_report_by_id(db, report.id)


def delete_report(db: Session, report_id: int) -> dict[str, str]:
	report = get_report_by_id(db, report_id)

	if report.file_path:
		file_to_delete = report.file_path.lstrip("/")
		if os.path.exists(file_to_delete):
			try:
				os.remove(file_to_delete)
			except OSError:
				pass

	db.delete(report)
	db.commit()
	return {"message": "Report deleted successfully"}


def get_dashboard_stats(db: Session) -> dict[str, Any]:
	today = datetime.utcnow().date()

	total_patients = db.query(func.count(models.Patient.id)).scalar() or 0
	total_reports = db.query(func.count(models.LabReport.id)).scalar() or 0
	abnormal_reports = (
		db.query(func.count(models.LabReport.id))
		.filter(models.LabReport.status == ABNORMAL_STATUS)
		.scalar()
		or 0
	)
	reports_today = (
		db.query(func.count(models.LabReport.id))
		.filter(func.date(models.LabReport.created_at) == today)
		.scalar()
		or 0
	)

	recent_reports = (
		db.query(models.LabReport)
		.join(models.Patient)
		.options(joinedload(models.LabReport.patient))
		.order_by(desc(models.LabReport.created_at))
		.limit(10)
		.all()
	)

	return {
		"total_patients": total_patients,
		"total_reports": total_reports,
		"abnormal_reports": abnormal_reports,
		"reports_today": reports_today,
		"recent_reports": recent_reports,
	}
