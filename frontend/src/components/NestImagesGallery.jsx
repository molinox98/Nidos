import { formatoFecha } from '../utils/date'

export default function NestImagesGallery({ imagenes }) {
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
          </div>
        </div>
      ))}
    </div>
  )
}
