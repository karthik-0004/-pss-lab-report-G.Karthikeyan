export const API_BASE_URL = 'http://localhost:8000/api'

export const REPORT_TYPES = ['Blood Test', 'Urine Test', 'Lipid Panel', 'Custom']
export const GENDERS = ['Male', 'Female', 'Other']
export const STATUSES = ['Normal', 'Abnormal', 'Pending']

export const STATUS_COLORS = {
  Normal: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success' },
  Abnormal: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  Pending: { bg: 'bg-pending-light', text: 'text-pending', dot: 'bg-pending' },
}

export const REPORT_TYPE_COLORS = {
  'Blood Test': 'bg-blue-50 text-blue-600',
  'Urine Test': 'bg-purple-50 text-purple-600',
  'Lipid Panel': 'bg-orange-50 text-orange-600',
  Custom: 'bg-slate-100 text-slate-600',
}

export const ROUTES = {
  DASHBOARD: '/',
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',
  ADD_PATIENT: '/patients/new',
}
