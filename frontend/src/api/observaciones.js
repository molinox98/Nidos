import { apiGet, apiPost } from './client'

export function getObservaciones() {
  return apiGet('/api/observaciones/')
}

export function createObservacion(body) {
  return apiPost('/api/observaciones/', body)
}
