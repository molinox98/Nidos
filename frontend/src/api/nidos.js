import { apiGet, apiPost, apiPatch } from './client'

export function getNidosMapa() {
  return apiGet('/api/mapa/nidos/')
}

export function getNidoDetalle(id) {
  return apiGet(`/api/nidos/${id}/`)
}

export function createNido(body) {
  return apiPost('/api/nidos/', body)
}

export function updateNido(id, body) {
  return apiPatch(`/api/nidos/${id}/`, body)
}
