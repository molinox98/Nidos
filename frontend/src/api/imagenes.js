import { apiGet } from './client'

// LISTAR IMÁGENES DE NIDOS
export function getImagenes() {
  return apiGet('/api/imagenes/')
}
