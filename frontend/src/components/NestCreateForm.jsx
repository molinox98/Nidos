import { useState, useEffect } from 'react'
import { createNido } from '../api/nidos'

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

export default function NestCreateForm({ grupo, onCrear, onCerrar, onIniciarSeleccion, onCancelarSeleccion, seleccionandoUbicacion, ubicacionTemporal, ocultoMovil }) {
  // CÓDIGO Y NOMBRE SUGERIDOS PARA NUEVO NIDO EN GRUPO
  const codigoSugerido = grupo ? siguienteCodigoGrupo(grupo.nidos) : ''

  const [nombre, setNombre] = useState(() => (codigoSugerido ? `${grupo.nombre} - Nido ${codigoSugerido}` : ''))
  const [latitud, setLatitud] = useState(() => (grupo ? String(grupo.lat) : ''))
  const [longitud, setLongitud] = useState(() => (grupo ? String(grupo.lng) : ''))
  const [descripcion, setDescripcion] = useState('')
  const [fechaDescubrimiento, setFechaDescubrimiento] = useState(hoyISO())
  const [estado, setEstado] = useState('activo')
  const [fechaEstado, setFechaEstado] = useState(hoyISO())
  const [motivoEstado, setMotivoEstado] = useState('')
  const [metodoUbicacion, setMetodoUbicacion] = useState('manual_mapa')
  const [codigoEnGrupo, setCodigoEnGrupo] = useState(() => codigoSugerido)
  const [posicionEnGrupo, setPosicionEnGrupo] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!grupo && ubicacionTemporal) {
      setLatitud(String(ubicacionTemporal.lat))
      setLongitud(String(ubicacionTemporal.lng))
    }
  }, [ubicacionTemporal, grupo])

  // ENVÍA EL NIDO AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)

    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setError('Latitud y longitud deben ser numéricas.'); return }
    if (!fechaDescubrimiento) { setError('La fecha de descubrimiento es obligatoria.'); return }

    setGuardando(true)
    try {
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
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al crear el nido.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`panel-overlay ${ocultoMovil ? 'panel-overlay--oculto-movil' : seleccionandoUbicacion ? 'panel-overlay--transparente' : ''}`} onClick={seleccionandoUbicacion ? undefined : onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">{grupo ? 'Nuevo nido en grupo' : 'Nuevo nido'}</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            {grupo && (
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

            {!grupo && (
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

            {grupo && (
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

            {error && <p className="form-error">{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar nido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
