import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api, { getCsrfCookie } from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Restore session on app boot.
   * If Sanctum cookie is still valid, this returns the user.
   * If not, it 401s — that's fine, we just set user=null.
   */
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/user')
      setUser(data)
      return data
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await refresh()
      setLoading(false)
    })()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    await getCsrfCookie() // 1. get XSRF cookie
    await api.post('/login', { email, password }) // 2. login
    const { data } = await api.get('/api/user') // 3. hydrate user
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } finally {
      setUser(null)
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
