import { formatoFecha } from '../utils/date'

// ACCIONES DE GALERÍA: MARCAR PRINCIPAL
export default function NestImagesGallery({ imagenes, puedeEditar, onMarcarPrincipal }) {
  if (!imagenes || imagenes.length === 0) {
    return <p className="panel-vacio">No hay imágenes registradas.</p>
  }

  return (
    <div className="panel-galeria">
      {imagenes.map((img) => (
        <div key={img.id} className="panel-galeria-item">
          <img
            src={img.archivo_url}
            alt={img.descripcion || 'Imagen del nido'}
            className="panel-galeria-foto"
          />
          <div className="panel-galeria-info">
            {img.descripcion && <span className="panel-galeria-desc">{img.descripcion}</span>}
            <span className="panel-galeria-meta">
              {formatoFecha(img.fecha_subida)}
              {img.usuario_nombre && ` · ${img.usuario_nombre}`}
            </span>
            {img.es_principal && <span className="panel-galeria-principal">Principal</span>}
            {!img.es_principal && puedeEditar && (
              <button
                className="panel-galeria-boton-principal"
                onClick={() => onMarcarPrincipal(img.id)}
              >
                Marcar como principal
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
