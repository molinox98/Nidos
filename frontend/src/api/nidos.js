import { apiGet } from './client'

export function getNidosMapa() {
  return apiGet('/api/mapa/nidos/')
}

export function getNidoDetalle(id) {
  return apiGet(`/api/nidos/${id}/`)
}
