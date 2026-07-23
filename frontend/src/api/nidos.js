import { apiGet, apiPost, apiPatch } from './client'

// DATOS COMPACTOS DE NIDOS PARA EL MAPA
export function getNidosMapa() {
  return apiGet('/api/mapa/nidos/')
}

// DETALLE COMPLETO DE UN NIDO
export function getNidoDetalle(id) {
  return apiGet(`/api/nidos/${id}/`)
}

// CREAR NIDO INDIVIDUAL
export function createNido(body) {
  return apiPost('/api/nidos/', body)
}

// ACTUALIZAR NIDO (PATCH)
export function updateNido(id, body) {
  return apiPatch(`/api/nidos/${id}/`, body)
}
