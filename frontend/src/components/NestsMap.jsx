import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNidosMapa } from '../api/nidos'
import { formatoFecha, textoEstado, colorEstado } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import NestDetailPanel from './NestDetailPanel'
import NestCreateForm from './NestCreateForm'
import NestGroupCreateForm from './NestGroupCreateForm'

// CENTRO Y LÍMITES DEL MAPA DE ANDORRA
const CENTRO_ANDORRA = [42.5063, 1.5218]
const ANDORRA_BOUNDS = L.latLngBounds([42.42, 1.40], [42.66, 1.79])
const MAP_MAX_BOUNDS = L.latLngBounds([42.25, 1.15], [42.80, 2.05])
const ANCHO_MOVIL = 768

// DETECCIÓN DE DISPOSITIVO MÓVIL
function esMovil() {
  return typeof window !== 'undefined' && window.innerWidth <= ANCHO_MOVIL
}

// AJUSTA LA VISTA INICIAL DEL MAPA A ANDORRA
function AjustarVista() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(ANDORRA_BOUNDS, { padding: [30, 30] })
  }, [map])
  return null
}

// TAMAÑO DEL MARCADOR SEGÚN EL NIVEL DE ZOOM
function tamañoMarcador(zoom) {
  return Math.max(10, Math.min(24, Math.round(34 - zoom * 1.3)))
}

