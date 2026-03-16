"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, AlertCircle, ChevronRight, Lock, Mail } from "lucide-react"
import { useAuth, type UserRole, type Department, ROLES_BY_DEPARTMENT } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [department, setDepartment] = useState<Department>("ACADEMIC")
  const [role, setRole] = useState<UserRole>("SYSTEM_ADMIN")
  const { login } = useAuth()
  const router = useRouter()

  const handleDepartmentChange = (value: string) => {
    const newDept = value as Department
    setDepartment(newDept)
    // Set first role of the department as default
    if (ROLES_BY_DEPARTMENT[newDept].length > 0) {
      setRole(ROLES_BY_DEPARTMENT[newDept][0].value)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(username, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Incorrect credentials. Please check your email and password.")
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-[2rem] shadow-2xl shadow-primary/20 mb-4 rotate-3 group transition-transform hover:rotate-0 duration-500">
          <GraduationCap className="w-10 h-10 text-primary-foreground -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">EDUCORE</h1>
        <p className="text-muted-foreground font-medium">Discovery School Burundi • Institutional Portal</p>
      </div>

      <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl overflow-hidden rounded-[2rem]">
        <CardHeader className="p-8 pb-0 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Service / Dept</Label>
              <Select value={department} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full bg-muted/50 border-transparent rounded-xl h-11">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="LOGISTIQUE">Logistique</SelectItem>
                  <SelectItem value="RESTAURATION">Restauration</SelectItem>
                  <SelectItem value="DAYCARE">Daycare</SelectItem>
                  <SelectItem value="INTERNAT">Internat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">User Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="w-full bg-muted/50 border-transparent rounded-xl h-11">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_BY_DEPARTMENT[department].map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5 animate-in shake duration-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-bold text-foreground/70 ml-1">Username</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-12 h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-bold text-foreground/70">Password</Label>
                  <Button variant="link" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 h-auto p-0" type="button">
                    Forgot?
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 group" disabled={isLoading}>
              {isLoading ? "Authenticating..." : (
                <>
                  Connect as {ROLES_BY_DEPARTMENT[department].find(r => r.value === role)?.label || role}
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground/60 font-medium">
              By signing in, you agree to our Terms of Service <br /> and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Protected by EDUCORE Security System &copy; 2024
        </p>
      </div>
    </div>
  )
}
