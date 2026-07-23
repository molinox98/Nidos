import { apiGet, apiPost } from './client'

// LISTAR GRUPOS DE NIDOS
export function getGruposNidos() {
  return apiGet('/api/grupos-nidos/')
}

// CREAR GRUPO DE NIDOS
export function createGrupoNido(payload) {
  return apiPost('/api/grupos-nidos/', payload)
}
