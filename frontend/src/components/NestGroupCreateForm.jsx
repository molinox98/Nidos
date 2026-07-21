import { useState, useEffect } from 'react'
import { createGrupoNido } from '../api/gruposNidos'
import { createNido } from '../api/nidos'

const TIPOS_UBICACION = ['roca', 'arbol', 'edificio', 'poste', 'acantilado', 'otro']
const TIPO_TEXTO = { roca: 'Roca', arbol: 'Árbol', edificio: 'Edificio', poste: 'Poste', acantilado: 'Acantilado', otro: 'Otro' }
const ESTADOS = ['activo', 'inactivo', 'destruido', 'retirado']
const ESTADO_TEXTO = { activo: 'Activo', inactivo: 'Inactivo', destruido: 'Destruido', retirado: 'Retirado' }
const METODOS_UBICACION = ['manual_mapa', 'gps_movil', 'importado']
const METODO_TEXTO = { manual_mapa: 'Manual (mapa)', gps_movil: 'GPS móvil', importado: 'Importado' }
const MAX_NIDOS = 20

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

function crearNidosArray(nombreGrupo, cantidad) {
  const hoy = hoyISO()
  return Array.from({ length: cantidad }, (_, i) => ({
    nombre: `${nombreGrupo} - Nido ${i + 1}`,
    codigo_en_grupo: String(i + 1),
    posicion_en_grupo: String(i + 1),
    descripcion: '',
    estado: 'activo',
    fecha_descubrimiento: hoy,
    fecha_estado: hoy,
    motivo_estado: '',
    metodo_ubicacion: 'manual_mapa',
  }))
}

