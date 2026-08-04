import { apiGet, apiPost, apiPatch } from './client'

// LISTAR ESPECIES
export function getEspecies() {
  return apiGet('/api/especies/')
}

// CREAR ESPECIE
export function createEspecie(data) {
  return apiPost('/api/especies/', data)
}

// ACTUALIZAR ESPECIE
export function updateEspecie(id, data) {
  return apiPatch(`/api/especies/${id}/`, data)
}
