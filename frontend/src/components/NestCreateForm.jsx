import { useState, useEffect } from 'react'
import { createNido, updateNido } from '../api/nidos'
import { formatoFecha } from '../utils/date'

const ESTADOS = ['activo', 'inactivo', 'destruido', 'retirado']
const METODOS_UBICACION = ['manual_mapa', 'gps_movil', 'importado']

const ESTADO_TEXTO = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  destruido: 'Destruido',
  retirado: 'Retirado',
}

const METODO_TEXTO = {
  manual_mapa: 'Manual (mapa)',
  gps_movil: 'GPS móvil',
  importado: 'Importado',
}

// FECHA DE HOY EN FORMATO ISO
function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

// SUGIERE EL SIGUIENTE CÓDIGO NUMÉRICO DENTRO DEL GRUPO
function siguienteCodigoGrupo(nidos) {
  let max = 0
  for (const n of nidos) {
    const num = parseInt(n.codigo_en_grupo, 10)
    if (Number.isFinite(num) && num > max) max = num
  }
  return max > 0 ? String(max + 1) : ''
}

// FORMATO DE ERRORES DE LA API
function formatearError(err) {
  if (err.data) {
    const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    return msgs.join(' | ')
  }
  return null
}

export default function NestCreateForm({
  grupo,
  modo = 'crear',
  nidoInicial = null,
  fechaMaximaDescubrimiento = null,
  onCrear,
  onGuardar,
  onCerrar,
  onIniciarSeleccion,
  onCancelarSeleccion,
  seleccionandoUbicacion,
  ubicacionTemporal,
  ocultoMovil,
}) {
  // MODO EDICIÓN
  const esEdicion = modo === 'editar'

  // DATOS INICIALES DEL NIDO
  const enGrupo = esEdicion ? Boolean(nidoInicial && nidoInicial.grupo_nido) : Boolean(grupo)
  const codigoSugerido = !esEdicion && grupo ? siguienteCodigoGrupo(grupo.nidos) : ''

  const [nombre, setNombre] = useState(() => {
    if (esEdicion) return (nidoInicial && nidoInicial.nombre) || ''
    return codigoSugerido ? `${grupo.nombre} - Nido ${codigoSugerido}` : ''
  })
  const [latitud, setLatitud] = useState(() => {
    if (esEdicion) return nidoInicial ? String(nidoInicial.latitud) : ''
    return grupo ? String(grupo.lat) : ''
  })
  const [longitud, setLongitud] = useState(() => {
    if (esEdicion) return nidoInicial ? String(nidoInicial.longitud) : ''
    return grupo ? String(grupo.lng) : ''
  })
  const [descripcion, setDescripcion] = useState(() => (
    esEdicion && nidoInicial ? (nidoInicial.descripcion || '') : ''
  ))
  const [fechaDescubrimiento, setFechaDescubrimiento] = useState(() => (
    esEdicion && nidoInicial ? (nidoInicial.fecha_descubrimiento || '') : hoyISO()
  ))
  const [estado, setEstado] = useState(() => (nidoInicial ? nidoInicial.estado : 'activo'))
  const [fechaEstado, setFechaEstado] = useState(() => (
    nidoInicial ? (nidoInicial.fecha_estado || '') : hoyISO()
  ))
  const [motivoEstado, setMotivoEstado] = useState(() => (
    nidoInicial ? (nidoInicial.motivo_estado || '') : ''
  ))
  const [metodoUbicacion, setMetodoUbicacion] = useState(() => (
    nidoInicial ? (nidoInicial.metodo_ubicacion || 'manual_mapa') : 'manual_mapa'
  ))
  const [codigoEnGrupo, setCodigoEnGrupo] = useState(() => {
    if (esEdicion) return nidoInicial ? (nidoInicial.codigo_en_grupo || '') : ''
    return codigoSugerido
  })
  const [posicionEnGrupo, setPosicionEnGrupo] = useState(() => (
    esEdicion && nidoInicial ? (nidoInicial.posicion_en_grupo || '') : ''
  ))
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if ((esEdicion || !grupo) && ubicacionTemporal) {
      setLatitud(String(ubicacionTemporal.lat))
      setLongitud(String(ubicacionTemporal.lng))
    }
  }, [ubicacionTemporal, grupo, esEdicion])

  // ENVÍA EL NIDO AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)

    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setError('Latitud y longitud deben ser numéricas.'); return }
    if (!fechaDescubrimiento) { setError('La fecha de descubrimiento es obligatoria.'); return }

    // VALIDACIÓN DE FECHA DE DESCUBRIMIENTO EN EDICIÓN
    if (esEdicion && fechaMaximaDescubrimiento && fechaDescubrimiento) {
      if (fechaDescubrimiento > fechaMaximaDescubrimiento) {
        setError(`La fecha de descubrimiento no puede ser posterior al ${formatoFecha(fechaMaximaDescubrimiento)}, porque ya existe una observación o evento anterior.`)
        return
      }
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        // GUARDAR CAMBIOS
        const body = {
          nombre: nombre.trim(),
          latitud: parseFloat(lat.toFixed(6)),
          longitud: parseFloat(lng.toFixed(6)),
          fecha_descubrimiento: fechaDescubrimiento,
          descripcion: descripcion.trim(),
        }
        if (enGrupo) {
          body.codigo_en_grupo = codigoEnGrupo.trim()
          body.posicion_en_grupo = posicionEnGrupo.trim()
        }
        const actualizado = await updateNido(nidoInicial.id, body)
        if (onGuardar) onGuardar(actualizado)
      } else {
        const body = {
          nombre: nombre.trim(),
          latitud: parseFloat(lat.toFixed(6)),
          longitud: parseFloat(lng.toFixed(6)),
          estado,
          metodo_ubicacion: metodoUbicacion,
          fecha_descubrimiento: fechaDescubrimiento,
        }
        if (descripcion.trim()) body.descripcion = descripcion.trim()
        if (fechaEstado) body.fecha_estado = fechaEstado
        if (motivoEstado.trim()) body.motivo_estado = motivoEstado.trim()
        if (grupo) {
          body.grupo_nido = grupo.id
          if (codigoEnGrupo.trim()) body.codigo_en_grupo = codigoEnGrupo.trim()
          if (posicionEnGrupo.trim()) body.posicion_en_grupo = posicionEnGrupo.trim()
        }

        const nuevo = await createNido(body)
        onCrear(nuevo)
      }
    } catch (err) {
      setError(formatearError(err) || (esEdicion ? 'Error al guardar los cambios.' : 'Error al crear el nido.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`panel-overlay ${ocultoMovil ? 'panel-overlay--oculto-movil' : seleccionandoUbicacion ? 'panel-overlay--transparente' : ''}`} onClick={seleccionandoUbicacion ? undefined : onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">
            {esEdicion ? 'Editar nido' : grupo ? 'Nuevo nido en grupo' : 'Nuevo nido'}
          </h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            {!esEdicion && grupo && (
              <div className="form-campo">
                <label>Grupo</label>
                <div className="form-texto-fijo">{grupo.nombre}</div>
              </div>
            )}

            <div className="form-campo">
              <label>Nombre *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="form-fila">
              <div className="form-campo form-campo--mitad">
                <label>Latitud *</label>
                <input type="text" value={latitud} onChange={(e) => setLatitud(e.target.value)} placeholder="42.506300" />
              </div>
              <div className="form-campo form-campo--mitad">
                <label>Longitud *</label>
                <input type="text" value={longitud} onChange={(e) => setLongitud(e.target.value)} placeholder="1.521800" />
              </div>
            </div>

            {(!grupo || esEdicion) && (
              <>
                <button
                  type="button"
                  className="form-boton-mapa"
                  onClick={seleccionandoUbicacion ? onCancelarSeleccion : onIniciarSeleccion}
                >
                  {seleccionandoUbicacion ? 'Cancelar selección' : 'Elegir ubicación en el mapa'}
                </button>

                {seleccionandoUbicacion && (
                  <p className="form-aviso-mapa">Haz clic en el mapa para seleccionar la ubicación del nido</p>
                )}
              </>
            )}

            {enGrupo && (
              <div className="form-fila">
                <div className="form-campo form-campo--mitad">
                  <label>Código en grupo</label>
                  <input type="text" value={codigoEnGrupo} onChange={(e) => setCodigoEnGrupo(e.target.value)} placeholder="Ej: 4" />
                </div>
                <div className="form-campo form-campo--mitad">
                  <label>Posición física en el grupo</label>
                  <input
                    type="text"
                    value={posicionEnGrupo}
                    onChange={(e) => setPosicionEnGrupo(e.target.value)}
                    placeholder="Ej. arriba derecha, centro, parte baja..."
                  />
                </div>
              </div>
            )}

            <div className="form-campo">
              <label>Descripción</label>
              <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            {esEdicion ? (
              <div className="form-campo">
                <label>Fecha descubrimiento *</label>
                <input type="date" value={fechaDescubrimiento} onChange={(e) => setFechaDescubrimiento(e.target.value)} />
              </div>
            ) : (
              <>
                <div className="form-fila">
                  <div className="form-campo form-campo--mitad">
                    <label>Fecha descubrimiento *</label>
                    <input type="date" value={fechaDescubrimiento} onChange={(e) => setFechaDescubrimiento(e.target.value)} />
                  </div>
                  <div className="form-campo form-campo--mitad">
                    <label>Estado *</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>{ESTADO_TEXTO[e]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-fila">
                  <div className="form-campo form-campo--mitad">
                    <label>Fecha estado</label>
                    <input type="date" value={fechaEstado} onChange={(e) => setFechaEstado(e.target.value)} />
                  </div>
                  <div className="form-campo form-campo--mitad">
                    <label>Método ubicación</label>
                    <select value={metodoUbicacion} onChange={(e) => setMetodoUbicacion(e.target.value)}>
                      {METODOS_UBICACION.map((m) => (
                        <option key={m} value={m}>{METODO_TEXTO[m]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-campo">
                  <label>Motivo estado</label>
                  <textarea rows={2} value={motivoEstado} onChange={(e) => setMotivoEstado(e.target.value)} />
                </div>
              </>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar nido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
