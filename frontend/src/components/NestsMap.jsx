import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNidosMapa } from '../api/nidos'
import { formatoFecha, textoEstado, colorEstado } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import NestDetailPanel from './NestDetailPanel'
import NestCreateForm from './NestCreateForm'

const CENTRO_ANDORRA = [42.5063, 1.5218]
const ANDORRA_BOUNDS = L.latLngBounds([42.42, 1.40], [42.66, 1.79])
const MAP_MAX_BOUNDS = L.latLngBounds([42.25, 1.15], [42.80, 2.05])
const ANCHO_MOVIL = 768

function esMovil() {
  return typeof window !== 'undefined' && window.innerWidth <= ANCHO_MOVIL
}

function AjustarVista() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(ANDORRA_BOUNDS, { padding: [30, 30] })
  }, [map])
  return null
}

function tamañoMarcador(zoom) {
  return Math.max(10, Math.min(24, Math.round(34 - zoom * 1.3)))
}

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

function NestPopup({ nido, onVerFicha }) {
  const foto = nido.foto_principal
  return (
    <div className="nest-popup">
      {foto && (
        <img src={foto} alt={nido.nombre} className="nest-popup-foto" />
      )}
      <h3 className="nest-popup-nombre">{nido.nombre}</h3>
      <table className="nest-popup-tabla">
        <tbody>
          <tr>
            <td className="nest-popup-label">Estado</td>
            <td style={{ color: colorEstado(nido.estado), fontWeight: 600 }}>
              {textoEstado(nido.estado)}
            </td>
          </tr>
          {nido.grupo_nombre && (
            <tr>
              <td className="nest-popup-label">Grupo</td>
              <td>{nido.grupo_nombre}{nido.codigo_en_grupo ? ` (${nido.codigo_en_grupo})` : ''}</td>
            </tr>
          )}
          {nido.posicion_en_grupo && (
            <tr>
              <td className="nest-popup-label">Posición</td>
              <td>{nido.posicion_en_grupo}</td>
            </tr>
          )}
          {nido.especie_ultima_observacion && (
            <tr>
              <td className="nest-popup-label">Especie</td>
              <td>{nido.especie_ultima_observacion}</td>
            </tr>
          )}
          <tr>
            <td className="nest-popup-label">Ocupado</td>
            <td>{nido.ocupado ? 'Sí' : 'No'}</td>
          </tr>
          <tr>
            <td className="nest-popup-label">Huevos</td>
            <td>{nido.hay_huevos ? nido.cantidad_huevos : 'No'}</td>
          </tr>
          <tr>
            <td className="nest-popup-label">Polluelos</td>
            <td>{nido.hay_polluelos ? nido.cantidad_polluelos : 'No'}</td>
          </tr>
          {nido.ultima_observacion?.fecha_observacion && (
            <tr>
              <td className="nest-popup-label">Última observación</td>
              <td>{formatoFecha(nido.ultima_observacion.fecha_observacion)}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button className="nest-popup-ver-ficha" onClick={() => onVerFicha(nido.id)}>
        Ver ficha
      </button>
    </div>
  )
}

function Marcadores({ nidos, zoom, onSeleccionar, onVerFicha, seleccionandoUbicacion }) {
  const handleClick = useCallback((nido) => {
    if (esMovil()) {
      onSeleccionar(nido)
    }
  }, [onSeleccionar])

  if (seleccionandoUbicacion) return null

  return nidos.map((nido) => (
    <Marker
      key={nido.id}
      position={[parseFloat(nido.latitud), parseFloat(nido.longitud)]}
      icon={crearIcono(colorEstado(nido.estado), tamañoMarcador(zoom))}
      eventHandlers={esMovil() ? { click: () => handleClick(nido) } : undefined}
    >
      {!esMovil() && (
        <Popup maxWidth={300}>
          <NestPopup nido={nido} onVerFicha={onVerFicha} />
        </Popup>
      )}
    </Marker>
  ))
}

function LocationPicker({ activo, onUbicacion }) {
  useMapEvents({
    click(e) {
      if (!activo) return
      onUbicacion({ lat: parseFloat(e.latlng.lat.toFixed(6)), lng: parseFloat(e.latlng.lng.toFixed(6)) })
    },
  })
  return null
}

function ZoomTracker({ onZoomChange }) {
  useMapEvents({
    zoomend(e) { onZoomChange(e.target.getZoom()) },
  })
  return null
}

function MapInvalidator({ sidebarAbierto }) {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(timer)
  }, [sidebarAbierto, map])
  return null
}

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

function NestsMap({ sidebarAbierto }) {
  const { usuario } = useAuth()
  const [nidos, setNidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(12)
  const [nidoSeleccionado, setNidoSeleccionado] = useState(null)
  const [nidoDetalleId, setNidoDetalleId] = useState(null)
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false)
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false)
  const [ubicacionTemporal, setUbicacionTemporal] = useState(null)

  const puedeCrear = usuario && (usuario.rol === 'admin' || usuario.rol === 'bander')

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

  const handleCrearNido = (nuevo) => {
    setMostrandoFormulario(false)
    setSeleccionandoUbicacion(false)
    setUbicacionTemporal(null)
    recargarNidos()
  }

  const handleUbicacionSeleccionada = (punto) => {
    setUbicacionTemporal(punto)
    setSeleccionandoUbicacion(false)
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
        {nidos.length > 0 && (
          <Marcadores
            nidos={nidos}
            zoom={zoom}
            onSeleccionar={setNidoSeleccionado}
            onVerFicha={setNidoDetalleId}
            seleccionandoUbicacion={seleccionandoUbicacion}
          />
        )}
        {ubicacionTemporal && (
          <Marker
            position={[ubicacionTemporal.lat, ubicacionTemporal.lng]}
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

      {puedeCrear && !mostrandoFormulario && (
        <button className="mapa-boton-nuevo" onClick={() => setMostrandoFormulario(true)}>
          + Nuevo nido
        </button>
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
    </div>
  )
}

export default NestsMap
