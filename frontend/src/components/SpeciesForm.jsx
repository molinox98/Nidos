import { useState } from 'react'

// FORMULARIO DE ESPECIE (CREAR O EDITAR)
export default function SpeciesForm({ especie, onGuardar, onCerrar }) {
  const [nombreComun, setNombreComun] = useState(especie?.nombre_comun || '')
  const [nombreCientifico, setNombreCientifico] = useState(especie?.nombre_cientifico || '')
  const [notas, setNotas] = useState(especie?.notas || '')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // ENVÍA LA ESPECIE AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nombreComun.trim()) {
      setError('El nombre común es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      const data = { nombre_comun: nombreComun.trim() }
      if (nombreCientifico.trim()) data.nombre_cientifico = nombreCientifico.trim()
      if (notas.trim()) data.notas = notas.trim()
      await onGuardar(data)
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al guardar la especie.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-overlay" onClick={onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">{especie ? 'Editar especie' : 'Nueva especie'}</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            <div className="form-campo">
              <label>Nombre común *</label>
              <input
                type="text"
                value={nombreComun}
                onChange={(e) => setNombreComun(e.target.value)}
              />
            </div>

            <div className="form-campo">
              <label>Nombre científico</label>
              <input
                type="text"
                value={nombreCientifico}
                onChange={(e) => setNombreCientifico(e.target.value)}
              />
            </div>

            <div className="form-campo">
              <label>Notas</label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
