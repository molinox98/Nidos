import { apiGet, apiPost, apiDelete, apiRequest } from './client'

// LISTAR IMÁGENES DE NIDOS
export function getImagenes() {
  return apiGet('/api/imagenes/')
}

// SUBIR IMAGEN NUEVA (FormData multipart)
export function uploadImagen(formData) {
  return apiRequest('/api/imagenes/', {
    method: 'POST',
    body: formData,
  })
}

// MARCAR IMAGEN COMO PRINCIPAL
export function marcarImagenPrincipal(id) {
  return apiRequest(`/api/imagenes/${id}/marcar-principal/`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

// ELIMINAR IMAGEN
export function deleteImagen(id) {
  return apiDelete(`/api/imagenes/${id}/`)
}
