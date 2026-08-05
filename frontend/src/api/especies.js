import { apiGet, apiPost, apiPatch, apiDelete } from './client'

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

// ELIMINAR ESPECIE
export function deleteEspecie(id) {
  return apiDelete(`/api/especies/${id}/`)
}
