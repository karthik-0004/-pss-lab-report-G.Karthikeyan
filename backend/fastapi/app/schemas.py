from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact_number: str


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: str
    name: str
    age: int
    gender: str
    contact_number: str
    created_at: datetime


class LabReportCreate(BaseModel):
    report_type: str
    report_date: date
    result_value: float
    unit: str
    reference_min: float
    reference_max: float


class LabReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    report_type: str
    report_date: date
    result_value: float
    unit: str
    reference_min: float
    reference_max: float
    status: str
    file_path: str | None
    created_at: datetime
    patient: PatientResponse


class DashboardStats(BaseModel):
    total_patients: int = Field(default=0)
    total_reports: int = Field(default=0)
    abnormal_reports: int = Field(default=0)
    reports_today: int = Field(default=0)
    recent_reports: list[LabReportResponse] = Field(default_factory=list)


class PatientWithReportsResponse(BaseModel):
    patient: PatientResponse
    reports: list[LabReportResponse]
