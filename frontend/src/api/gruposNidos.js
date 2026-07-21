import { apiGet, apiPost } from './client'

export function getGruposNidos() {
  return apiGet('/api/grupos-nidos/')
}

export function createGrupoNido(payload) {
  return apiPost('/api/grupos-nidos/', payload)
}
