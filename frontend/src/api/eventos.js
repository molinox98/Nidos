import { apiGet, apiPost } from './client'

export function getEventos() {
  return apiGet('/api/eventos/')
}

export function createEvento(body) {
  return apiPost('/api/eventos/', body)
}
