import axios from 'axios'
import { API_BASE_URL } from '../constants'

function normalizeErrorDetail(detail) {
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && typeof item.msg === 'string') return item.msg
        return null
      })
      .filter(Boolean)
      .join(', ')
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string') return detail.message
    if (typeof detail.msg === 'string') return detail.msg
  }

  return ''
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      const method = (config.method || 'get').toUpperCase()
      console.log(`[API] ${method} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail
    const cleanError = {
      message: normalizeErrorDetail(detail) || error?.message || 'Request failed',
      status: error?.response?.status || 500,
    }
    return Promise.reject(cleanError)
  },
)

export default api
