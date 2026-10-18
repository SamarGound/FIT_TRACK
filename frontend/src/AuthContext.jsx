import { createContext, useContext, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const saveSession = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data.token, res.data.user)
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    saveSession(res.data.token, res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'admin', login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