// MARCADOR DE PUNTO PARA NIDO SUELTO
function crearIcono(color, size) {
  const half = Math.round(size / 2)
  return L.divIcon({
    className: 'nest-marker',
    html: `<div class="nest-marker-punto" style="background-color: ${color}; width: ${size}px; height: ${size}px;"></div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  })
}

const ICONO_UBICACION = L.divIcon({
  className: 'nest-marker',
  html: '<div class="ubicacion-temporal"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
})

const ORDEN_ESTADO = { destruido: 0, retirado: 1, inactivo: 2, activo: 3 }

// DEVUELVE EL PEOR ESTADO ENTRE VARIOS NIDOS
function peorEstado(nidos) {
  let peor = 'activo'
  for (const n of nidos) {
    const e = n.estado || 'activo'
    if (ORDEN_ESTADO[e] < ORDEN_ESTADO[peor]) peor = e
  }
  return peor
}

// AGRUPACIÓN DE NIDOS POR GRUPO PARA EL MAPA
function agruparNidos(nidos) {
  const grupos = {}
  const sueltos = []

  for (const n of nidos) {
    if (n.grupo_nido) {
      const key = n.grupo_nido
      if (!grupos[key]) {
        grupos[key] = {
          key: `grupo-${key}`,
          tipo: 'grupo',
          nombre: n.grupo_nombre,
          lat: parseFloat(n.latitud),
          lng: parseFloat(n.longitud),
          nidos: [],
        }
      }
      grupos[key].nidos.push(n)
    } else {
      sueltos.push({
        key: `solo-${n.id}`,
        tipo: 'solo',
        nombre: n.nombre,
        lat: parseFloat(n.latitud),
        lng: parseFloat(n.longitud),
        nidos: [n],
      })
    }
  }

  return [...Object.values(grupos), ...sueltos]
}

// MARCADOR CON NÚMERO DE NIDOS DEL GRUPO
function crearIconoGrupo(color, size, count) {
  const half = Math.round(size / 2)
  return L.divIcon({
    className: 'nest-marker',
    html: `<div class="nest-marker-grupo" style="background-color: ${color}; width: ${size}px; height: ${size}px; font-size: ${Math.max(10, Math.round(size * 0.55))}px;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  })
}

// POPUP CON NAVEGACIÓN ENTRE NIDOS DE UN GRUPO
function NestPopupContent({ elemento, onVerFicha }) {
  const [indice, setIndice] = useState(0)
  const nidos = elemento.nidos
  const current = nidos[indice]
  const foto = current.foto_principal

  const anterior = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIndice((indice - 1 + nidos.length) % nidos.length)
  }

  const siguiente = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIndice((indice + 1) % nidos.length)
  }

  return (
    <div className="nest-popup">
      {foto && (
        <img src={foto} alt={current.nombre} className="nest-popup-foto" />
      )}
      <h3 className="nest-popup-nombre">{current.nombre}</h3>

      {nidos.length > 1 && (
        <div className="nest-popup-navegacion">
          <button className="nest-popup-flecha" onClick={anterior}>←</button>
          <span className="nest-popup-posicion">Nido {indice + 1} de {nidos.length}</span>
          <button className="nest-popup-flecha" onClick={siguiente}>→</button>
        </div>
      )}

      <table className="nest-popup-tabla">
        <tbody>
          <tr>
            <td className="nest-popup-label">Estado</td>
            <td style={{ color: colorEstado(current.estado), fontWeight: 600 }}>
              {textoEstado(current.estado)}
            </td>
          </tr>
          {current.grupo_nombre && (
            <tr>
              <td className="nest-popup-label">Grupo</td>
              <td>{current.grupo_nombre}{current.codigo_en_grupo ? ` (${current.codigo_en_grupo})` : ''}</td>
            </tr>
          )}
          {current.posicion_en_grupo && (
            <tr>
              <td className="nest-popup-label">Posición</td>
              <td>{current.posicion_en_grupo}</td>
            </tr>
          )}
          {current.especie_ultima_observacion && (
            <tr>
              <td className="nest-popup-label">Especie</td>
              <td>{current.especie_ultima_observacion}</td>
            </tr>
          )}
          <tr>
            <td className="nest-popup-label">Ocupado</td>
            <td>{current.ocupado ? 'Sí' : 'No'}</td>
          </tr>
          <tr>
            <td className="nest-popup-label">Huevos</td>
            <td>{current.hay_huevos ? current.cantidad_huevos : 'No'}</td>
          </tr>
          <tr>
            <td className="nest-popup-label">Polluelos</td>
            <td>{current.hay_polluelos ? current.cantidad_polluelos : 'No'}</td>
          </tr>
          {current.ultima_observacion?.fecha_observacion && (
            <tr>
              <td className="nest-popup-label">Última observación</td>
              <td>{formatoFecha(current.ultima_observacion.fecha_observacion)}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button className="nest-popup-ver-ficha" onClick={() => onVerFicha(current.id)}>
        Ver ficha
      </button>
    </div>
  )
}

// MARCADORES DEL MAPA: GRUPO CON NÚMERO O NIDO SUELTO CON PUNTO
function Marcadores({ elementos, zoom, onSeleccionar, onVerFicha, seleccionandoUbicacion, seleccionandoUbicacionGrupo }) {
  const handleClick = useCallback((elemento) => {
    if (esMovil() && elemento.nidos.length > 0) {
      onSeleccionar(elemento.nidos[0])
    }
  }, [onSeleccionar])

  if (seleccionandoUbicacion || seleccionandoUbicacionGrupo) return null

  return elementos.map((elemento) => {
    const count = elemento.nidos.length
    const esGrupo = elemento.tipo === 'grupo'
    const color = esGrupo ? colorEstado(peorEstado(elemento.nidos)) : colorEstado(elemento.nidos[0].estado)
    const size = esGrupo ? Math.max(18, tamañoMarcador(zoom)) : tamañoMarcador(zoom)
    const icon = esGrupo ? crearIconoGrupo(color, size, count) : crearIcono(color, size)

    return (
      <Marker
        key={elemento.key}
        position={[elemento.lat, elemento.lng]}
        icon={icon}
        eventHandlers={esMovil() ? { click: () => handleClick(elemento) } : undefined}
      >
        {!esMovil() && (
          <Popup maxWidth={300}>
            <NestPopupContent elemento={elemento} onVerFicha={onVerFicha} />
          </Popup>
        )}
      </Marker>
    )
  })
}

// CAPTURA DE UBICACIÓN MEDIANTE CLIC EN EL MAPA
function LocationPicker({ activo, onUbicacion }) {
  useMapEvents({
    click(e) {
      if (!activo) return
      onUbicacion({ lat: parseFloat(e.latlng.lat.toFixed(6)), lng: parseFloat(e.latlng.lng.toFixed(6)) })
    },
  })
  return null
}

// NOTIFICA CAMBIOS DE ZOOM AL PADRE
function ZoomTracker({ onZoomChange }) {
  useMapEvents({
    zoomend(e) { onZoomChange(e.target.getZoom()) },
  })
  return null
}

// REAJUSTA EL MAPA CUANDO SE ABRE O CIERRA EL SIDEBAR
function MapInvalidator({ sidebarAbierto }) {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(timer)
  }, [sidebarAbierto, map])
  return null
}

