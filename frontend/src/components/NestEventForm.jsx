import { useState } from 'react'
import { createEvento } from '../api/eventos'
import { updateNido } from '../api/nidos'

const TIPOS_EVENTO = ['cambio_estado', 'revision', 'incidencia', 'mantenimiento', 'otro']
const TIPO_TEXTO = {
  cambio_estado: 'Cambio de estado',
  revision: 'Revisión',
  incidencia: 'Incidencia',
  mantenimiento: 'Mantenimiento',
  otro: 'Otro',
}

const ESTADOS = ['', 'activo', 'inactivo', 'destruido', 'retirado']
const ESTADO_TEXTO = {
  '': '—',
  activo: 'Activo',
  inactivo: 'Inactivo',
  destruido: 'Destruido',
  retirado: 'Retirado',
}

function ahoraLocalISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function NestEventForm({ nidoId, estadoActual, onCrear, onCerrar }) {
  const [fechaEvento, setFechaEvento] = useState(ahoraLocalISO())
  const [tipoEvento, setTipoEvento] = useState('revision')
  const [descripcion, setDescripcion] = useState('')
  const [estadoNuevo, setEstadoNuevo] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!fechaEvento) { setError('La fecha del evento es obligatoria.'); return }

    if (tipoEvento === 'cambio_estado') {
      if (!estadoNuevo) { setError('Debes seleccionar un estado nuevo.'); return }
      if (estadoNuevo === estadoActual) { setError('El estado nuevo debe ser distinto del estado actual.'); return }
    }

    setGuardando(true)
    try {
      const body = {
        nido: parseInt(nidoId, 10),
        fecha_evento: fechaEvento,
        tipo_evento: tipoEvento,
      }
      if (descripcion.trim()) body.descripcion = descripcion.trim()
      if (tipoEvento === 'cambio_estado') {
        body.estado_anterior = estadoActual
        body.estado_nuevo = estadoNuevo
      }

      const nuevo = await createEvento(body)

      if (tipoEvento === 'cambio_estado' && estadoNuevo) {
        const fechaEstado = fechaEvento.split('T')[0]
        const patchBody = {
          estado: estadoNuevo,
          fecha_estado: fechaEstado,
        }
        if (descripcion.trim()) patchBody.motivo_estado = descripcion.trim()
        await updateNido(nidoId, patchBody)
      }

      onCrear(nuevo)
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al guardar el evento.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-overlay" onClick={onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">Nuevo evento</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            <div className="form-campo">
              <label>Fecha del evento *</label>
              <input type="datetime-local" value={fechaEvento} onChange={(e) => setFechaEvento(e.target.value)} />
            </div>

            <div className="form-campo">
              <label>Tipo de evento *</label>
              <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)}>
                {TIPOS_EVENTO.map((t) => (
                  <option key={t} value={t}>{TIPO_TEXTO[t]}</option>
                ))}
              </select>
            </div>

            <div className="form-campo">
              <label>Descripción</label>
              <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            {tipoEvento === 'cambio_estado' && (
              <div className="form-fila">
                <div className="form-campo form-campo--mitad">
                  <label>Estado anterior</label>
                  <div className="form-texto-fijo">{ESTADO_TEXTO[estadoActual] || '—'}</div>
                </div>
                <div className="form-campo form-campo--mitad">
                  <label>Estado nuevo *</label>
                  <select value={estadoNuevo} onChange={(e) => setEstadoNuevo(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {ESTADOS.filter((e) => e && e !== estadoActual).map((e) => (
                      <option key={e} value={e}>{ESTADO_TEXTO[e]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
