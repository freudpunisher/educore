"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "teacher" | "driver" | "parent"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@school.fr": {
    password: "admin123",
    user: {
      id: "1",
      name: "Marie Dubois",
      email: "admin@school.fr",
      role: "admin",
    },
  },
  "teacher@school.fr": {
    password: "teacher123",
    user: {
      id: "2",
      name: "Jean Martin",
      email: "teacher@school.fr",
      role: "teacher",
    },
  },
  "driver@school.fr": {
    password: "driver123",
    user: {
      id: "3",
      name: "Pierre Leroy",
      email: "driver@school.fr",
      role: "driver",
    },
  },
  "parent@school.fr": {
    password: "parent123",
    user: {
      id: "4",
      name: "Sophie Bernard",
      email: "parent@school.fr",
      role: "parent",
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("school_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = MOCK_USERS[email]

    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user)
      localStorage.setItem("school_user", JSON.stringify(mockUser.user))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("school_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