export default function NestGroupCreateForm({
  onCrear, onCerrar,
  onIniciarSeleccionGrupo, onCancelarSeleccionGrupo,
  seleccionandoUbicacionGrupo, ubicacionTemporalGrupo,
}) {
  const [grupoNombre, setGrupoNombre] = useState('')
  const [tipoUbicacion, setTipoUbicacion] = useState('otro')
  const [descripcion, setDescripcion] = useState('')
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [cantidadNidos, setCantidadNidos] = useState('')
  const [nidos, setNidos] = useState([])
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (ubicacionTemporalGrupo) {
      setLatitud(String(ubicacionTemporalGrupo.lat))
      setLongitud(String(ubicacionTemporalGrupo.lng))
    }
  }, [ubicacionTemporalGrupo])

  const handleCantidadChange = (e) => {
    const val = e.target.value
    setCantidadNidos(val)
    const num = parseInt(val, 10)
    if (Number.isFinite(num) && num >= 1 && num <= MAX_NIDOS) {
      setNidos(crearNidosArray(grupoNombre, num))
    } else {
      setNidos([])
    }
  }

  const handleNombreGrupoChange = (e) => {
    const nuevo = e.target.value
    setGrupoNombre(nuevo)
    if (nidos.length > 0) {
      setNidos(prev => prev.map((n, i) => ({
        ...n,
        nombre: `${nuevo} - Nido ${i + 1}`,
      })))
    }
  }

  const handleNidoChange = (index, field, value) => {
    setNidos(prev => prev.map((n, i) => (i === index ? { ...n, [field]: value } : n)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!grupoNombre.trim()) { setError('El nombre del grupo es obligatorio.'); return }
    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setError('Selecciona una ubicación para el grupo.'); return }
    const num = parseInt(cantidadNidos, 10)
    if (!Number.isFinite(num) || num < 1) { setError('Indica cuántos nidos tiene el grupo.'); return }

    setGuardando(true)
    try {
      const grupoPayload = {
        nombre: grupoNombre.trim(),
        latitud: parseFloat(lat.toFixed(6)),
        longitud: parseFloat(lng.toFixed(6)),
        tipo_ubicacion: tipoUbicacion,
      }
      if (descripcion.trim()) grupoPayload.descripcion = descripcion.trim()

      const grupo = await createGrupoNido(grupoPayload)
      const grupoId = grupo.id

      const erroresNidos = []
      for (let i = 0; i < nidos.length; i++) {
        try {
          const n = nidos[i]
          const nidoPayload = {
            grupo_nido: grupoId,
            nombre: n.nombre.trim(),
            codigo_en_grupo: n.codigo_en_grupo,
            posicion_en_grupo: n.posicion_en_grupo,
            latitud: parseFloat(lat.toFixed(6)),
            longitud: parseFloat(lng.toFixed(6)),
            estado: n.estado,
            fecha_descubrimiento: n.fecha_descubrimiento,
            fecha_estado: n.fecha_estado,
            metodo_ubicacion: n.metodo_ubicacion,
          }
          if (n.descripcion.trim()) nidoPayload.descripcion = n.descripcion.trim()
          if (n.motivo_estado.trim()) nidoPayload.motivo_estado = n.motivo_estado.trim()
          await createNido(nidoPayload)
        } catch (errNido) {
          const detalle = errNido.data
            ? Object.values(errNido.data).flat().join(', ')
            : 'Error desconocido'
          erroresNidos.push(`Nido ${nidos[i].codigo_en_grupo}: ${detalle}`)
        }
      }

      if (erroresNidos.length > 0) {
        setError(`Grupo creado, pero algunos nidos fallaron:\n${erroresNidos.join('\n')}`)
        setGuardando(false)
        return
      }

      onCrear(grupo)
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al crear el grupo.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className={`panel-overlay ${seleccionandoUbicacionGrupo ? 'panel-overlay--transparente' : ''}`}
      onClick={seleccionandoUbicacionGrupo ? undefined : onCerrar}
    >
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">Nuevo grupo de nidos</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-grupo" onSubmit={handleSubmit}>

            <div className="form-grupo-seccion">
              <h4 className="form-grupo-seccion-titulo">Datos del grupo</h4>

              <div className="form-campo">
                <label>Nombre *</label>
                <input type="text" value={grupoNombre} onChange={handleNombreGrupoChange} />
              </div>

              <div className="form-campo">
                <label>Tipo de ubicación *</label>
                <select value={tipoUbicacion} onChange={(e) => setTipoUbicacion(e.target.value)}>
                  {TIPOS_UBICACION.map((t) => (
                    <option key={t} value={t}>{TIPO_TEXTO[t]}</option>
                  ))}
                </select>
              </div>

              <div className="form-campo">
                <label>Descripción</label>
                <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
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

              <button
                type="button"
                className="form-boton-mapa"
                onClick={seleccionandoUbicacionGrupo ? onCancelarSeleccionGrupo : onIniciarSeleccionGrupo}
              >
                {seleccionandoUbicacionGrupo ? 'Cancelar selección' : 'Elegir ubicación en el mapa'}
              </button>

              {seleccionandoUbicacionGrupo && (
                <p className="form-aviso-mapa">Haz clic en el mapa para seleccionar la ubicación del grupo</p>
              )}
            </div>

            <div className="form-grupo-seccion">
              <h4 className="form-grupo-seccion-titulo">Nidos del grupo</h4>
              <div className="form-campo">
                <label>Cantidad de nidos *</label>
                <input
                  type="number"
                  min="1"
                  max={MAX_NIDOS}
                  value={cantidadNidos}
                  onChange={handleCantidadChange}
                  placeholder="Ej: 3"
                />
                {cantidadNidos && parseInt(cantidadNidos) > 0 && (
                  <p className="form-grupo-ayuda">{nidos.length} nido{nidos.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            {nidos.length > 0 && (
              <div className="form-grupo-seccion">
                <h4 className="form-grupo-seccion-titulo">
                  {nidos.length} nido{nidos.length !== 1 ? 's' : ''}
                </h4>
                {nidos.map((nido, idx) => (
                  <div key={idx} className="form-grupo-nido-card">
                    <h5 className="form-grupo-nido-card-titulo">Nido {idx + 1}</h5>

                    <div className="form-fila">
                      <div className="form-campo form-campo--mitad">
                        <label>Código en grupo</label>
                        <div className="form-texto-fijo">{nido.codigo_en_grupo}</div>
                      </div>
                      <div className="form-campo form-campo--mitad">
                        <label>Posición en grupo</label>
                        <div className="form-texto-fijo">{nido.posicion_en_grupo}</div>
                      </div>
                    </div>

                    <div className="form-campo">
                      <label>Nombre</label>
                      <input type="text" value={nido.nombre} onChange={(e) => handleNidoChange(idx, 'nombre', e.target.value)} />
                    </div>

                    <div className="form-campo">
                      <label>Descripción</label>
                      <textarea rows={1} value={nido.descripcion} onChange={(e) => handleNidoChange(idx, 'descripcion', e.target.value)} />
                    </div>

                    <div className="form-fila">
                      <div className="form-campo form-campo--mitad">
                        <label>Estado *</label>
                        <select value={nido.estado} onChange={(e) => handleNidoChange(idx, 'estado', e.target.value)}>
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>{ESTADO_TEXTO[e]}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-campo form-campo--mitad">
                        <label>Método ubicación</label>
                        <select value={nido.metodo_ubicacion} onChange={(e) => handleNidoChange(idx, 'metodo_ubicacion', e.target.value)}>
                          {METODOS_UBICACION.map((m) => (
                            <option key={m} value={m}>{METODO_TEXTO[m]}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-fila">
                      <div className="form-campo form-campo--mitad">
                        <label>Fecha descubrimiento</label>
                        <input type="date" value={nido.fecha_descubrimiento} onChange={(e) => handleNidoChange(idx, 'fecha_descubrimiento', e.target.value)} />
                      </div>
                      <div className="form-campo form-campo--mitad">
                        <label>Fecha estado</label>
                        <input type="date" value={nido.fecha_estado} onChange={(e) => handleNidoChange(idx, 'fecha_estado', e.target.value)} />
                      </div>
                    </div>

                    <div className="form-campo">
                      <label>Motivo estado</label>
                      <textarea rows={1} value={nido.motivo_estado} onChange={(e) => handleNidoChange(idx, 'motivo_estado', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar grupo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
