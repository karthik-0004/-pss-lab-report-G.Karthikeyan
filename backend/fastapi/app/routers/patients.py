from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas
from ..services import patient_service

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[schemas.PatientResponse])
def list_patients(search: str | None = None, db: Session = Depends(get_db)):
	return patient_service.get_all_patients(db, search)


@router.get("/{patient_id}", response_model=schemas.PatientWithReportsResponse)
def get_patient_profile(patient_id: str, db: Session = Depends(get_db)):
	return patient_service.get_patient_with_reports(db, patient_id)


@router.post("", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
	return patient_service.create_patient(db, payload)


@router.put("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: str, payload: schemas.PatientCreate, db: Session = Depends(get_db)):
	return patient_service.update_patient(db, patient_id, payload)


@router.delete("/{patient_id}", status_code=status.HTTP_200_OK)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
	return patient_service.delete_patient(db, patient_id)
