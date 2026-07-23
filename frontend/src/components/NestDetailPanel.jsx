import { useState, useEffect } from 'react'
import { getNidoDetalle } from '../api/nidos'
import { getObservaciones } from '../api/observaciones'
import { getEventos } from '../api/eventos'
import { getImagenes, marcarImagenPrincipal } from '../api/imagenes'
import { formatoFecha, textoEstado, colorEstado } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import NestObservationsHistory from './NestObservationsHistory'
import NestEventsHistory from './NestEventsHistory'
import NestImagesGallery from './NestImagesGallery'
import NestObservationForm from './NestObservationForm'
import NestEventForm from './NestEventForm'
import NestImageUploadForm from './NestImageUploadForm'

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

// SECCIÓN COLAPSABLE CON TÍTULO EN LA FICHA
function Seccion({ titulo, children }) {
  return (
    <div className="panel-seccion">
      <h4 className="panel-seccion-titulo">{titulo}</h4>
      {children}
    </div>
  )
}

export default function NestDetailPanel({ nidoId, onCerrar, onRecargar }) {
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

  const puedeCrear = usuario && (usuario.rol === 'admin' || usuario.rol === 'bander')

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

  const handleCrearEvento = () => {
    setMostrandoFormEvento(false)
    cargarDatos()
    if (onRecargar) onRecargar()
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

  if (mostrandoFormObs) {
    return (
      <NestObservationForm
        nidoId={nidoId}
        onCrear={handleCrearObservacion}
        onCerrar={() => setMostrandoFormObs(false)}
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
                <NestObservationsHistory observaciones={observaciones} />
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
                <NestEventsHistory eventos={eventos} />
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
                  onMarcarPrincipal={handleMarcarPrincipal}
                />
              </Seccion>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
