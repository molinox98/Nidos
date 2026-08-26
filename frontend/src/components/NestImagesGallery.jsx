import { useState } from 'react'
import { formatoFecha } from '../utils/date'
import ImageViewerModal from './ImageViewerModal'

// ACCIONES DE GALERÍA: MARCAR PRINCIPAL / ELIMINAR
export default function NestImagesGallery({ imagenes, puedeEditar, puedeEliminar, onMarcarPrincipal, onEliminar }) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null)

  if (!imagenes || imagenes.length === 0) {
    return <p className="panel-vacio">No hay imágenes registradas.</p>
  }

  return (
    <>
      <div className="panel-galeria">
        {imagenes.map((img) => (
          <div key={img.id} className="panel-galeria-item">
            {img.archivo_url && (
              <img
                src={img.archivo_url}
                alt={img.descripcion || 'Imagen del nido'}
                className="panel-galeria-foto panel-galeria-foto--clicable"
                onClick={() => setImagenSeleccionada(img)}
              />
            )}
            {!img.archivo_url && (
              <div className="panel-galeria-foto panel-galeria-sin-foto">Sin imagen</div>
            )}
            <div className="panel-galeria-info">
              {img.descripcion && <span className="panel-galeria-desc">{img.descripcion}</span>}
              <span className="panel-galeria-meta">
                {formatoFecha(img.fecha_subida)}
                {img.usuario_nombre && ` · ${img.usuario_nombre}`}
              </span>
              {img.es_principal && <span className="panel-galeria-principal">Principal</span>}
              <div className="panel-galeria-acciones">
                {!img.es_principal && puedeEditar && (
                  <button
                    className="panel-galeria-boton-principal"
                    onClick={() => onMarcarPrincipal(img.id)}
                  >
                    Marcar como principal
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    className="imagen-galeria-boton-eliminar"
                    onClick={() => onEliminar(img)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ImageViewerModal imagen={imagenSeleccionada} onCerrar={() => setImagenSeleccionada(null)} />
    </>
  )
}
