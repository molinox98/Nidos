import { useState, useEffect } from 'react'
import { getEspecies } from '../api/especies'
import { createObservacion, updateObservacion } from '../api/observaciones'
import { uploadImagen } from '../api/imagenes'
import { formatoFecha } from '../utils/date'

// FECHA DE HOY EN FORMATO ISO
function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

// FORMATO DE ERRORES DE LA API
function formatearError(err) {
  if (err.data) {
    const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    return msgs.join(' | ')
  }
  return null
}

// MODOS: crear / editar
export default function NestObservationForm({
  nidoId,
  modo = 'crear',
  observacionInicial = null,
  fechaDescubrimiento = null,
  onCrear,
  onGuardar,
  onCerrar,
}) {
  // MODO EDICIÓN
  const esEdicion = modo === 'editar'

  const [especies, setEspecies] = useState([])
  const [especie, setEspecie] = useState(() => {
    if (esEdicion && observacionInicial) return observacionInicial.especie || ''
    return ''
  })
  const [fechaObservacion, setFechaObservacion] = useState(() => {
    if (esEdicion && observacionInicial) {
      const f = observacionInicial.fecha_observacion
      return f ? String(f).split('T')[0] : hoyISO()
    }
    return hoyISO()
  })
  const [ocupado, setOcupado] = useState(() => (
    esEdicion && observacionInicial ? Boolean(observacionInicial.ocupado) : false
  ))
  const [hayHuevos, setHayHuevos] = useState(() => (
    esEdicion && observacionInicial ? Boolean(observacionInicial.hay_huevos) : false
  ))
  const [cantidadHuevos, setCantidadHuevos] = useState(() => {
    if (esEdicion && observacionInicial) return observacionInicial.cantidad_huevos ?? 0
    return 0
  })
  const [hayPolluelos, setHayPolluelos] = useState(() => (
    esEdicion && observacionInicial ? Boolean(observacionInicial.hay_polluelos) : false
  ))
  const [cantidadPolluelos, setCantidadPolluelos] = useState(() => {
    if (esEdicion && observacionInicial) return observacionInicial.cantidad_polluelos ?? 0
    return 0
  })
  const [notas, setNotas] = useState(() => {
    if (esEdicion && observacionInicial) return observacionInicial.notas || ''
    return ''
  })
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // IMÁGENES SOLO EN CREACIÓN
  const [archivos, setArchivos] = useState([])
  const [descripcionImg, setDescripcionImg] = useState('')
  const [esPrincipalImg, setEsPrincipalImg] = useState(false)
  const [errorImg, setErrorImg] = useState(null)

  useEffect(() => {
    getEspecies()
      .then(setEspecies)
      .catch(() => {})
  }, [])

  // ENVÍA LA OBSERVACIÓN AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setErrorImg(null)

    if (!fechaObservacion) { setError('La fecha de observación es obligatoria.'); return }

    // VALIDACIÓN DE FECHA DE OBSERVACIÓN
    if (esEdicion && fechaDescubrimiento && fechaObservacion < fechaDescubrimiento) {
      setError(`La fecha de observación no puede ser anterior a la fecha de descubrimiento del nido (${formatoFecha(fechaDescubrimiento)}).`)
      return
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        // GUARDAR CAMBIOS
        const body = {
          fecha_observacion: fechaObservacion,
          ocupado,
          hay_huevos: hayHuevos,
          cantidad_huevos: parseInt(cantidadHuevos, 10) || 0,
          hay_polluelos: hayPolluelos,
          cantidad_polluelos: parseInt(cantidadPolluelos, 10) || 0,
          notas: notas.trim(),
        }
        if (especie) body.especie = parseInt(especie, 10)
        else body.especie = null

        const actualizada = await updateObservacion(observacionInicial.id, body)
        if (onGuardar) onGuardar(actualizada)
      } else {
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

        // SUBIDA TRAS CREAR OBSERVACIÓN
        let falloImagenes = false
        if (archivos.length > 0) {
          for (let i = 0; i < archivos.length; i++) {
            try {
              const fd = new FormData()
              fd.append('nido', nidoId)
              fd.append('observacion', nueva.id)
              fd.append('archivo', archivos[i])
              if (descripcionImg.trim()) fd.append('descripcion', descripcionImg.trim())
              // PRIMERA IMAGEN COMO PRINCIPAL
              fd.append('es_principal', (esPrincipalImg && i === 0) ? 'true' : 'false')
              await uploadImagen(fd)
            } catch {
              falloImagenes = true
            }
          }
        }

        if (falloImagenes) {
          setErrorImg(
            'La observación se creó, pero una o varias imágenes no se pudieron subir.'
          )
        }

        onCrear(nueva)
      }
    } catch (err) {
      setError(formatearError(err) || (esEdicion ? 'Error al guardar la observación.' : 'Error al crear la observación.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-overlay" onClick={onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">
            {esEdicion ? 'Editar observación' : 'Nueva observación'}
          </h3>
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

            {/* IMÁGENES SOLO EN CREACIÓN */}
            {!esEdicion && (
              <div className="form-seccion-imagen">
                <p className="form-seccion-imagen-titulo">Imágenes de la observación</p>
                <div className="form-campo">
                  <label>Archivos de imagen</label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setArchivos(Array.from(e.target.files))}
                  />
                  <p className="form-grupo-ayuda">Puedes seleccionar una o varias imágenes.</p>
                  {archivos.length > 0 && (
                    <p className="form-grupo-ayuda">{archivos.length} archivo(s) seleccionado(s).</p>
                  )}
                </div>
                <div className="form-campo">
                  <label>Descripción (compartida)</label>
                  <textarea
                    rows={2}
                    value={descripcionImg}
                    onChange={(e) => setDescripcionImg(e.target.value)}
                  />
                </div>
                <div className="form-campo">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={esPrincipalImg}
                      onChange={(e) => setEsPrincipalImg(e.target.checked)}
                    />
                    Marcar primera imagen como principal
                  </label>
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}
            {errorImg && <p className="form-error form-error--aviso">{errorImg}</p>}

            <div className="form-acciones">
              <button type="button" className="form-boton-cancelar" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="form-boton-guardar" disabled={guardando}>
                {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar observación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
