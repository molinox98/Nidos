import { apiGet, apiPost, apiPatch } from './client'

// LISTAR EVENTOS
export function getEventos() {
  return apiGet('/api/eventos/')
}

// REGISTRAR NUEVO EVENTO EN EL NIDO
export function createEvento(body) {
  return apiPost('/api/eventos/', body)
}

// ACTUALIZAR EVENTO (PATCH)
export function updateEvento(id, body) {
  return apiPatch(`/api/eventos/${id}/`, body)
}
