import { apiGet } from './client'

export function getObservaciones() {
  return apiGet('/api/observaciones/')
}
