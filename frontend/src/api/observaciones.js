import { apiGet, apiPost, apiPatch, apiDelete } from './client'

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

// ELIMINAR OBSERVACIÓN
export function deleteObservacion(id) {
  return apiDelete(`/api/observaciones/${id}/`)
}
