"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { API_ENDPOINTS } from "./api-config"

export type Department =
  | "ACADEMIC"
  | "FINANCE"
  | "TRANSPORT"
  | "LOGISTIQUE"
  | "RESTAURATION"
  | "DAYCARE"
  | "INTERNAT"

export type UserRole =
  | "GLOBAL_CONTROL"
  | "SYSTEM_ADMIN"
  | "DIRECTOR"
  | "ACADEMIC_PRINCIPAL"
  | "DISCIPLINE_PRINCIPAL"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "HR"
  | "DRIVER"
  | "TEACHER"
  | "STUDENT_PARENT"
  | "STUDENT"
  | "NONE"

export const ROLE_DEPARTMENT_MAP: Record<UserRole, Department> = {
  GLOBAL_CONTROL: "ACADEMIC",
  SYSTEM_ADMIN: "ACADEMIC",
  DIRECTOR: "ACADEMIC",
  ACADEMIC_PRINCIPAL: "ACADEMIC",
  DISCIPLINE_PRINCIPAL: "ACADEMIC",
  RECEPTIONIST: "ACADEMIC",
  ACCOUNTANT: "FINANCE",
  HR: "ACADEMIC",
  DRIVER: "TRANSPORT",
  TEACHER: "ACADEMIC",
  STUDENT_PARENT: "ACADEMIC",
  STUDENT: "ACADEMIC",
  NONE: "ACADEMIC",
}

export const ROLES_BY_DEPARTMENT: Record<Department, { label: string; value: UserRole }[]> = {
  ACADEMIC: [
    { label: "Global Control", value: "GLOBAL_CONTROL" },
    { label: "System Admin", value: "SYSTEM_ADMIN" },
    { label: "Director", value: "DIRECTOR" },
    { label: "Academic Principal", value: "ACADEMIC_PRINCIPAL" },
    { label: "Discipline Principal", value: "DISCIPLINE_PRINCIPAL" },
    { label: "Receptionist", value: "RECEPTIONIST" },
    { label: "HR", value: "HR" },
    { label: "Teacher", value: "TEACHER" },
    { label: "Student Parent", value: "STUDENT_PARENT" },
    { label: "Student", value: "STUDENT" },
    { label: "None", value: "NONE" },
  ],
  FINANCE: [
    { label: "Accountant", value: "ACCOUNTANT" },
  ],
  TRANSPORT: [
    { label: "Driver", value: "DRIVER" },
  ],
  LOGISTIQUE: [],
  RESTAURATION: [],
  DAYCARE: [],
  INTERNAT: [],
}

interface User {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  department: Department
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user and tokens on mount
    const storedUser = localStorage.getItem("school_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      // Save tokens
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)

      // Map API user to internal User type
      const apiResponseUser = data.user
      const appUser: User = {
        id: apiResponseUser.user_id || "1",
        name: `${apiResponseUser.user.first_name} ${apiResponseUser.user.last_name}`.trim() || apiResponseUser.user.username,
        username: apiResponseUser.user.username,
        email: apiResponseUser.user.email,
        role: apiResponseUser.role as UserRole,
        department: ROLE_DEPARTMENT_MAP[apiResponseUser.role as UserRole] || "ACADEMIC",
      }

      setUser(appUser)
      localStorage.setItem("school_user", JSON.stringify(appUser))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("school_user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
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
