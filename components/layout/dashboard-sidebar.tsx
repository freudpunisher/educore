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
  Bus,
  Map,
  Package,
  ArrowRightLeft,
  BarChart3,
  Utensils,
  Baby,
  Home,
  Users2,
  FileBarChart,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL", "RECEPTIONIST", "ACCOUNTANT", "HR", "DRIVER", "TEACHER", "STUDENT_PARENT", "STUDENT"]
  },
  {
    name: "Academic",
    icon: GraduationCap,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL", "TEACHER", "STUDENT_PARENT", "STUDENT"],
    children: [
      { name: "Academic Year", href: "/dashboard/academics/years", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL"] },
      { name: "Enrollment", href: "/dashboard/academics/enrollment", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "RECEPTIONIST"] },
      { name: "Class", href: "/dashboard/academics/classes", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL"] },
      { name: "Course", href: "/dashboard/academics/courses", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL"] },
      { name: "Grades", href: "/dashboard/academics/grades", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "TEACHER", "STUDENT"] },
    ]
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL", "RECEPTIONIST", "ACCOUNTANT", "TEACHER"]
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: ClipboardCheck,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL", "RECEPTIONIST", "TEACHER", "STUDENT_PARENT", "STUDENT"]
  },
  {
    name: "Finance",
    icon: DollarSign,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "RECEPTIONIST", "ACCOUNTANT", "STUDENT_PARENT"],
    children: [
      { name: "Invoices", href: "/dashboard/finances/invoices", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "RECEPTIONIST", "ACCOUNTANT", "STUDENT_PARENT"] },
      { name: "Payments", href: "/dashboard/finances/payments", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACCOUNTANT", "STUDENT_PARENT"] },
      { name: "Fees", href: "/dashboard/finances/fees", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACCOUNTANT"] },
    ]
  },
  {
    name: "Transport",
    icon: Bus,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "DRIVER"],
    children: [
      { name: "Routes", href: "/dashboard/transport/routes", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "DRIVER"] },
      { name: "Transport Management", href: "/dashboard/transport/management", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Vehicles", href: "/dashboard/transport/vehicles", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Drivers", href: "/dashboard/transport/drivers", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
    ]
  },
  {
    name: "Logistics",
    icon: Package,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"],
    children: [
      { name: "Items", href: "/dashboard/logistics/items", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Stock", href: "/dashboard/logistics/stock", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Stock Movements", href: "/dashboard/logistics/movements", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Inventory", href: "/dashboard/logistics/inventory", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
    ]
  },
  {
    name: "Cafeteria",
    icon: Utensils,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"],
    children: [
      { name: "Restaurant", href: "/dashboard/cafeteria/restaurant", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Staff", href: "/dashboard/cafeteria/staff", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Students", href: "/dashboard/cafeteria/students", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
    ]
  },
  {
    name: "Daycare",
    icon: Baby,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"],
    children: [
      { name: "Services", href: "/dashboard/daycare/services", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Activities", href: "/dashboard/daycare/activities", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
    ]
  },
  {
    name: "Boarding",
    icon: Home,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"],
    children: [
      { name: "Rooms", href: "/dashboard/boarding/rooms", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Occupancy", href: "/dashboard/boarding/occupancy", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
    ]
  },
  {
    name: "Human Resources",
    icon: Users2,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "HR"],
    children: [
      { name: "Staff", href: "/dashboard/hr/staff", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "HR"] },
      { name: "Teachers", href: "/dashboard/teachers", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "HR"] },
      { name: "Support Staff", href: "/dashboard/hr/support-staff", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "HR"] },
      { name: "Drivers", href: "/dashboard/hr/drivers", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "HR"] },
    ]
  },
  {
    name: "Reports",
    icon: FileBarChart,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "DISCIPLINE_PRINCIPAL", "RECEPTIONIST", "ACCOUNTANT", "HR", "TEACHER"],
    children: [
      { name: "Academic Reports", href: "/dashboard/reports/academic", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACADEMIC_PRINCIPAL", "TEACHER"] },
      { name: "Finance Reports", href: "/dashboard/reports/finance", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "ACCOUNTANT"] },
      { name: "Cafeteria Reports", href: "/dashboard/reports/cafeteria", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Transport Reports", href: "/dashboard/reports/transport", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Daycare Reports", href: "/dashboard/reports/daycare", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Boarding Reports", href: "/dashboard/reports/boarding", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "Logistics Reports", href: "/dashboard/reports/logistics", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR"] },
      { name: "HR Reports", href: "/dashboard/reports/hr", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "DIRECTOR", "HR"] },
    ]
  },
  { name: "Class Schedule", href: "/dashboard/timetable", icon: Clock, roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "TEACHER", "STUDENT"] },
  { name: "Announcements & Events", href: "/dashboard/announcements", icon: Megaphone, roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN", "STUDENT_PARENT", "STUDENT"] },
  {
    name: "Settings",
    icon: Settings,
    roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN"],
    children: [
      { name: "School", href: "/dashboard/settings/school", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN"] },
      { name: "Users", href: "/dashboard/settings/users", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN"] },
      { name: "Notifications", href: "/dashboard/settings/notifications", roles: ["GLOBAL_CONTROL", "SYSTEM_ADMIN"] },
    ]
  },
]

function SidebarItem({ item, pathname, collapsed }: { item: any, pathname: string, collapsed: boolean }) {
  const hasActiveChild = item.children?.some((child: any) => pathname === child.href) || false
  const [isExpanded, setIsExpanded] = useState(hasActiveChild)

  useEffect(() => {
    if (hasActiveChild) setIsExpanded(true)
  }, [hasActiveChild])

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => !collapsed && setIsExpanded(!isExpanded)}
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
              const isChildActive = pathname === child.href
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

  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
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
          <SidebarItem key={item.name} item={item} pathname={pathname || ""} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  )
}
