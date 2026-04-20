'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserRole } from '@/types'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for the application
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: 'user-001',
    email: 'intern@csx.com',
    password: 'intern123',
    name: 'Alex Johnson',
    role: 'intern',
    department: 'Customer Support',
  },
  {
    id: 'user-002',
    email: 'lead@csx.com',
    password: 'lead123',
    name: 'Sarah Mitchell',
    role: 'lead',
    department: 'Project Management',
  },
  {
    id: 'user-003',
    email: 'admin@csx.com',
    password: 'admin123',
    name: 'Michael Chen',
    role: 'admin',
    department: 'IT Administration',
  },
]

const AUTH_STORAGE_KEY = 'csx_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    const { password: _, ...userWithoutPassword } = foundUser
    const authenticatedUser: User = {
      ...userWithoutPassword,
      lastLogin: new Date().toISOString(),
    }

    setUser(authenticatedUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
