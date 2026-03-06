/**
 * Auth Context Provider
 * 
 * Provides authentication state throughout the application.
 * Stores JWT token in localStorage and provides login/register/logout functions.
 * 
 * Usage:
 *   Wrap your app with <AuthProvider> then use the `useAuth()` hook to access:
 *   - user: The currently logged-in user (or null)
 *   - token: The JWT token string (or null)
 *   - login(email, password): Log in and store credentials
 *   - register(data): Register a new account
 *   - logout(): Clear credentials and redirect
 *   - isLoading: Whether the initial auth check is in progress
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ───

interface User {
  id: string
  name: string
  email: string
  role: 'farmer' | 'buyer'
  phone: string | null
  location: string | null
  createdAt: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'farmer' | 'buyer'
  phone?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Provider Component ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // On mount, check if there's a saved token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('agrovault_token')
    if (savedToken) {
      // Verify the token is still valid by calling /api/auth/me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('Invalid token')
        })
        .then((data) => {
          setUser(data.user)
          setToken(savedToken)
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('agrovault_token')
          localStorage.removeItem('agrovault_user')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  /** Log in with email and password */
  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    // Store in state and localStorage
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('agrovault_token', data.token)
    localStorage.setItem('agrovault_user', JSON.stringify(data.user))
  }

  /** Register a new account */
  const register = async (registerData: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')

    // Auto-login after registration
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('agrovault_token', data.token)
    localStorage.setItem('agrovault_user', JSON.stringify(data.user))
  }

  /** Log out and redirect to login page */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('agrovault_token')
    localStorage.removeItem('agrovault_user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ───

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}
