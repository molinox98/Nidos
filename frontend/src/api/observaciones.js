import { apiGet, apiPost, apiPatch } from './client'

// LISTAR OBSERVACIONES
export function getObservaciones() {
  return apiGet('/api/observaciones/')
}

// REGISTRAR NUEVA OBSERVACIÓN
export function createObservacion(body) {
  return apiPost('/api/observaciones/', body)
}

// ACTUALIZAR OBSERVACIÓN (PATCH)
export function updateObservacion(id, body) {
  return apiPatch(`/api/observaciones/${id}/`, body)
}
