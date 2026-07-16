import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-nidos.png'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    try {
      await login(username, password)
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        setError('Sesión expirada. Inicia sesión de nuevo.')
      } else if (err.status === 401) {
        setError('Usuario o contraseña incorrectos.')
      } else {
        setError('No se ha podido conectar con el servidor.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={logo} alt="Nidos" className="login-logo" />
        <h1 className="login-title">Nidos</h1>
        <p className="login-subtitle">
          Registro y seguimiento de nidos de aves
        </p>

        <div className="login-campos">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre o email"
            autoComplete="username"
            required
          />
        </div>

        <div className="login-campos">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-boton" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