// OVERLAY CON FICHA RÁPIDA DEL NIDO
function FichaNido({ nido, onCerrar, onVerFicha }) {
  if (!nido) return null
  const foto = nido.foto_principal

  return (
    <div className="ficha-overlay" onClick={onCerrar}>
      <div className="ficha-contenido" onClick={(e) => e.stopPropagation()}>
        <button className="ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        {foto && (
          <img src={foto} alt={nido.nombre} className="ficha-foto" />
        )}
        <h3 className="ficha-nombre">{nido.nombre}</h3>
        <table className="ficha-tabla">
          <tbody>
            <tr>
              <td className="ficha-label">Estado</td>
              <td style={{ color: colorEstado(nido.estado), fontWeight: 600 }}>
                {textoEstado(nido.estado)}
              </td>
            </tr>
            {nido.grupo_nombre && (
              <tr>
                <td className="ficha-label">Grupo</td>
                <td>{nido.grupo_nombre}{nido.codigo_en_grupo ? ` (${nido.codigo_en_grupo})` : ''}</td>
              </tr>
            )}
            {nido.posicion_en_grupo && (
              <tr>
                <td className="ficha-label">Posición</td>
                <td>{nido.posicion_en_grupo}</td>
              </tr>
            )}
            {nido.especie_ultima_observacion && (
              <tr>
                <td className="ficha-label">Especie</td>
                <td>{nido.especie_ultima_observacion}</td>
              </tr>
            )}
            <tr>
              <td className="ficha-label">Ocupado</td>
              <td>{nido.ocupado ? 'Sí' : 'No'}</td>
            </tr>
            <tr>
              <td className="ficha-label">Huevos</td>
              <td>{nido.hay_huevos ? nido.cantidad_huevos : 'No'}</td>
            </tr>
            <tr>
              <td className="ficha-label">Polluelos</td>
              <td>{nido.hay_polluelos ? nido.cantidad_polluelos : 'No'}</td>
            </tr>
            {nido.ultima_observacion?.fecha_observacion && (
              <tr>
                <td className="ficha-label">Última observación</td>
                <td>{formatoFecha(nido.ultima_observacion.fecha_observacion)}</td>
              </tr>
            )}
          </tbody>
        </table>
        <button className="ficha-ver-detalle" onClick={() => onVerFicha(nido.id)}>
          Ver ficha completa
        </button>
      </div>
    </div>
  )
}

