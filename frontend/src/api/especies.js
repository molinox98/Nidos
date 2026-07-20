import { apiGet } from './client'

export function getEspecies() {
  return apiGet('/api/especies/')
}
