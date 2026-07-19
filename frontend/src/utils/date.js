export function formatoFecha(fecha) {
  if (!fecha) return ''
  const [año, mes, dia] = fecha.split('T')[0].split('-')
  return `${dia}/${mes}/${año}`
}

export function formatoFechaHora(fecha) {
  if (!fecha) return ''
  const partes = fecha.split('T')
  const [año, mes, dia] = partes[0].split('-')
  if (partes.length < 2) return `${dia}/${mes}/${año}`
  const hora = partes[1].substring(0, 5)
  return `${dia}/${mes}/${año} ${hora}`
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

export function textoTipoEvento(tipo) {
  const mapa = {
    cambio_estado: 'Cambio de estado',
    revision: 'Revisión',
    incidencia: 'Incidencia',
    mantenimiento: 'Mantenimiento',
    otro: 'Otro',
  }
  return mapa[tipo] || tipo
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
