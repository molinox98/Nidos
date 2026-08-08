import { apiGet, apiPost, apiPatch } from './client'

// LISTAR USUARIOS
export function getUsuarios() {
  return apiGet('/api/usuarios/')
}

// CREAR USUARIO
export function createUsuario(data) {
  return apiPost('/api/usuarios/', data)
}

// ACTUALIZAR USUARIO
export function updateUsuario(id, data) {
  return apiPatch(`/api/usuarios/${id}/`, data)
}
