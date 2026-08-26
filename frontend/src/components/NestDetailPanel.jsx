import { useState, useEffect, useMemo } from 'react'
import { getNidoDetalle, updateNido, deleteNido } from '../api/nidos'
import { getObservaciones, deleteObservacion } from '../api/observaciones'
import { getEventos, deleteEvento } from '../api/eventos'
import { getImagenes, marcarImagenPrincipal, deleteImagen } from '../api/imagenes'
import { formatoFecha, textoEstado, colorEstado } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import NestObservationsHistory from './NestObservationsHistory'
import NestEventsHistory from './NestEventsHistory'
import NestImagesGallery from './NestImagesGallery'
import NestObservationForm from './NestObservationForm'
import NestEventForm from './NestEventForm'
import NestImageUploadForm from './NestImageUploadForm'
import ObservationDetailModal from './ObservationDetailModal'
import EventDetailModal from './EventDetailModal'

const METODO_UBICACION_TEXTO = {
  manual_mapa: 'Mapa',
  gps_movil: 'GPS móvil',
  importado: 'Importado',
}

function PanelCargando() {
  return (
    <div className="panel-estado">
      <p>Cargando ficha del nido...</p>
    </div>
  )
}

function PanelError({ mensaje }) {
  return (
    <div className="panel-estado panel-estado--error">
      <p>{mensaje}</p>
    </div>
  )
}

// SECCIÓN CON TÍTULO EN LA FICHA
function Seccion({ titulo, children }) {
  return (
    <div className="panel-seccion">
      <h4 className="panel-seccion-titulo">{titulo}</h4>
      {children}
    </div>
  )
}

