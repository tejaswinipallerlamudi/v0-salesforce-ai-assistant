'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserRole } from '@/types'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  department?: string
  lastLogin?: string
  createdAt?: string
}

export interface UserWithPassword extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  users: UserWithPassword[]
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  addUser: (user: Omit<UserWithPassword, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>
  updateUser: (id: string, updates: Partial<UserWithPassword>) => Promise<{ success: boolean; error?: string }>
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users for the application
const DEFAULT_USERS: UserWithPassword[] = [
  {
    id: 'user-001',
    username: 'intern',
    password: 'intern',
    name: 'Alex Johnson',
    role: 'intern',
    department: 'Customer Support',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'lead',
    password: 'tl',
    name: 'Sarah Mitchell',
    role: 'lead',
    department: 'Project Management',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'admin',
    password: 'admin',
    name: 'Michael Chen',
    role: 'admin',
    department: 'IT Administration',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

const AUTH_STORAGE_KEY = 'csx_auth_user'
const USERS_STORAGE_KEY = 'csx_users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<UserWithPassword[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load users and check for existing session on mount
  useEffect(() => {
    // Load users from storage or use defaults
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers))
      } catch {
        setUsers(DEFAULT_USERS)
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      }
    } else {
      setUsers(DEFAULT_USERS)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
    }

    // Check for existing session
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

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get latest users from storage
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    const currentUsers: UserWithPassword[] = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS

    const foundUser = currentUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid username or password' }
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

  const addUser = async (newUser: Omit<UserWithPassword, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return { success: false, error: 'Username already exists' }
    }

    const userToAdd: UserWithPassword = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, userToAdd]
    setUsers(updatedUsers)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

    return { success: true }
  }

  const updateUser = async (id: string, updates: Partial<UserWithPassword>): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Check if new username conflicts with existing user
    if (updates.username) {
      const conflict = users.find(
        (u) => u.id !== id && u.username.toLowerCase() === updates.username!.toLowerCase()
      )
      if (conflict) {
        return { success: false, error: 'Username already exists' }
      }
    }

    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u))
    setUsers(updatedUsers)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

    return { success: true }
  }

  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Prevent deleting the currently logged-in user
    if (user?.id === id) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    // Ensure at least one admin remains
    const userToDelete = users.find((u) => u.id === id)
    if (userToDelete?.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin account' }
      }
    }

    const updatedUsers = users.filter((u) => u.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
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
