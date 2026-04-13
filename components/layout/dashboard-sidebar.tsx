"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  UserPlus,
  ChevronDown,
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
  Receipt,
  ShieldAlert,
  UtensilsCrossed,
  Package,
  Home,
  Baby,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

type NavItem = {
  name: string
  href?: string
  icon: any
  roles?: string[]
  children?: {
    name: string
    href: string
    roles?: string[]
  }[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Behavior", href: "/dashboard/behavior", icon: ShieldAlert },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Timetable", href: "/dashboard/timetable", icon: Clock },
  { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  {
    name: "Finances",
    icon: DollarSign,
    children: [
      { name: "Overview", href: "/dashboard/finances" },
      { name: "Invoices", href: "/dashboard/finances/invoices" },
      { name: "Payments", href: "/dashboard/finances/payments" },
    ]
  },
  { name: "Pedagogy", href: "/dashboard/pedagogy", icon: BookOpen },

  { name: "Course Tracking", href: "/dashboard/academics/tracking", icon: ClipboardCheck },


  { name: "Logistics", href: "/dashboard/logistics", icon: Truck },
  { name: "Transport", href: "/dashboard/transport", icon: Truck },
  { name: "Restaurant", href: "/dashboard/canteen", icon: UtensilsCrossed },
  { name: "Storage", href: "/dashboard/store", icon: Package },
  { name: "Boarding", href: "/dashboard/boarding", icon: Home },
  { name: "Daycare", href: "/dashboard/daycare", icon: Baby },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

function SidebarItem({
  item,
  pathname,
  collapsed,
  expandedMenu,
  setExpandedMenu
}: {
  item: any,
  pathname: string,
  collapsed: boolean,
  expandedMenu: string | null,
  setExpandedMenu: (s: string | null) => void
}) {
  const isRouteActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/dashboard" || href === "/dashboard/finances") return false; // Prevent index routes from matching deep routes
    return pathname.startsWith(href + "/");
  }

  const hasActiveChild = item.children?.some((child: any) => isRouteActive(child.href)) || false
  const isExpanded = expandedMenu === item.name

  useEffect(() => {
    if (hasActiveChild && expandedMenu === null) {
      setExpandedMenu(item.name)
    }
  }, [hasActiveChild, expandedMenu, setExpandedMenu, item.name])

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => !collapsed && setExpandedMenu(isExpanded ? null : item.name)}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
            hasActiveChild && !isExpanded
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", hasActiveChild && "text-primary")} />
          {!collapsed && (
            <>
              <span className="font-semibold text-[15px] flex-1 text-left">{item.name}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
            </>
          )}
        </button>
        {isExpanded && !collapsed && (
          <div className="ml-9 border-l border-border/50 pl-4 space-y-1 py-1">
            {item.children.map((child: any) => {
              const isChildActive = isRouteActive(child.href)
              return (
                <Link
                  key={child.name}
                  href={child.href}
                  className={cn(
                    "flex items-center py-2 px-3 rounded-lg text-sm transition-all",
                    isChildActive
                      ? "text-primary font-bold bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {child.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const isActive = isRouteActive(item.href)
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive && "text-primary-foreground")} />
      {!collapsed && <span className="font-semibold text-[15px]">{item.name}</span>}
      {isActive && !collapsed && (
        <div className="absolute right-4 w-1.5 h-1.5 bg-primary-foreground rounded-full" />
      )}
    </Link>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const filteredNavigation = navigation
    .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => !child.roles || (user?.role && child.roles.includes(user.role))
          ),
        }
      }
      return item
    })
    .filter((item) => !item.children || item.children.length > 0 || item.href)

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-xl z-20",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <GraduationCap className="w-7 h-7 text-primary-foreground -rotate-3" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">EduCore</h2>
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest leading-none mt-1">Discovery School</p>
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

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => (
          <SidebarItem
            key={item.name}
            item={item}
            pathname={pathname || ""}
            collapsed={collapsed}
            expandedMenu={expandedMenu}
            setExpandedMenu={setExpandedMenu}
          />
        ))}
      </nav>
    </aside>
  )
}
