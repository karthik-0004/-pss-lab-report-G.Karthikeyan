import api from '../lib/axios'

export async function getAllPatients(search = '') {
  const params = search ? { search } : undefined
  const response = await api.get('/patients', { params })
  return response.data
}

export async function getPatientById(patientId) {
  const response = await api.get(`/patients/${patientId}`)
  return response.data
}

export async function createPatient(patientData) {
  const response = await api.post('/patients', patientData)
  return response.data
}

export async function updatePatient(patientId, patientData) {
  const response = await api.put(`/patients/${patientId}`, patientData)
  return response.data
}

export async function deletePatient(patientId) {
  const response = await api.delete(`/patients/${patientId}`)
  return response.data
}
