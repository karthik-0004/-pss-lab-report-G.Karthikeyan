from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from ..constants import PATIENT_ID_PREFIX
from .. import models, schemas


def get_all_patients(db: Session, search: str | None = None) -> list[models.Patient]:
	query = db.query(models.Patient)

	if search and search.strip():
		term = f"%{search.strip()}%"
		query = query.filter(
			or_(
				models.Patient.name.ilike(term),
				models.Patient.patient_id.ilike(term),
			)
		)

	return query.order_by(desc(models.Patient.created_at)).all()


def get_patient_by_id(db: Session, patient_id: str) -> models.Patient:
	patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
	if not patient:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
	return patient


def create_patient(db: Session, patient_data: schemas.PatientCreate) -> models.Patient:
	next_number = db.query(models.Patient).count() + 1

	generated_patient_id = f"{PATIENT_ID_PREFIX}-{next_number:04d}"
	while db.query(models.Patient).filter(models.Patient.patient_id == generated_patient_id).first():
		next_number += 1
		generated_patient_id = f"{PATIENT_ID_PREFIX}-{next_number:04d}"

	patient = models.Patient(
		patient_id=generated_patient_id,
		name=patient_data.name,
		age=patient_data.age,
		gender=patient_data.gender,
		contact_number=patient_data.contact_number,
	)
	db.add(patient)
	db.commit()
	db.refresh(patient)
	return patient


def update_patient(db: Session, patient_id: str, patient_data: schemas.PatientCreate) -> models.Patient:
	patient = get_patient_by_id(db, patient_id)

	update_payload = patient_data.model_dump(exclude_unset=True)
	for field in ["name", "age", "gender", "contact_number"]:
		if field in update_payload:
			setattr(patient, field, update_payload[field])

	db.commit()
	db.refresh(patient)
	return patient


def delete_patient(db: Session, patient_id: str) -> dict[str, str]:
	patient = get_patient_by_id(db, patient_id)

	db.query(models.LabReport).filter(models.LabReport.patient_id == patient.id).delete(
		synchronize_session=False
	)
	db.delete(patient)
	db.commit()

	return {"message": "Patient deleted successfully"}


def get_patient_with_reports(db: Session, patient_id: str) -> dict[str, Any]:
	patient = get_patient_by_id(db, patient_id)

	reports = (
		db.query(models.LabReport)
		.filter(models.LabReport.patient_id == patient.id)
		.order_by(desc(models.LabReport.report_date))
		.all()
	)

	return {"patient": patient, "reports": reports}
