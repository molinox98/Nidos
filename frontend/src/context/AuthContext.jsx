import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUsuarioActual, logout as authLogout, refreshToken, login as authLogin } from '../api/auth'
import { clearTokens } from '../api/client'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarUsuario = useCallback(async () => {
    try {
      const data = await getUsuarioActual()
      setUsuario(data)
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        const refresh = localStorage.getItem('refresh')
        if (refresh) {
          try {
            await refreshToken(refresh)
            const data = await getUsuarioActual()
            setUsuario(data)
            return
          } catch {
            clearTokens()
          }
        }
      }
      setUsuario(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) {
      setCargando(false)
      return
    }
    cargarUsuario().finally(() => setCargando(false))
  }, [cargarUsuario])

  const login = async (username, password) => {
    await authLogin(username, password)
    const data = await getUsuarioActual()
    setUsuario(data)
  }

  const logout = () => {
    authLogout()
    setUsuario(null)
  }

  const value = {
    usuario,
    autenticado: !!usuario,
    cargando,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
