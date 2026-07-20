import { apiGet } from './client'

export function getGruposNidos() {
  return apiGet('/api/grupos-nidos/')
}
