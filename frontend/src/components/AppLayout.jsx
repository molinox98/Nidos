import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-nidos.png'
import NestsMap from './NestsMap'
import SpeciesManager from './SpeciesManager'
import UsersManager from './UsersManager'

const SECCIONES = [
  { id: 'especies', label: 'Gestión de especies' },
  { id: 'nidos', label: 'Gestión de nidos' },
  { id: 'observaciones', label: 'Observaciones' },
  { id: 'imagenes', label: 'Imágenes' },
  { id: 'usuarios', label: 'Usuarios' },
]

const ROLES = {
  admin: 'Administrador',
  bander: 'Bander',
  consulta: 'Consulta',
}

// LAYOUT PRINCIPAL CON CABECERA, SIDEBAR Y VISTA ACTIVA
function AppLayout() {
  const { usuario, logout } = useAuth()
  const [seccionActiva, setSeccionActiva] = useState(null)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  // SOLO ADMIN VE LA GESTIÓN DE USUARIOS
  const esAdmin = usuario?.rol === 'admin'
  const seccionesVisibles = SECCIONES.filter((s) => s.id !== 'usuarios' || esAdmin)

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-izquierda">
          <button
            className="layout-menu-toggle"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            title={sidebarAbierto ? 'Ocultar menú' : 'Mostrar menú'}
          >
            ☰
          </button>
          <img src={logo} alt="Nidos" className="layout-logo" />
          <div className="layout-brand">
            <h1 className="layout-nombre">Nidos</h1>
            <p className="layout-subtitulo">Registro y seguimiento de nidos de aves</p>
          </div>
        </div>

        <div className="layout-header-derecha">
          <div className="layout-usuario">
            <span className="layout-usuario-nombre">{usuario.nombre}</span>
            <span className="layout-usuario-rol">{ROLES[usuario.rol] || usuario.rol}</span>
          </div>
          <button className="layout-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="layout-cuerpo">
        <nav className={`layout-sidebar ${sidebarAbierto ? '' : 'layout-sidebar--oculto'}`}>
          <ul className="layout-nav">
            <li>
              <button
                className={`layout-nav-item ${seccionActiva === null ? 'layout-nav-item--activa' : ''}`}
                onClick={() => {
                  setSeccionActiva(null)
                  setSidebarAbierto(false)
                }}
              >
                <span className="layout-nav-label">Mapa</span>
              </button>
            </li>
            {seccionesVisibles.map((s) => (
              <li key={s.id}>
                <button
                  className={`layout-nav-item ${seccionActiva === s.id ? 'layout-nav-item--activa' : ''}`}
                  onClick={() => {
                    setSeccionActiva(s.id)
                    setSidebarAbierto(false)
                  }}
                >
                  <span className="layout-nav-label">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`layout-overlay ${sidebarAbierto ? '' : 'layout-sidebar--oculto'}`}
          onClick={() => setSidebarAbierto(false)}
        />

        <main className="layout-contenido">
          {/* CAMBIO DE VISTA PRINCIPAL */}
          {seccionActiva === null && <NestsMap sidebarAbierto={sidebarAbierto} />}
          {seccionActiva === 'especies' && <SpeciesManager />}
          {seccionActiva === 'usuarios' && <UsersManager />}
          {seccionActiva !== null && seccionActiva !== 'especies' && seccionActiva !== 'usuarios' && (
            <div className="layout-placeholder">
              <h2>{SECCIONES.find((s) => s.id === seccionActiva)?.label}</h2>
              <p>Sección en desarrollo. Se implementará en una fase posterior.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