export default function NestDetailPanel({ nidoId, onCerrar, onRecargar, onEditar }) {
  const { usuario } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [observaciones, setObservaciones] = useState([])
  const [eventos, setEventos] = useState([])
  const [imagenes, setImagenes] = useState([])
  const [mostrandoFormObs, setMostrandoFormObs] = useState(false)
  const [mostrandoFormEvento, setMostrandoFormEvento] = useState(false)
  const [mostrandoFormImg, setMostrandoFormImg] = useState(false)
  const [obsDetalle, setObsDetalle] = useState(null)
  const [evtDetalle, setEvtDetalle] = useState(null)
  const [obsEditando, setObsEditando] = useState(null)
  const [evtEditando, setEvtEditando] = useState(null)
  const [errorEliminarNido, setErrorEliminarNido] = useState(null)

  const puedeCrear = usuario && (usuario.rol === 'admin' || usuario.rol === 'bander')
  const puedeEliminar = usuario && usuario.rol === 'admin'
  const puedeEliminarNido = puedeEliminar && detalle && (detalle.estado === 'destruido' || detalle.estado === 'retirado')

  // FECHA MÁS ANTIGUA ENTRE OBSERVACIONES Y EVENTOS DEL NIDO
  const fechaMaximaDescubrimiento = useMemo(() => {
    const fechas = []
    for (const o of observaciones) {
      if (o.fecha_observacion) fechas.push(String(o.fecha_observacion).split('T')[0])
    }
    for (const ev of eventos) {
      if (ev.fecha_evento) fechas.push(String(ev.fecha_evento).split('T')[0])
    }
    if (fechas.length === 0) return null
    fechas.sort()
    return fechas[0]
  }, [observaciones, eventos])

  // CARGA DETALLE, OBSERVACIONES, EVENTOS E IMÁGENES DEL NIDO
  const cargarDatos = () => {
    if (!nidoId) return

    let cancelado = false
    setCargando(true)
    setError(null)

    Promise.all([
      getNidoDetalle(nidoId),
      getObservaciones(),
      getEventos(),
      getImagenes(),
    ])
      .then(([det, obs, evts, imgs]) => {
        if (cancelado) return
        setDetalle(det)
        setObservaciones(
          obs.filter((o) => String(o.nido) === String(nidoId))
        )
        setEventos(
          evts.filter((e) => String(e.nido) === String(nidoId))
        )
        setImagenes(
          imgs.filter((i) => String(i.nido) === String(nidoId))
        )
        setCargando(false)
      })
      .catch(() => {
        if (cancelado) return
        setError('No se ha podido cargar la ficha del nido.')
        setCargando(false)
      })

    return () => { cancelado = true }
  }

  useEffect(() => {
    const cancel = cargarDatos()
    return cancel
  }, [nidoId])

  const handleCrearObservacion = () => {
    setMostrandoFormObs(false)
    cargarDatos()
    if (onRecargar) onRecargar()
  }

  // EDITAR OBSERVACIÓN DESDE FICHA O DETALLE
  const handleEditarObs = (obs) => {
    setObsDetalle(null)
    setObsEditando(obs)
  }

  const handleGuardarObservacion = () => {
    setObsEditando(null)
    cargarDatos()
    if (onRecargar) onRecargar()
  }

  // EDITAR EVENTO DESDE FICHA O DETALLE
  const handleEditarEvt = (ev) => {
    setEvtDetalle(null)
    setEvtEditando(ev)
  }

  const handleGuardarEvento = async (eventoActualizado) => {
    setEvtEditando(null)

    // SI ES CAMBIO DE ESTADO, COMPROBAR SI ES EL ÚLTIMO
    if (eventoActualizado.tipo_evento === 'cambio_estado' && eventoActualizado.estado_nuevo) {
      const eventosActualizados = eventos.map((e) =>
        e.id === eventoActualizado.id ? eventoActualizado : e
      )
      const ultimoCambio = eventosActualizados
        .filter((e) => e.tipo_evento === 'cambio_estado')
        .sort((a, b) => {
          if (a.fecha_evento !== b.fecha_evento) return a.fecha_evento > b.fecha_evento ? -1 : 1
          return a.id > b.id ? -1 : 1
        })[0]

      if (ultimoCambio && ultimoCambio.id === eventoActualizado.id) {
        const fechaEstado = String(eventoActualizado.fecha_evento).split('T')[0]
        const patchNido = {
          estado: eventoActualizado.estado_nuevo,
          fecha_estado: fechaEstado,
        }
        if (eventoActualizado.descripcion) patchNido.motivo_estado = eventoActualizado.descripcion
        try { await updateNido(nidoId, patchNido) } catch { /* SILENCIOSO */ }
      }
    }

    cargarDatos()
    if (onRecargar) onRecargar()
  }

  const handleCrearEvento = () => {
    setMostrandoFormEvento(false)
    cargarDatos()
    if (onRecargar) onRecargar()
  }

  // ELIMINAR OBSERVACIÓN
  const handleEliminarObs = (obs) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta observación? Si tiene imágenes asociadas, también se eliminarán.')) return
    deleteObservacion(obs.id)
      .then(() => {
        setObsDetalle(null)
        cargarDatos()
        if (onRecargar) onRecargar()
      })
      .catch(() => {})
  }

  // ELIMINAR EVENTO
  const handleEliminarEvt = async (ev) => {
    if (!window.confirm('¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.')) return
    try {
      await deleteEvento(ev.id)

      // RECALCULAR ESTADO SI ES CAMBIO DE ESTADO
      if (ev.tipo_evento === 'cambio_estado') {
        // RESTO DE CAMBIOS DE ESTADO EXCLUYENDO EL ELIMINADO
        const resto = eventos
          .filter((e) => e.tipo_evento === 'cambio_estado' && e.id !== ev.id)
          .sort((a, b) => {
            if (a.fecha_evento !== b.fecha_evento) return a.fecha_evento > b.fecha_evento ? -1 : 1
            return a.id > b.id ? -1 : 1
          })

        // SI ERA EL ÚLTIMO → RECALCULAR
        const eraElUltimo = resto.length === 0 ||
          resto.every((e) =>
            e.fecha_evento < ev.fecha_evento ||
            (e.fecha_evento === ev.fecha_evento && e.id < ev.id)
          )

        if (eraElUltimo) {
          if (resto.length > 0) {
            const fechaEstado = String(resto[0].fecha_evento).split('T')[0]
            const patchNido = { estado: resto[0].estado_nuevo, fecha_estado: fechaEstado }
            if (resto[0].descripcion) patchNido.motivo_estado = resto[0].descripcion
            try { await updateNido(nidoId, patchNido) } catch { /* SILENCIOSO */ }
          } else {
            try { await updateNido(nidoId, { estado: 'activo', fecha_estado: null, motivo_estado: 'Sin eventos de cambio de estado registrados' }) } catch { /* SILENCIOSO */ }
          }
        }
      }

      setEvtDetalle(null)
      cargarDatos()
      if (onRecargar) onRecargar()
    } catch { /* SILENCIOSO */ }
  }

  // RECARGA TRAS SUBIDA O MARCAR PRINCIPAL
  const handleCrearImagen = () => {
    setMostrandoFormImg(false)
    cargarDatos()
    if (onRecargar) onRecargar()
  }

  const handleMarcarPrincipal = async (imagenId) => {
    try {
      await marcarImagenPrincipal(imagenId)
      cargarDatos()
      if (onRecargar) onRecargar()
    } catch {
      // ERROR SILENCIOSO, RECARGA DE TODOS MODOS
      cargarDatos()
    }
  }

  // ELIMINAR IMAGEN
  const handleEliminarImagen = (img) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta imagen? Se borrará también el archivo asociado.')) return
    deleteImagen(img.id)
      .then(() => {
        cargarDatos()
        if (onRecargar) onRecargar()
      })
      .catch(() => {})
  }

  // ELIMINAR NIDO
  const handleEliminarNido = () => {
    if (!window.confirm('¿Seguro que quieres eliminar este nido? Solo se puede eliminar si no tiene observaciones ni imágenes asociadas. Si es el último nido de su grupo, también se eliminará el grupo. Esta acción no se puede deshacer.')) return
    setErrorEliminarNido(null)
    deleteNido(nidoId)
      .then(() => {
        if (onCerrar) onCerrar()
        if (onRecargar) onRecargar()
      })
      .catch((err) => {
        const msg = err?.data?.detail || 'No se ha podido eliminar el nido.'
        setErrorEliminarNido(msg)
      })
  }

  if (mostrandoFormObs) {
    return (
      <NestObservationForm
        nidoId={nidoId}
        onCrear={handleCrearObservacion}
        onCerrar={() => setMostrandoFormObs(false)}
      />
    )
  }

  // MODO EDICIÓN DE OBSERVACIÓN
  if (obsEditando) {
    return (
      <NestObservationForm
        nidoId={nidoId}
        modo="editar"
        observacionInicial={obsEditando}
        fechaDescubrimiento={detalle ? detalle.fecha_descubrimiento : null}
        onGuardar={handleGuardarObservacion}
        onCerrar={() => setObsEditando(null)}
      />
    )
  }

  // MODO EDICIÓN DE EVENTO
  if (evtEditando) {
    return (
      <NestEventForm
        nidoId={nidoId}
        estadoActual={detalle ? detalle.estado : ''}
        modo="editar"
        eventoInicial={evtEditando}
        fechaDescubrimiento={detalle ? detalle.fecha_descubrimiento : null}
        onGuardar={handleGuardarEvento}
        onCerrar={() => setEvtEditando(null)}
      />
    )
  }

  if (mostrandoFormEvento) {
    return (
      <NestEventForm
        nidoId={nidoId}
        estadoActual={detalle ? detalle.estado : ''}
        onCrear={handleCrearEvento}
        onCerrar={() => setMostrandoFormEvento(false)}
      />
    )
  }

  return (
    <>
      <div className="panel-overlay" onClick={onCerrar}>
        <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
          <div className="panel-cabecera">
            <h3 className="panel-titulo">Ficha del nido</h3>
            <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
          </div>

          <div className="panel-cuerpo">
            {cargando && <PanelCargando />}
            {error && <PanelError mensaje={error} />}

            {!cargando && !error && detalle && (
              <>
                {(() => {
                  const imgPrincipal = imagenes.find((i) => i.es_principal)
                  const fotoUrl = detalle.foto_principal
                    || (imgPrincipal && imgPrincipal.archivo_url)
                    || (imagenes.length > 0 && imagenes[0].archivo_url)
                  return fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={detalle.nombre}
                      className="panel-foto"
                    />
                  ) : (
                    <div className="panel-sin-foto">Sin foto principal</div>
                  )
                })()}

                <div className="panel-cabecera-nido">
                  <h3 className="panel-nombre">{detalle.nombre}</h3>
                  <span
                    className="panel-estado-badge"
                    style={{ backgroundColor: colorEstado(detalle.estado) }}
                  >
                    {textoEstado(detalle.estado)}
                  </span>
                </div>

                {puedeCrear && onEditar && (
                  <button
                    className="panel-boton-editar"
                    onClick={() => onEditar(detalle, fechaMaximaDescubrimiento)}
                  >
                    Editar nido
                  </button>
                )}

                {puedeEliminarNido && (
                  <button
                    className="panel-detalle-boton-eliminar"
                    onClick={handleEliminarNido}
                  >
                    Eliminar nido
                  </button>
                )}

                {errorEliminarNido && (
                  <p className="panel-error-eliminar">{errorEliminarNido}</p>
                )}

                {detalle.grupo_nombre && (
                  <p className="panel-grupo">
                    Grupo: {detalle.grupo_nombre}
                    {detalle.codigo_en_grupo ? ` (${detalle.codigo_en_grupo})` : ''}
                  </p>
                )}

                {detalle.posicion_en_grupo && (
                  <p className="panel-info-linea">Posición: {detalle.posicion_en_grupo}</p>
                )}

                <Seccion titulo="Datos generales">
                  <table className="panel-tabla">
                    <tbody>
                      <tr>
                        <td className="panel-tabla-label">ID</td>
                        <td>{detalle.id}</td>
                      </tr>
                      <tr>
                        <td className="panel-tabla-label">Latitud</td>
                        <td>{detalle.latitud}</td>
                      </tr>
                      <tr>
                        <td className="panel-tabla-label">Longitud</td>
                        <td>{detalle.longitud}</td>
                      </tr>
                      <tr>
                        <td className="panel-tabla-label">Estado</td>
                        <td style={{ color: colorEstado(detalle.estado), fontWeight: 600 }}>
                          {textoEstado(detalle.estado)}
                        </td>
                      </tr>
                      {detalle.fecha_descubrimiento && (
                        <tr>
                          <td className="panel-tabla-label">Descubrimiento</td>
                          <td>{formatoFecha(detalle.fecha_descubrimiento)}</td>
                        </tr>
                      )}
                      {detalle.fecha_estado && (
                        <tr>
                          <td className="panel-tabla-label">Fecha estado</td>
                          <td>{formatoFecha(detalle.fecha_estado)}</td>
                        </tr>
                      )}
                      {detalle.motivo_estado && (
                        <tr>
                          <td className="panel-tabla-label">Motivo estado</td>
                          <td>{detalle.motivo_estado}</td>
                        </tr>
                      )}
                      {detalle.metodo_ubicacion && (
                        <tr>
                          <td className="panel-tabla-label">Método ubicación</td>
                          <td>{METODO_UBICACION_TEXTO[detalle.metodo_ubicacion] || detalle.metodo_ubicacion}</td>
                        </tr>
                      )}
                      {detalle.descripcion && (
                        <tr>
                          <td className="panel-tabla-label">Descripción</td>
                          <td>{detalle.descripcion}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Seccion>

                {observaciones.length > 0 && (
                  <Seccion titulo="Última observación">
                    <table className="panel-tabla">
                      <tbody>
                        <tr>
                          <td className="panel-tabla-label">Fecha</td>
                          <td>{observaciones[0].fecha_observacion}</td>
                        </tr>
                        {observaciones[0].especie_nombre && (
                          <tr>
                            <td className="panel-tabla-label">Especie</td>
                            <td>{observaciones[0].especie_nombre}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="panel-tabla-label">Ocupado</td>
                          <td>{observaciones[0].ocupado ? 'Sí' : 'No'}</td>
                        </tr>
                        <tr>
                          <td className="panel-tabla-label">Huevos</td>
                          <td>{observaciones[0].hay_huevos ? observaciones[0].cantidad_huevos : 'No'}</td>
                        </tr>
                        <tr>
                          <td className="panel-tabla-label">Polluelos</td>
                          <td>{observaciones[0].hay_polluelos ? observaciones[0].cantidad_polluelos : 'No'}</td>
                        </tr>
                        {observaciones[0].notas && (
                          <tr>
                            <td className="panel-tabla-label">Notas</td>
                            <td>{observaciones[0].notas}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Seccion>
                )}

                <Seccion titulo="Histórico de observaciones">
                  {puedeCrear && (
                    <button
                      className="panel-boton-nuevo"
                      onClick={() => setMostrandoFormObs(true)}
                    >
                      + Nueva observación
                    </button>
                  )}
                  <NestObservationsHistory observaciones={observaciones} onVerDetalle={setObsDetalle} onEditar={puedeCrear ? handleEditarObs : null} onEliminar={puedeEliminar ? handleEliminarObs : null} />
                </Seccion>

                <Seccion titulo="Histórico de eventos">
                  {puedeCrear && (
                    <button
                      className="panel-boton-nuevo"
                      onClick={() => setMostrandoFormEvento(true)}
                    >
                      + Nuevo evento
                    </button>
                  )}
                  <NestEventsHistory eventos={eventos} onVerDetalle={setEvtDetalle} onEditar={puedeCrear ? handleEditarEvt : null} onEliminar={puedeEliminar ? handleEliminarEvt : null} />
                </Seccion>

                <Seccion titulo="Imágenes">
                  {puedeCrear && (
                    <button
                      className="panel-boton-nuevo"
                      onClick={() => setMostrandoFormImg(true)}
                    >
                      + Añadir imagen
                    </button>
                  )}
                  {mostrandoFormImg && (
                    <NestImageUploadForm
                      nidoId={nidoId}
                      onCrear={handleCrearImagen}
                      onCerrar={() => setMostrandoFormImg(false)}
                    />
                  )}
                  <NestImagesGallery
                    imagenes={imagenes}
                    puedeEditar={puedeCrear}
                    puedeEliminar={puedeEliminar}
                    onMarcarPrincipal={handleMarcarPrincipal}
                    onEliminar={handleEliminarImagen}
                  />
                </Seccion>
              </>
            )}
          </div>
        </div>
      </div>

      {obsDetalle && (
        <ObservationDetailModal
          observacion={obsDetalle}
          imagenes={imagenes}
          onCerrar={() => setObsDetalle(null)}
          onEditar={puedeCrear ? handleEditarObs : null}
          onEliminar={puedeEliminar ? handleEliminarObs : null}
        />
      )}
      {evtDetalle && (
        <EventDetailModal
          evento={evtDetalle}
          onCerrar={() => setEvtDetalle(null)}
          onEditar={puedeCrear ? handleEditarEvt : null}
          onEliminar={puedeEliminar ? handleEliminarEvt : null}
        />
      )}
    </>
  )
}
