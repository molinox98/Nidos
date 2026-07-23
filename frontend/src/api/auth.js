import { apiPost, apiGet, setTokens, clearTokens } from './client'

// LOGIN: OBTENER Y GUARDAR TOKENS JWT
export async function login(username, password) {
  const data = await apiPost('/api/token/', { username, password })
  setTokens(data.access, data.refresh)
  return data
}

export async function refreshToken(refresh) {
  const data = await apiPost('/api/token/refresh/', { refresh })
  setTokens(data.access, data.refresh)
  return data
}

// OBTENER USUARIO AUTENTICADO DESDE EL TOKEN
export async function getUsuarioActual() {
  return apiGet('/api/me/')
}

export function logout() {
  clearTokens()
}
