"use client"

import { Bell, Search, User, Moon, Sun, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-provider"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      directeur: "Directeur",
      prefet_etudes: "Préfet des Études",
      daf: "DAF",
      comptable: "Comptable",
      gestion_transport: "Transport Mgr",
      gestion_logistique: "Logistics Mgr",
      gestion_restauration: "Restaurateur",
      gestion_daycare: "Daycare Mgr",
      gestion_internat: "Internat Mgr",
    }
    return labels[role] || (role.charAt(0).toUpperCase() + role.slice(1).replace("_", " "))
  }

  return (
    <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Search students, staff or finances..."
            className="pl-12 bg-muted/50 border-transparent hover:bg-muted focus:bg-background transition-all h-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-muted/50 p-1 rounded-xl gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg h-9 w-9">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="relative rounded-lg h-9 w-9">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive border-2 border-background rounded-full" />
          </Button>
        </div>

        <div className="h-8 w-px bg-border/50 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 gap-3 px-2 hover:bg-muted/50 transition-all rounded-xl">
              <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-foreground/90">{user?.name || "User"}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80">{user ? getRoleLabel(user.role) : ""}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl mt-2 animate-in fade-in zoom-in-95">
            <DropdownMenuLabel className="font-heading text-lg px-3 py-2">Account Management</DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <Link href="/dashboard/profile">
              <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="text-destructive font-semibold cursor-pointer rounded-lg px-3 py-2.5 gap-3 hover:bg-destructive/10" onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
