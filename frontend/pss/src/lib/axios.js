import axios from 'axios'
import { API_BASE_URL } from '../constants'

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
    const cleanError = {
      message: error?.response?.data?.detail || error?.message || 'Request failed',
      status: error?.response?.status || 500,
    }
    return Promise.reject(cleanError)
  },
)

export default api
