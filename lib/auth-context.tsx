'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useGeolocation } from '@/hooks/use-geolocation'

// ─── Types ───

interface User {
  id: string
  name: string
  email: string
  role: 'farmer' | 'job_applicant'
  phone: string | null
  location: string | null
  createdAt: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'farmer' | 'job_applicant'
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
  const { captureLocation } = useGeolocation()

  // On mount, check if there's a saved token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('agrovault_token')
    if (savedToken) {
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

    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('agrovault_token', data.token)
    localStorage.setItem('agrovault_user', JSON.stringify(data.user))

    // Request geolocation permission after login (fire-and-forget)
    captureLocation(data.token)

    if (data.user.role === 'farmer') {
      router.push('/dashboard')
    } else {
      router.push('/jobs')
    }
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

    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('agrovault_token', data.token)
    localStorage.setItem('agrovault_user', JSON.stringify(data.user))

    // Request geolocation permission after registration (fire-and-forget)
    captureLocation(data.token)

    if (data.user.role === 'farmer') {
      router.push('/dashboard')
    } else {
      router.push('/jobs')
    }
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

