import { apiGet, apiPost } from './client'

// LISTAR OBSERVACIONES
export function getObservaciones() {
  return apiGet('/api/observaciones/')
}

// REGISTRAR NUEVA OBSERVACIÓN
export function createObservacion(body) {
  return apiPost('/api/observaciones/', body)
}
