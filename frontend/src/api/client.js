const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('access')
}

export function setTokens(access, refresh) {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = getToken()

  const headers = {
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearTokens()
    throw new Error('SESSION_EXPIRED')
  }

  const data = await response.json()

  if (!response.ok) {
    const error = new Error('API_ERROR')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function apiGet(path) {
  return apiRequest(path)
}

export async function apiPatch(path, body) {
  return apiRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
