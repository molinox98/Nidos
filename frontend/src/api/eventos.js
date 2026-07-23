import { apiGet, apiPost } from './client'

// LISTAR EVENTOS
export function getEventos() {
  return apiGet('/api/eventos/')
}

// REGISTRAR NUEVO EVENTO EN EL NIDO
export function createEvento(body) {
  return apiPost('/api/eventos/', body)
}
