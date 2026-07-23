import { useState, useEffect } from 'react'
import { getEspecies } from '../api/especies'
import { createObservacion } from '../api/observaciones'

// FECHA DE HOY EN FORMATO ISO
function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

export default function NestObservationForm({ nidoId, onCrear, onCerrar }) {
  const [especies, setEspecies] = useState([])
  const [especie, setEspecie] = useState('')
  const [fechaObservacion, setFechaObservacion] = useState(hoyISO())
  const [ocupado, setOcupado] = useState(false)
  const [hayHuevos, setHayHuevos] = useState(false)
  const [cantidadHuevos, setCantidadHuevos] = useState(0)
  const [hayPolluelos, setHayPolluelos] = useState(false)
  const [cantidadPolluelos, setCantidadPolluelos] = useState(0)
  const [notas, setNotas] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    getEspecies()
      .then(setEspecies)
      .catch(() => {})
  }, [])

  // ENVÍA LA OBSERVACIÓN AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!fechaObservacion) { setError('La fecha de observación es obligatoria.'); return }

    setGuardando(true)
    try {
      const body = {
        nido: parseInt(nidoId, 10),
        fecha_observacion: fechaObservacion,
        ocupado,
        hay_huevos: hayHuevos,
        cantidad_huevos: parseInt(cantidadHuevos, 10) || 0,
        hay_polluelos: hayPolluelos,
        cantidad_polluelos: parseInt(cantidadPolluelos, 10) || 0,
      }
      if (especie) body.especie = parseInt(especie, 10)
      if (notas.trim()) body.notas = notas.trim()

      const nueva = await createObservacion(body)
      onCrear(nueva)
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al guardar la observación.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-overlay" onClick={onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">Nueva observación</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            <div className="form-campo">
              <label>Fecha de observación *</label>
              <input type="date" value={fechaObservacion} onChange={(e) => setFechaObservacion(e.target.value)} />
            </div>

            <div className="form-campo">
              <label>Especie</label>
              <select value={especie} onChange={(e) => setEspecie(e.target.value)}>
                <option value="">Sin identificar</option>
                {especies.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.nombre_comun}</option>
                ))}
              </select>
            </div>

            <div className="form-campo">
              <label className="form-checkbox-label">
                <input type="checkbox" checked={ocupado} onChange={(e) => setOcupado(e.target.checked)} />
                Ocupado
              </label>
            </div>

            <div className="form-campo">
              <label className="form-checkbox-label">
                <input type="checkbox" checked={hayHuevos} onChange={(e) => setHayHuevos(e.target.checked)} />
                Hay huevos
              </label>
            </div>

            {hayHuevos && (
              <div className="form-campo">
                <label>Cantidad de huevos</label>
                <input type="number" min={0} value={cantidadHuevos} onChange={(e) => setCantidadHuevos(e.target.value)} />
              </div>
            )}

            <div className="form-campo">
              <label className="form-checkbox-label">
                <input type="checkbox" checked={hayPolluelos} onChange={(e) => setHayPolluelos(e.target.checked)} />
                Hay polluelos
              </label>
            </div>

            {hayPolluelos && (
              <div className="form-campo">
                <label>Cantidad de polluelos</label>
                <input type="number" min={0} value={cantidadPolluelos} onChange={(e) => setCantidadPolluelos(e.target.value)} />
              </div>
            )}

            <div className="form-campo">
              <label>Notas</label>
              <textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar observación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
