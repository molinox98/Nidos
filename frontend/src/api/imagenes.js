import { apiGet } from './client'

export function getImagenes() {
  return apiGet('/api/imagenes/')
}