// COMPONENTE PRINCIPAL: MAPA CON MARCADORES, FORMULARIOS Y FICHAS
function NestsMap({ sidebarAbierto }) {
  const { usuario } = useAuth()
  const [nidos, setNidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(12)
  const [nidoSeleccionado, setNidoSeleccionado] = useState(null)
  const [nidoDetalleId, setNidoDetalleId] = useState(null)
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false)
  const [mostrandoFormularioGrupo, setMostrandoFormularioGrupo] = useState(false)
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false)
  const [seleccionandoUbicacionGrupo, setSeleccionandoUbicacionGrupo] = useState(false)
  const [ubicacionTemporal, setUbicacionTemporal] = useState(null)
  const [ubicacionTemporalGrupo, setUbicacionTemporalGrupo] = useState(null)

  const elementos = agruparNidos(nidos)

  const puedeCrear = usuario && (usuario.rol === 'admin' || usuario.rol === 'bander')

  // RECARGA LOS NIDOS DEL MAPA
  const recargarNidos = useCallback(() => {
    getNidosMapa()
      .then(setNidos)
      .catch(() => setError('No se han podido cargar los nidos.'))
    setNidoSeleccionado(null)
  }, [])

  useEffect(() => {
    getNidosMapa()
      .then(setNidos)
      .catch(() => setError('No se han podido cargar los nidos.'))
      .finally(() => setCargando(false))
  }, [])

  // CIERRE DEL FORMULARIO Y RECARGA TRAS CREAR NIDO
  const handleCrearNido = (nuevo) => {
    setMostrandoFormulario(false)
    setSeleccionandoUbicacion(false)
    setUbicacionTemporal(null)
    recargarNidos()
  }

  // CIERRE DEL FORMULARIO Y RECARGA TRAS CREAR GRUPO
  const handleCrearGrupo = (nuevoGrupo) => {
    setMostrandoFormularioGrupo(false)
    setSeleccionandoUbicacionGrupo(false)
    setUbicacionTemporalGrupo(null)
    recargarNidos()
  }

  const handleUbicacionSeleccionada = (punto) => {
    setUbicacionTemporal(punto)
    setSeleccionandoUbicacion(false)
  }

  const handleUbicacionGrupoSeleccionada = (punto) => {
    setUbicacionTemporalGrupo(punto)
    setSeleccionandoUbicacionGrupo(false)
  }
  if (cargando) {
    return (
      <div className="mapa-estado">
        <p>Cargando mapa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mapa-estado mapa-estado--error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="nests-map">
      <MapContainer
        center={CENTRO_ANDORRA}
        zoom={12}
        minZoom={10}
        maxBounds={MAP_MAX_BOUNDS}
        maxBoundsViscosity={0.8}
        className="nests-map-contenedor"
        zoomControl={true}
      >
        <AjustarVista />
        <MapInvalidator sidebarAbierto={sidebarAbierto} />
        <ZoomTracker onZoomChange={setZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker
          activo={seleccionandoUbicacion}
          onUbicacion={handleUbicacionSeleccionada}
        />
        <LocationPicker
          activo={seleccionandoUbicacionGrupo}
          onUbicacion={handleUbicacionGrupoSeleccionada}
        />
        {nidos.length > 0 && (
          <Marcadores
            elementos={elementos}
            zoom={zoom}
            onSeleccionar={setNidoSeleccionado}
            onVerFicha={setNidoDetalleId}
            seleccionandoUbicacion={seleccionandoUbicacion}
            seleccionandoUbicacionGrupo={seleccionandoUbicacionGrupo}
          />
        )}
        {ubicacionTemporal && (
          <Marker
            position={[ubicacionTemporal.lat, ubicacionTemporal.lng]}
            icon={ICONO_UBICACION}
          />
        )}
        {ubicacionTemporalGrupo && (
          <Marker
            position={[ubicacionTemporalGrupo.lat, ubicacionTemporalGrupo.lng]}
            icon={ICONO_UBICACION}
          />
        )}
      </MapContainer>

      {nidos.length === 0 && (
        <div className="mapa-sin-nidos">
          <p>No hay nidos registrados.</p>
        </div>
      )}

      {seleccionandoUbicacion && (
        <div className="mapa-aviso-seleccion">
          Haz clic en el mapa para seleccionar la ubicación del nido
        </div>
      )}

      {seleccionandoUbicacionGrupo && (
        <div className="mapa-aviso-seleccion">
          Haz clic en el mapa para seleccionar la ubicación del grupo
        </div>
      )}

      {puedeCrear && !mostrandoFormulario && !mostrandoFormularioGrupo && (
        <div className="mapa-botones-flotantes">
          <button className="mapa-boton-nuevo" onClick={() => setMostrandoFormularioGrupo(true)}>
            + Nuevo grupo
          </button>
          <button className="mapa-boton-nuevo" onClick={() => setMostrandoFormulario(true)}>
            + Nuevo nido
          </button>
        </div>
      )}

      <FichaNido
        nido={nidoSeleccionado}
        onCerrar={() => setNidoSeleccionado(null)}
        onVerFicha={(id) => {
          setNidoSeleccionado(null)
          setNidoDetalleId(id)
        }}
      />
      {nidoDetalleId && (
        <NestDetailPanel
          nidoId={nidoDetalleId}
          onCerrar={() => setNidoDetalleId(null)}
          onRecargar={recargarNidos}
        />
      )}
      {mostrandoFormulario && (
        <NestCreateForm
          onCrear={handleCrearNido}
          onCerrar={() => {
            setMostrandoFormulario(false)
            setSeleccionandoUbicacion(false)
            setUbicacionTemporal(null)
          }}
          onIniciarSeleccion={() => setSeleccionandoUbicacion(true)}
          onCancelarSeleccion={() => {
            setSeleccionandoUbicacion(false)
            setUbicacionTemporal(null)
          }}
          seleccionandoUbicacion={seleccionandoUbicacion}
          ubicacionTemporal={ubicacionTemporal}
        />
      )}
      {mostrandoFormularioGrupo && (
        <NestGroupCreateForm
          onCrear={handleCrearGrupo}
          onCerrar={() => {
            setMostrandoFormularioGrupo(false)
            setSeleccionandoUbicacionGrupo(false)
            setUbicacionTemporalGrupo(null)
          }}
          onIniciarSeleccionGrupo={() => setSeleccionandoUbicacionGrupo(true)}
          onCancelarSeleccionGrupo={() => {
            setSeleccionandoUbicacionGrupo(false)
            setUbicacionTemporalGrupo(null)
          }}
          seleccionandoUbicacionGrupo={seleccionandoUbicacionGrupo}
          ubicacionTemporalGrupo={ubicacionTemporalGrupo}
        />
      )}
    </div>
  )
}

export default NestsMap
