import './App.css'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import logo from './assets/logo-nidos.png'

function SesionActiva() {
  const { usuario, logout } = useAuth()

  return (
    <div className="app-container">
      <div className="app-card">
        <img src={logo} alt="Nidos" className="app-logo" />
        <h1 className="app-title">Nidos</h1>
        <p className="app-subtitle">
          Registro y seguimiento de nidos de aves
        </p>
        <p className="app-ok">Sesión iniciada correctamente</p>

        <div className="app-usuario">
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
        </div>

        <p className="app-proximo">
          El layout principal se implementará en el Commit 10.
        </p>

        <button className="app-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function Cargando() {
  return (
    <div className="app-container">
      <div className="app-card">
        <p className="app-cargando">Comprobando sesión...</p>
      </div>
    </div>
  )
}

function App() {
  const { autenticado, cargando } = useAuth()

  if (cargando) {
    return <Cargando />
  }

  if (!autenticado) {
    return <Login />
  }

  return <SesionActiva />
}

export default App
