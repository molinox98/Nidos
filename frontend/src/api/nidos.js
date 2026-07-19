import { apiGet } from './client'

export function getNidosMapa() {
  return apiGet('/api/mapa/nidos/')
}
