import { useState } from 'react'

const ROLES = ['admin', 'bander', 'consulta']

// FORMULARIO DE USUARIO (CREAR O EDITAR)
export default function UserForm({ usuario, onGuardar, onCerrar }) {
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [email, setEmail] = useState(usuario?.email || '')
  const [rol, setRol] = useState(usuario?.rol || 'consulta')
  const [activo, setActivo] = useState(usuario ? usuario.activo : true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // ENVÍA EL USUARIO AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!email.trim()) { setError('El email es obligatorio.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('El email no es válido.'); return }
    if (!rol) { setError('El rol es obligatorio.'); return }
    if (!usuario && !password) { setError('La contraseña es obligatoria.'); return }

    const data = {
      nombre: nombre.trim(),
      email: email.trim(),
      rol,
      activo,
    }
    // CONTRASEÑA OPCIONAL EN EDICIÓN
    if (password.trim()) data.password = password

    setGuardando(true)
    try {
      await onGuardar(data)
    } catch (err) {
      if (err.data) {
        const msgs = Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setError(msgs.join(' | '))
      } else {
        setError('Error al guardar el usuario.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel-overlay" onClick={onCerrar}>
      <div className="panel-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h3 className="panel-titulo">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="panel-cuerpo">
          <form className="form-nido" onSubmit={handleSubmit}>
            <div className="form-campo">
              <label>Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-campo">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-campo">
              <label>Rol *</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-campo">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                Activo
              </label>
            </div>

            <div className="form-campo">
              <label>Contraseña{usuario ? '' : ' *'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {usuario && (
                <p className="form-grupo-ayuda">Déjala vacía para mantener la contraseña actual</p>
              )}
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
