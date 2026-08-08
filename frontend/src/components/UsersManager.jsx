import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsuarios, createUsuario, updateUsuario } from '../api/usuarios'
import { formatoFecha } from '../utils/date'
import UserForm from './UserForm'

const ROLES = {
  admin: 'Administrador',
  bander: 'Bander',
  consulta: 'Consulta',
}

// VISTA DE GESTIÓN DE USUARIOS
export default function UsersManager() {
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'

  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)

  // CARGA DE USUARIOS
  const cargarUsuarios = () => {
    setCargando(true)
    setError(null)
    getUsuarios()
      .then(setUsuarios)
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    if (esAdmin) cargarUsuarios()
  }, [])

  // ACCESO NO PERMITIDO
  if (!esAdmin) {
    return (
      <div className="users-gestion">
        <p className="users-acceso-denegado">No tienes permiso para acceder a la gestión de usuarios.</p>
      </div>
    )
  }

  // ABRE FORMULARIO DE CREACIÓN O EDICIÓN
  const abrirFormulario = (usuarioSeleccionado = null) => {
    setUsuarioEditando(usuarioSeleccionado)
    setFormAbierto(true)
  }

  const cerrarFormulario = () => {
    setFormAbierto(false)
    setUsuarioEditando(null)
  }

  // GUARDAR CREACIÓN O EDICIÓN
  const guardarUsuario = async (data) => {
    if (usuarioEditando) {
      await updateUsuario(usuarioEditando.id, data)
    } else {
      await createUsuario(data)
    }
    cerrarFormulario()
    cargarUsuarios()
  }

  return (
    <div className="users-gestion">
      <div className="users-cabecera">
        <div>
          <h2 className="users-titulo">Gestión de usuarios</h2>
          <p className="users-subtitulo">Administración de usuarios y roles de acceso</p>
        </div>
        <button className="users-boton-nueva" onClick={() => abrirFormulario()}>
          + Nuevo usuario
        </button>
      </div>

      {cargando && <p className="users-estado">Cargando usuarios...</p>}
      {error && <p className="users-estado users-estado--error">{error}</p>}

      {!cargando && !error && usuarios.length === 0 && (
        <p className="users-vacio">No hay usuarios registrados.</p>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <>
          {/* TABLA EN ESCRITORIO */}
          <div className="users-tabla-wrap">
            <table className="users-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha creación</th>
                  <th className="users-col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="users-celda-nombre">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{ROLES[u.rol] || u.rol}</td>
                    <td>
                      <span className={`users-estado-badge ${u.activo ? 'users-estado-badge--activo' : 'users-estado-badge--inactivo'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{formatoFecha(u.fecha_creacion)}</td>
                    <td className="users-col-acciones">
                      <button className="users-boton-editar" onClick={() => abrirFormulario(u)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LISTA EN MÓVIL */}
          <div className="users-lista">
            {usuarios.map((u) => (
              <div className="users-fila" key={u.id}>
                <div className="users-fila-cabecera">
                  <span className="users-fila-nombre">{u.nombre}</span>
                  <button className="users-boton-editar" onClick={() => abrirFormulario(u)}>
                    Editar
                  </button>
                </div>
                <div className="users-fila-detalle">{u.email}</div>
                <div className="users-fila-detalle">{ROLES[u.rol] || u.rol}</div>
                <div className="users-fila-detalle">
                  <span className={`users-estado-badge ${u.activo ? 'users-estado-badge--activo' : 'users-estado-badge--inactivo'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="users-fila-fecha">Creado el {formatoFecha(u.fecha_creacion)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {formAbierto && (
        <UserForm
          usuario={usuarioEditando}
          onGuardar={guardarUsuario}
          onCerrar={cerrarFormulario}
        />
      )}
    </div>
  )
}
