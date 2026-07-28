import { useEffect } from 'react'

// VISOR DE IMAGEN EN MODAL
export default function ImageViewerModal({ imagen, onCerrar }) {
  // CIERRE DEL MODAL CON ESCAPE
  useEffect(() => {
    if (!imagen) return
    const handler = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [imagen, onCerrar])

  if (!imagen || !imagen.archivo_url) return null

  return (
    <div className="visor-overlay" onClick={onCerrar}>
      <div className="visor-contenido" onClick={(e) => e.stopPropagation()}>
        <button className="visor-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        {imagen.es_principal && <span className="visor-badge">Principal</span>}
        <img src={imagen.archivo_url} alt={imagen.descripcion || 'Imagen del nido'} className="visor-foto" />
        {imagen.descripcion && <p className="visor-descripcion">{imagen.descripcion}</p>}
      </div>
    </div>
  )
}
