import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api.get('/me')
      .then((r) => setUser(r.data.user ?? r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }
  const register = async (payload) => {
    const { data } = await api.post('/register', payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }
  const logout = async () => {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, setUser, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  )
}
