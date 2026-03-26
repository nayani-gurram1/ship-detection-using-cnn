/**
 * API Service Layer
 * Centralizes all HTTP calls to the FastAPI backend.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
})

/* ── Detection ────────────────────────────────────────── */
export const detectShips = (file, confidenceThreshold = 0.5) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/api/detect?confidence_threshold=${confidenceThreshold}`, form)
}

export const getDetections = (limit = 20) =>
  api.get(`/api/detections?limit=${limit}`)

export const getDetection = (id) =>
  api.get(`/api/detections/${id}`)

/* ── Dashboard ────────────────────────────────────────── */
export const getDashboardStats = () =>
  api.get('/api/dashboard/stats')

/* ── Alerts ───────────────────────────────────────────── */
export const getAlerts = (limit = 50) =>
  api.get(`/api/alerts?limit=${limit}`)

export const acknowledgeAlert = (id) =>
  api.post(`/api/alerts/${id}/acknowledge`)

/* ── Traffic ──────────────────────────────────────────── */
export const getTraffic = () =>
  api.get('/api/traffic')

/* ── Collisions ───────────────────────────────────────── */
export const getCollisions = () =>
  api.get('/api/collisions')

/* ── Analytics ────────────────────────────────────────── */
export const getAnalytics = () =>
  api.get('/api/analytics')

/* ── Model Performance ────────────────────────────────── */
export const getModelPerformance = () =>
  api.get('/api/model/performance')

/* ── Reports ──────────────────────────────────────────── */
export const downloadJSON = () =>
  api.get('/api/reports/json', { responseType: 'blob' })

export const downloadCSV = () =>
  api.get('/api/reports/csv', { responseType: 'blob' })

/* ── System Info ──────────────────────────────────────── */
export const getSystemInfo = () =>
  api.get('/api/system/info')
