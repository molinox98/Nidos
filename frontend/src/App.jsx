import './App.css'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import AppLayout from './components/AppLayout'

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

  return <AppLayout />
}

export default App
