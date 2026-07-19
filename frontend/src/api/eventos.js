import { apiGet } from './client'

export function getEventos() {
  return apiGet('/api/eventos/')
}
