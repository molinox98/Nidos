import { useState } from 'react'
import { formatoFecha, formatoFechaHora } from '../utils/date'
import ImageViewerModal from './ImageViewerModal'

// TEXTO PARA CAMPOS SÍ/NO SIN REGISTRAR
function textoSiNo(valor) {
  if (valor === null || valor === undefined) return 'Sin registrar'
  return valor ? 'Sí' : 'No'
}

// TEXTO PARA HUEVOS O POLLUELOS CON CANTIDAD
function textoConCantidad(hay, cantidad) {
  if (hay === null || hay === undefined) return 'Sin registrar'
  if (!hay) return 'No'
  return `Sí (${cantidad ?? 0})`
}

// DETALLE COMPLETO DE UNA OBSERVACIÓN EN MODAL
export default function ObservationDetailModal({ observacion, imagenes, onCerrar }) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null)

  // IMÁGENES DE LA OBSERVACIÓN
  const imagenesObs = imagenes.filter((i) => String(i.observacion) === String(observacion.id))

  return (
    <div className="obs-detalle-overlay" onClick={onCerrar}>
      <div className="obs-detalle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="obs-detalle-cabecera">
          <h3 className="obs-detalle-titulo">Detalle de observación</h3>
          <button className="obs-detalle-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className="obs-detalle-cuerpo">
          <table className="panel-tabla">
            <tbody>
              <tr>
                <td className="panel-tabla-label">Fecha</td>
                <td>{formatoFecha(observacion.fecha_observacion)}</td>
              </tr>
              {observacion.especie_nombre && (
                <tr>
                  <td className="panel-tabla-label">Especie</td>
                  <td>{observacion.especie_nombre}</td>
                </tr>
              )}
              <tr>
                <td className="panel-tabla-label">Usuario</td>
                <td>{observacion.usuario_nombre || 'Usuario no disponible'}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Ocupado</td>
                <td>{textoSiNo(observacion.ocupado)}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Huevos</td>
                <td>{textoConCantidad(observacion.hay_huevos, observacion.cantidad_huevos)}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Polluelos</td>
                <td>{textoConCantidad(observacion.hay_polluelos, observacion.cantidad_polluelos)}</td>
              </tr>
              {observacion.notas && (
                <tr>
                  <td className="panel-tabla-label">Notas</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{observacion.notas}</td>
                </tr>
              )}
              <tr>
                <td className="panel-tabla-label">Registrada el</td>
                <td>{formatoFechaHora(observacion.fecha_creacion)}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Nido</td>
                <td>Nido #{observacion.nido}</td>
              </tr>
            </tbody>
          </table>

          <div className="obs-detalle-imagenes">
            <h4 className="obs-detalle-imagenes-titulo">Imágenes de la observación</h4>
            {imagenesObs.length === 0 ? (
              <p className="panel-vacio">Esta observación no tiene imágenes asociadas.</p>
            ) : (
              <div className="panel-galeria">
                {imagenesObs.map((img) => (
                  <div key={img.id} className="panel-galeria-item">
                    {img.archivo_url ? (
                      <img
                        src={img.archivo_url}
                        alt={img.descripcion || 'Imagen de la observación'}
                        className="panel-galeria-foto panel-galeria-foto--clicable"
                        onClick={() => setImagenSeleccionada(img)}
                      />
                    ) : (
                      <div className="panel-galeria-foto panel-galeria-sin-foto">Sin imagen</div>
                    )}
                    {img.descripcion && (
                      <div className="panel-galeria-info">
                        <span className="panel-galeria-desc">{img.descripcion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="obs-detalle-acciones">
          <button className="form-boton-cancelar" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>

      <ImageViewerModal imagen={imagenSeleccionada} onCerrar={() => setImagenSeleccionada(null)} />
    </div>
  )
}
