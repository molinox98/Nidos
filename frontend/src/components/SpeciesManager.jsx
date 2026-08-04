import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEspecies, createEspecie, updateEspecie } from '../api/especies'
import { formatoFecha } from '../utils/date'
import SpeciesForm from './SpeciesForm'

// VISTA DE GESTIÓN DE ESPECIES
export default function SpeciesManager() {
  const { usuario } = useAuth()
  // PERMISOS DE EDICIÓN
  const puedeEditar = usuario?.rol === 'admin' || usuario?.rol === 'bander'

  const [especies, setEspecies] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [especieEditando, setEspecieEditando] = useState(null)

  // CARGA DE ESPECIES
  const cargarEspecies = () => {
    setCargando(true)
    setError(null)
    getEspecies()
      .then(setEspecies)
      .catch(() => setError('No se pudieron cargar las especies.'))
      .finally(() => setCargando(false))
  }

  useEffect(cargarEspecies, [])

  // ABRE FORMULARIO DE CREACIÓN O EDICIÓN
  const abrirFormulario = (especie = null) => {
    setEspecieEditando(especie)
    setFormAbierto(true)
  }

  const cerrarFormulario = () => {
    setFormAbierto(false)
    setEspecieEditando(null)
  }

  // GUARDAR CREACIÓN O EDICIÓN
  const guardarEspecie = async (data) => {
    if (especieEditando) {
      await updateEspecie(especieEditando.id, data)
    } else {
      await createEspecie(data)
    }
    cerrarFormulario()
    cargarEspecies()
  }

  return (
    <div className="species-gestion">
      <div className="species-cabecera">
        <div>
          <h2 className="species-titulo">Gestión de especies</h2>
          <p className="species-subtitulo">Consulta y mantenimiento de especies registradas</p>
        </div>
        {puedeEditar && (
          <button className="species-boton-nueva" onClick={() => abrirFormulario()}>
            + Nueva especie
          </button>
        )}
      </div>

      {cargando && <p className="species-estado">Cargando especies...</p>}
      {error && <p className="species-estado species-estado--error">{error}</p>}

      {!cargando && !error && especies.length === 0 && (
        <p className="species-vacio">No hay especies registradas.</p>
      )}

      {!cargando && !error && especies.length > 0 && (
        <>
          {/* TABLA EN ESCRITORIO */}
          <div className="species-tabla-wrap">
            <table className="species-tabla">
              <thead>
                <tr>
                  <th>Nombre común</th>
                  <th>Nombre científico</th>
                  <th>Notas</th>
                  <th>Fecha creación</th>
                  <th className="species-col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {especies.map((sp) => (
                  <tr key={sp.id}>
                    <td className="species-celda-nombre">{sp.nombre_comun}</td>
                    <td>{sp.nombre_cientifico || '—'}</td>
                    <td className="species-celda-notas">{sp.notas || '—'}</td>
                    <td>{formatoFecha(sp.fecha_creacion)}</td>
                    <td className="species-col-acciones">
                      {puedeEditar && (
                        <button className="species-boton-editar" onClick={() => abrirFormulario(sp)}>
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LISTA EN MÓVIL */}
          <div className="species-lista">
            {especies.map((sp) => (
              <div className="species-fila" key={sp.id}>
                <div className="species-fila-cabecera">
                  <span className="species-fila-nombre">{sp.nombre_comun}</span>
                  {puedeEditar && (
                    <button className="species-boton-editar" onClick={() => abrirFormulario(sp)}>
                      Editar
                    </button>
                  )}
                </div>
                <div className="species-fila-detalle">{sp.nombre_cientifico || 'Sin nombre científico'}</div>
                {sp.notas && <div className="species-fila-detalle">{sp.notas}</div>}
                <div className="species-fila-fecha">Creada el {formatoFecha(sp.fecha_creacion)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {formAbierto && (
        <SpeciesForm
          especie={especieEditando}
          onGuardar={guardarEspecie}
          onCerrar={cerrarFormulario}
        />
      )}
    </div>
  )
}
