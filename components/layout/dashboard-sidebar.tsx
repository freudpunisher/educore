"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BookOpen,
  Truck,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ClipboardCheck,
  Clock,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Élèves", href: "/dashboard/students", icon: Users },
  { name: "Présences", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Calendrier", href: "/dashboard/calendar", icon: Calendar },
  { name: "Emploi du temps", href: "/dashboard/timetable", icon: Clock },
  { name: "Annonces", href: "/dashboard/announcements", icon: Megaphone },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { name: "Évaluations", href: "/dashboard/assessments", icon: BookOpen },
  { name: "Pédagogie", href: "/dashboard/pedagogy", icon: BookOpen },
  { name: "Logistique", href: "/dashboard/logistics", icon: Truck },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">École</h2>
              <p className="text-xs text-muted-foreground">2024-2025</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
