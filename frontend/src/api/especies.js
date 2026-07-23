import { apiGet } from './client'

// LISTAR ESPECIES
export function getEspecies() {
  return apiGet('/api/especies/')
}
