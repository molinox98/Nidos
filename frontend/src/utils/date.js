export function formatoFecha(fecha) {
  if (!fecha) return ''
  const [año, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${año}`
}

export function textoEstado(estado) {
  const mapa = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    destruido: 'Destruido',
    retirado: 'Retirado',
  }
  return mapa[estado] || estado
}

export function colorEstado(estado) {
  const mapa = {
    activo: '#27ae60',
    inactivo: '#95a5a6',
    destruido: '#c0392b',
    retirado: '#e67e22',
  }
  return mapa[estado] || '#95a5a6'
}
