import { useState } from 'react'
import { uploadImagen } from '../api/imagenes'

// SUBIDA DE IMAGEN INLINE DENTRO DE LA FICHA
export default function NestImageUploadForm({ nidoId, onCrear, onCerrar }) {
  const [archivo, setArchivo] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [esPrincipal, setEsPrincipal] = useState(false)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!archivo) {
      setError('Debes seleccionar un archivo de imagen.')
      return
    }

    // VALIDAR TIPO DE ARCHIVO
    const tiposOk = ['image/jpeg', 'image/png', 'image/webp']
    if (!tiposOk.includes(archivo.type)) {
      setError('Formato no válido. Se permiten JPG, PNG y WebP.')
      return
    }

    setGuardando(true)
    try {
      const fd = new FormData()
      fd.append('nido', nidoId)
      fd.append('archivo', archivo)
      if (descripcion.trim()) fd.append('descripcion', descripcion.trim())
      fd.append('es_principal', esPrincipal ? 'true' : 'false')

      await uploadImagen(fd)
      onCrear()
    } catch (err) {
      if (err && err.data) {
        const msgs = Object.entries(err.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al subir la imagen.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="form-subida-imagen">
      <p className="form-subida-titulo">Subir nueva imagen</p>
      <form className="form-nido" onSubmit={handleSubmit}>
        <div className="form-campo">
          <label>Archivo de imagen *</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
          {archivo && <p className="form-grupo-ayuda">{archivo.name}</p>}
        </div>

        <div className="form-campo">
          <label>Descripción</label>
          <textarea
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={esPrincipal}
              onChange={(e) => setEsPrincipal(e.target.checked)}
            />
            Marcar como principal
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-acciones">
          <button
            type="button"
            className="form-boton-cancelar"
            onClick={onCerrar}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="form-boton-guardar"
            disabled={guardando}
          >
            {guardando ? 'Subiendo...' : 'Subir imagen'}
          </button>
        </div>
      </form>
    </div>
  )
}
