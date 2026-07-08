"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import { MODULE_ACCESS, type ModuleName } from "@/constants/menu-access"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Users, DollarSign, BookOpen, TrendingUp, Truck, Receipt,
  Wallet, BarChart3, ClipboardList, ClipboardCheck, Bus, Home, UtensilsCrossed, Baby,
  Building2, UserPlus, FileText, Download, Package,
} from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { useDashboard, DashboardData } from "@/hooks/use-dashboard"
import { useRecentEnrollments } from "@/hooks/use-academic-data"
import { KpiGrid, KpiCardData } from "@/components/dashboard/kpi-grid"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { RecentActivity, ActivityItem } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"

type ChartConfig = {
  title: string
  description: string
  data: { month: string; value: number }[]
}

const MODULE_CHARTS: Partial<Record<ModuleName, ChartConfig>> = {
  Students: {
    title: "Enrollment Trends",
    description: "Student population growth over the last term",
    data: [
      { month: "Jan", value: 1100 }, { month: "Feb", value: 1150 },
      { month: "Mar", value: 1180 }, { month: "Apr", value: 1200 },
      { month: "May", value: 1220 }, { month: "Jun", value: 1234 },
    ],
  },
  Attendance: {
    title: "Attendance Overview",
    description: "Monthly attendance records",
    data: [
      { month: "Jan", value: 980 }, { month: "Feb", value: 1020 },
      { month: "Mar", value: 1050 }, { month: "Apr", value: 1100 },
      { month: "May", value: 1080 }, { month: "Jun", value: 1120 },
    ],
  },
  Finances: {
    title: "Revenue Trends",
    description: "Monthly invoiced amounts (BIF)",
    data: [
      { month: "Jan", value: 8500000 }, { month: "Feb", value: 9200000 },
      { month: "Mar", value: 8800000 }, { month: "Apr", value: 10500000 },
      { month: "May", value: 11200000 }, { month: "Jun", value: 9800000 },
    ],
  },
  Employees: {
    title: "Staff Growth",
    description: "Active personnel over time",
    data: [
      { month: "Jan", value: 45 }, { month: "Feb", value: 48 },
      { month: "Mar", value: 50 }, { month: "Apr", value: 52 },
      { month: "May", value: 55 }, { month: "Jun", value: 58 },
    ],
  },
  Transport: {
    title: "Transport Usage",
    description: "Students using transport services",
    data: [
      { month: "Jan", value: 320 }, { month: "Feb", value: 340 },
      { month: "Mar", value: 355 }, { month: "Apr", value: 370 },
      { month: "May", value: 385 }, { month: "Jun", value: 400 },
    ],
  },
  Restaurant: {
    title: "Meal Service Trends",
    description: "Daily meals served per month",
    data: [
      { month: "Jan", value: 2400 }, { month: "Feb", value: 2550 },
      { month: "Mar", value: 2600 }, { month: "Apr", value: 2700 },
      { month: "May", value: 2750 }, { month: "Jun", value: 2800 },
    ],
  },
  Daycare: {
    title: "Daycare Attendance",
    description: "Children attending daycare per month",
    data: [
      { month: "Jan", value: 85 }, { month: "Feb", value: 90 },
      { month: "Mar", value: 92 }, { month: "Apr", value: 95 },
      { month: "May", value: 98 }, { month: "Jun", value: 100 },
    ],
  },
  Boarding: {
    title: "Boarding Occupancy",
    description: "Students in boarding per month",
    data: [
      { month: "Jan", value: 150 }, { month: "Feb", value: 155 },
      { month: "Mar", value: 160 }, { month: "Apr", value: 158 },
      { month: "May", value: 162 }, { month: "Jun", value: 165 },
    ],
  },
  Storage: {
    title: "Inventory Trends",
    description: "Stock entries over the last term",
    data: [
      { month: "Jan", value: 45 }, { month: "Feb", value: 52 },
      { month: "Mar", value: 38 }, { month: "Apr", value: 60 },
      { month: "May", value: 55 }, { month: "Jun", value: 48 },
    ],
  },
  Pedagogy: {
    title: "Assessment Trends",
    description: "Assessment distribution across terms",
    data: [
      { month: "Jan", value: 85 }, { month: "Feb", value: 92 },
      { month: "Mar", value: 78 }, { month: "Apr", value: 95 },
      { month: "May", value: 88 }, { month: "Jun", value: 90 },
    ],
  },
}

const MODULE_DATA_FIELDS: Partial<Record<ModuleName, keyof DashboardData>> = {
  Students: "students",
  Finances: "finance",
  Transport: "transport",
  Boarding: "boarding",
  Daycare: "daycare",
  Restaurant: "restaurant",
  Attendance: "attendance",
  Employees: "staff",
  Storage: "storage",
  Pedagogy: "assessments",
}

function getAccessibleModules(role: string): ModuleName[] {
  return (Object.entries(MODULE_ACCESS) as [ModuleName, string[] | null][])
    .filter(([, roles]) => roles === null || roles.includes(role))
    .map(([module]) => module)
}

function getRoleCharts(role: string | undefined, dashboardData: DashboardData | undefined): ChartConfig[] {
  if (!role) return []
  const modules = getAccessibleModules(role)

  return modules
    .filter((m) => {
      const field = MODULE_DATA_FIELDS[m]
      return !field || dashboardData?.[field] !== undefined
    })
    .map((m) => MODULE_CHARTS[m])
    .filter((c): c is ChartConfig => c !== undefined)
}

function formatFbu(amount: number | string): string {
  if (typeof amount === 'string') return amount
  return new Intl.NumberFormat("fr-BI").format(amount) + " BIF"
}

function buildKpiCards(dashboardData: DashboardData | undefined, isDashboardLoading: boolean): KpiCardData[] {
  if (!dashboardData) {
    return []
  }

  const cards: KpiCardData[] = []

  if (dashboardData.students) {
    cards.push({
      title: "Total Students",
      value: isDashboardLoading ? null : String(dashboardData.students?.total ?? "—"),
      sub: `${dashboardData.students?.enrolled ?? 0} enrolled · ${dashboardData.students?.inactive ?? 0} inactive`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    })
  }

  if (dashboardData.transport) {
    const t = dashboardData.transport
    cards.push({
      title: "Transport",
      value: isDashboardLoading ? null : String(t.total_students ?? "—"),
      sub: `${t.total_vehicles ?? 0} vehicles · ${t.total_drivers ?? 0} drivers · ${t.total_itineraries ?? 0} routes`,
      icon: <Bus className="w-5 h-5 text-orange-600" />,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    })
  }

  if (dashboardData.boarding) {
    const b = dashboardData.boarding
    cards.push({
      title: "Boarding",
      value: isDashboardLoading ? null : String(b.total_students ?? "—"),
      sub: `${b.total_rooms ?? 0} rooms · ${b.occupied_beds ?? 0}/${b.total_beds ?? 0} beds occupied`,
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    })
  }

  if (dashboardData.daycare) {
    const d = dashboardData.daycare
    cards.push({
      title: "Daycare",
      value: isDashboardLoading ? null : String(d.total_children ?? "—"),
      sub: `${d.total_records ?? 0} records`,
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
    })
  }

  if (dashboardData.restaurant) {
    const r = dashboardData.restaurant
    cards.push({
      title: "Restaurant",
      value: isDashboardLoading ? null : String(r.total_subscribers ?? "—"),
      sub: `${r.total_meals_served ?? 0} meals served`,
      icon: <UtensilsCrossed className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    })
  }

  if (dashboardData.finance) {
    cards.push(
      {
        title: "Total Invoiced",
        value: isDashboardLoading ? null : formatFbu(dashboardData.finance?.total_invoiced ?? 0),
        sub: "All pending & paid",
        icon: <Receipt className="w-5 h-5 text-purple-600" />,
        color: "text-purple-600",
        bgColor: "bg-purple-500/10",
      },
      {
        title: "Total Collected",
        value: isDashboardLoading ? null : formatFbu(dashboardData.finance?.total_paid ?? 0),
        sub: "Confirmed payments",
        icon: <DollarSign className="w-5 h-5 text-green-600" />,
        color: "text-green-600",
        bgColor: "bg-green-500/10",
      },
      {
        title: "Outstanding Balance",
        value: isDashboardLoading ? null : formatFbu(dashboardData.finance?.balance ?? 0),
        sub: "Remaining unpaid",
        icon: <Wallet className="w-5 h-5 text-rose-600" />,
        color: "text-rose-600",
        bgColor: "bg-rose-500/10",
      }
    )
  }

  if (dashboardData.assessments) {
    cards.push({
      title: "Total Assessments",
      value: isDashboardLoading ? null : dashboardData.assessments?.total ?? 0,
      sub: "All assessments",
      icon: <ClipboardList className="w-5 h-5 text-indigo-600" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    })
  }

  if (dashboardData.attendance) {
    cards.push({
      title: "Attendance Records",
      value: isDashboardLoading ? null : dashboardData.attendance?.total_records ?? 0,
      sub: "Total recorded",
      icon: <BarChart3 className="w-5 h-5 text-cyan-600" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
    })
  }

  if (dashboardData.staff) {
    cards.push({
      title: "Total Staff",
      value: isDashboardLoading ? null : dashboardData.staff?.total ?? 0,
      sub: "Active personnel",
      icon: <Users className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    })
  }

  if (dashboardData.users) {
    cards.push({
      title: "Total Users",
      value: isDashboardLoading ? null : dashboardData.users?.total ?? 0,
      sub: "System accounts",
      icon: <Users className="w-5 h-5 text-teal-600" />,
      color: "text-teal-600",
      bgColor: "bg-teal-500/10",
    })
  }

  if (dashboardData.storage) {
    const s = dashboardData.storage
    cards.push({
      title: "Inventory",
      value: isDashboardLoading ? null : String(s.total_products ?? "—"),
      sub: `${s.total_stock_entries ?? 0} stock entries`,
      icon: <Package className="w-5 h-5 text-emerald-600" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    })
  }

  return cards
}

const defaultActivities: ActivityItem[] = [
  { action: "New student enrolled", name: "Sophie Martin", time: "2 hours ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
  { action: "Payment received", name: "Dubois Family", time: "4 hours ago", color: "bg-amber-500", icon: <DollarSign className="w-5 h-5" /> },
  { action: "Grade added", name: "Class 5th A", time: "6 hours ago", color: "bg-indigo-500", icon: <BookOpen className="w-5 h-5" /> },
  { action: "Transport scheduled", name: "North Route", time: "8 hours ago", color: "bg-primary", icon: <Truck className="w-5 h-5" /> },
]

function getRoleBasedActivities(role: string | undefined): ActivityItem[] {
  if (!role) return defaultActivities

  const activities: Record<string, ActivityItem[]> = {
    ACADEMIC: [
      { action: "New student enrolled", name: "Sophie Martin", time: "2 hours ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Grade submitted", name: "Class 5th A - Mathematics", time: "3 hours ago", color: "bg-indigo-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Course updated", name: "Science Curriculum v2", time: "5 hours ago", color: "bg-blue-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Schedule modified", name: "4th B - Class section", time: "7 hours ago", color: "bg-primary", icon: <Users className="w-5 h-5" /> },
    ],
    DISCIPLINE: [
      { action: "Attendance recorded", name: "Class 3rd A - 28/30 present", time: "2 hours ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Incident reported", name: "Class 5th B - Minor infraction", time: "4 hours ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Discipline review", name: "Weekly behavior summary", time: "6 hours ago", color: "bg-indigo-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Parent meeting", name: "M. Dubois - Scheduled", time: "8 hours ago", color: "bg-primary", icon: <Users className="w-5 h-5" /> },
    ],
    FINANCE: [
      { action: "Payment received", name: "Dubois Family - 250,000 BIF", time: "1 hour ago", color: "bg-emerald-500", icon: <DollarSign className="w-5 h-5" /> },
      { action: "Invoice generated", name: "Martin Family - Term 3", time: "3 hours ago", color: "bg-amber-500", icon: <Receipt className="w-5 h-5" /> },
      { action: "Overdue reminder", name: "5 unpaid invoices pending", time: "4 hours ago", color: "bg-red-500", icon: <Wallet className="w-5 h-5" /> },
      { action: "Expense recorded", name: "School supplies - 50,000 BIF", time: "6 hours ago", color: "bg-purple-500", icon: <TrendingUp className="w-5 h-5" /> },
    ],
    HR: [
      { action: "New hire onboarded", name: "Marie Claire - Teacher", time: "1 day ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Leave approved", name: "Jean Pascal - 3 days", time: "2 days ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Contract renewed", name: "5 staff contracts updated", time: "3 days ago", color: "bg-indigo-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Payroll processed", name: "Monthly salaries - March", time: "5 days ago", color: "bg-primary", icon: <DollarSign className="w-5 h-5" /> },
    ],
    DIRECTOR: [
      { action: "New student enrolled", name: "Sophie Martin", time: "2 hours ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Payment received", name: "Dubois Family - 250,000 BIF", time: "3 hours ago", color: "bg-amber-500", icon: <DollarSign className="w-5 h-5" /> },
      { action: "Attendance summary", name: "95% attendance rate this week", time: "4 hours ago", color: "bg-indigo-500", icon: <ClipboardCheck className="w-5 h-5" /> },
      { action: "Meal service report", name: "450 lunches served today", time: "5 hours ago", color: "bg-emerald-500", icon: <UtensilsCrossed className="w-5 h-5" /> },
      { action: "Transport update", name: "North Route - Schedule change", time: "6 hours ago", color: "bg-blue-500", icon: <Truck className="w-5 h-5" /> },
      { action: "Staff onboarded", name: "2 new teachers hired", time: "7 hours ago", color: "bg-purple-500", icon: <UserPlus className="w-5 h-5" /> },
      { action: "Grade submitted", name: "Class 5th A - Midterms", time: "8 hours ago", color: "bg-indigo-500", icon: <BookOpen className="w-5 h-5" /> },
    ],
    SUPER_ADMIN: [
      { action: "System backup", name: "Daily backup completed", time: "1 hour ago", color: "bg-emerald-500", icon: <TrendingUp className="w-5 h-5" /> },
      { action: "User account created", name: "New teacher account", time: "3 hours ago", color: "bg-amber-500", icon: <Users className="w-5 h-5" /> },
      { action: "Configuration change", name: "Academic year updated", time: "5 hours ago", color: "bg-indigo-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Audit log review", name: "Weekly security check", time: "7 hours ago", color: "bg-primary", icon: <BarChart3 className="w-5 h-5" /> },
    ],
    TEACHER: [
      { action: "Grade submitted", name: "Class 5th A - Mathematics", time: "1 hour ago", color: "bg-emerald-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Attendance taken", name: "Class 3rd B - 25/27 present", time: "3 hours ago", color: "bg-amber-500", icon: <Users className="w-5 h-5" /> },
      { action: "Lesson plan updated", name: "Week 12 - Science", time: "5 hours ago", color: "bg-indigo-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Assessment created", name: "Mid-term exam - Physics", time: "7 hours ago", color: "bg-primary", icon: <TrendingUp className="w-5 h-5" /> },
    ],
    TRANSPORTER: [
      { action: "Route completed", name: "North Route - On time", time: "1 hour ago", color: "bg-emerald-500", icon: <Truck className="w-5 h-5" /> },
      { action: "Vehicle maintenance", name: "Bus #12 - Oil change", time: "3 hours ago", color: "bg-amber-500", icon: <Bus className="w-5 h-5" /> },
      { action: "Driver assigned", name: "Pierre N. - South Route", time: "5 hours ago", color: "bg-indigo-500", icon: <Users className="w-5 h-5" /> },
      { action: "Itinerary updated", name: "East Route - New stop", time: "7 hours ago", color: "bg-primary", icon: <TrendingUp className="w-5 h-5" /> },
    ],
    RESTAURANT: [
      { action: "Meals prepared", name: "450 lunches served today", time: "2 hours ago", color: "bg-emerald-500", icon: <UtensilsCrossed className="w-5 h-5" /> },
      { action: "Menu updated", name: "Next week's menu posted", time: "4 hours ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Subscription renewed", name: "15 new meal subscriptions", time: "6 hours ago", color: "bg-indigo-500", icon: <Users className="w-5 h-5" /> },
      { action: "Inventory restocked", name: "Kitchen supplies delivered", time: "8 hours ago", color: "bg-primary", icon: <TrendingUp className="w-5 h-5" /> },
    ],
    DAYCARE: [
      { action: "Child checked in", name: "Lucas M. - 08:15 AM", time: "2 hours ago", color: "bg-emerald-500", icon: <Baby className="w-5 h-5" /> },
      { action: "Child checked out", name: "Emma K. - 04:30 PM", time: "1 hour ago", color: "bg-amber-500", icon: <Baby className="w-5 h-5" /> },
      { action: "Activity report", name: "Daily activities summary", time: "3 hours ago", color: "bg-indigo-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "New enrollment", name: "Child registered for daycare", time: "5 hours ago", color: "bg-primary", icon: <Users className="w-5 h-5" /> },
    ],
    BOARDING: [
      { action: "Student checked in", name: "Dormitory A - 2 new arrivals", time: "2 hours ago", color: "bg-emerald-500", icon: <Building2 className="w-5 h-5" /> },
      { action: "Room inspection", name: "Dormitory B - All clear", time: "4 hours ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Bed assigned", name: "Room 12 - Bed 4 assigned", time: "6 hours ago", color: "bg-indigo-500", icon: <Users className="w-5 h-5" /> },
      { action: "Maintenance request", name: "Room 8 - Light fixture", time: "8 hours ago", color: "bg-primary", icon: <Home className="w-5 h-5" /> },
    ],
    STORAGE: [
      { action: "Stock received", name: "School supplies - 50 units", time: "2 hours ago", color: "bg-emerald-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Inventory count", name: "Weekly stock verification", time: "4 hours ago", color: "bg-amber-500", icon: <BarChart3 className="w-5 h-5" /> },
      { action: "Item dispatched", name: "Science lab - 10 kits", time: "6 hours ago", color: "bg-indigo-500", icon: <TrendingUp className="w-5 h-5" /> },
      { action: "Reorder alert", name: "Printer paper - Low stock", time: "8 hours ago", color: "bg-primary", icon: <Wallet className="w-5 h-5" /> },
    ],
    STUDENT: [
      { action: "Grade published", name: "Mathematics - 85%", time: "2 hours ago", color: "bg-emerald-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Class scheduled", name: "Science - Tomorrow 10 AM", time: "4 hours ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Assignment due", name: "History essay - Next Friday", time: "6 hours ago", color: "bg-indigo-500", icon: <TrendingUp className="w-5 h-5" /> },
      { action: "Attendance recorded", name: "Present - All classes", time: "8 hours ago", color: "bg-primary", icon: <Users className="w-5 h-5" /> },
    ],
    PARENT: [
      { action: "Grade published", name: "Sophie - Mathematics 85%", time: "2 hours ago", color: "bg-emerald-500", icon: <BookOpen className="w-5 h-5" /> },
      { action: "Payment reminder", name: "Tuition fee - Term 3", time: "4 hours ago", color: "bg-amber-500", icon: <DollarSign className="w-5 h-5" /> },
      { action: "Attendance report", name: "Sophie - All present this week", time: "6 hours ago", color: "bg-indigo-500", icon: <Users className="w-5 h-5" /> },
      { action: "School event", name: "Parent-teacher meeting - Friday", time: "8 hours ago", color: "bg-primary", icon: <ClipboardList className="w-5 h-5" /> },
    ],
    RECEPTIONIST: [
      { action: "New student enrolled", name: "Marie Claire - Grade 3", time: "1 hour ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Student registered", name: "Jean Baptiste - Grade 5", time: "2 hours ago", color: "bg-amber-500", icon: <UserPlus className="w-5 h-5" /> },
      { action: "Enrollment completed", name: "Sophie Martin - Grade 2", time: "4 hours ago", color: "bg-indigo-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Student file updated", name: "Pierre Nkurunziza", time: "6 hours ago", color: "bg-primary", icon: <FileText className="w-5 h-5" /> },
    ],
    BODY_CONTROL: [
      { action: "Audit report generated", name: "Finance review - March", time: "2 hours ago", color: "bg-emerald-500", icon: <BarChart3 className="w-5 h-5" /> },
      { action: "Compliance check", name: "Transport regulations - Passed", time: "4 hours ago", color: "bg-amber-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Data verification", name: "Student records - 100% accurate", time: "6 hours ago", color: "bg-indigo-500", icon: <Users className="w-5 h-5" /> },
      { action: "Institutional review", name: "Quarterly performance report", time: "8 hours ago", color: "bg-primary", icon: <TrendingUp className="w-5 h-5" /> },
    ],
    receptionist: [
      { action: "New student enrolled", name: "Marie Claire - Grade 3", time: "1 hour ago", color: "bg-emerald-500", icon: <Users className="w-5 h-5" /> },
      { action: "Student registered", name: "Jean Baptiste - Grade 5", time: "2 hours ago", color: "bg-amber-500", icon: <UserPlus className="w-5 h-5" /> },
      { action: "Enrollment completed", name: "Sophie Martin - Grade 2", time: "4 hours ago", color: "bg-indigo-500", icon: <ClipboardList className="w-5 h-5" /> },
      { action: "Student file updated", name: "Pierre Nkurunziza", time: "6 hours ago", color: "bg-primary", icon: <FileText className="w-5 h-5" /> },
    ],
  }

  return activities[role] ?? defaultActivities
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined)
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard(academicYearId)

  const isBodyControl = user?.role === "body_control"

  // Auto-select current academic year
  useEffect(() => {
    if (dashboardData?.academic_years && !academicYearId) {
      const current = dashboardData.academic_years.find((y) => y.is_current)
      if (current) setAcademicYearId(current.id)
    }
  }, [dashboardData?.academic_years, academicYearId])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center group">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-primary/10" />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    )
  }

  const isReceptionist = user?.role === "receptionist"
  const isDirector = user?.role === "director"
  const { data: recentEnrollments } = useRecentEnrollments(5, { enabled: isReceptionist })

  const handleExport = useCallback(async (format: "csv" | "pdf") => {
    try {
      const params = new URLSearchParams({ format })
      if (academicYearId) params.set("academic_year_id", String(academicYearId))
      const response = await axiosInstance.get(`core/dashboard-stats/export/?${params}`, { responseType: "blob" })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`)
    }
  }, [academicYearId])

  const kpiCards = buildKpiCards(dashboardData, isDashboardLoading)
  const financeStats = dashboardData?.finance
  const financeByTerm = dashboardData?.finance_by_term
  const roleCharts = getRoleCharts(user?.role, dashboardData)
  const chartConfig = roleCharts.length > 0 ? roleCharts[0] : null

  const defaultActivities = getRoleBasedActivities(dashboardData?.role)
  const activities: ActivityItem[] = isReceptionist && recentEnrollments
    ? recentEnrollments.map((e) => ({
        action: "New student enrolled",
        name: `${e.student_name}${e.class_room_detail ? ` - ${e.class_room_detail.name}` : ""}`,
        time: e.date_enrolled
          ? formatDistanceToNow(new Date(e.date_enrolled), { addSuffix: true })
          : "Recently",
        color: "bg-emerald-500",
        icon: <UserPlus className="w-5 h-5" />,
      }))
    : defaultActivities

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Welcome back, <span className="text-primary font-bold">{user.fullName}</span>. Here is your overview.
          </p>
          {dashboardData?.role && (
            <p className="text-xs font-medium text-primary/70 mt-1 uppercase tracking-widest">
              Role: {dashboardData.role}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {dashboardData?.academic_years && dashboardData.academic_years.length > 0 && (
            <Select
              value={academicYearId?.toString() ?? ""}
              onValueChange={(v) => setAcademicYearId(Number(v))}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Academic year" />
              </SelectTrigger>
              <SelectContent>
                {dashboardData.academic_years.map((y) => (
                  <SelectItem key={y.id} value={y.id.toString()}>
                    {y.label}{y.is_current ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="w-4 h-4 mr-2" />Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="w-4 h-4 mr-2" />Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <QuickActions
            actions={[
              {
                label: "Academic Report",
                icon: <BookOpen className="w-4 h-4" />,
                variant: "outline",
                href: "/dashboard/reports",
              },
              {
                label: "Financial Summary",
                icon: <TrendingUp className="w-4 h-4" />,
                variant: "default",
                href: "/dashboard/finances",
              },
            ]}
          />
        </div>
      </div>

      {/* KPI Grid - Dynamic */}
      {kpiCards.length > 0 && (
        <KpiGrid cards={kpiCards} isLoading={isDashboardLoading} />
      )}

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        {isBodyControl && financeByTerm && financeByTerm.length > 0 && (
          <Card className="border-none shadow-xl shadow-primary/5 md:col-span-2">
            <CardHeader>
              <CardTitle>Finance by Trimester</CardTitle>
              <CardDescription>
                Invoiced, paid, and balance per term — {dashboardData?.selected_academic_year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={financeByTerm}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="term_name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} tickFormatter={(v) => new Intl.NumberFormat("fr-BI", { notation: "compact" }).format(v)} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: any) => [formatFbu(value), ""]}
                  />
                  <Legend />
                  <Bar dataKey="total_invoiced" name="Invoiced" fill="oklch(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="total_paid" name="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="balance" name="Balance" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {isDirector ? (
          roleCharts.map((chart, i) => (
            <Card key={i} className="border-none shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>{chart.title}</CardTitle>
                <CardDescription>{chart.description}</CardDescription>
              </CardHeader>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(var(--primary))"
                      strokeWidth={4}
                      dot={{ r: 6, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: "oklch(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ))
        ) : chartConfig ? (
          <Card className="border-none shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle>{chartConfig.title}</CardTitle>
              <CardDescription>{chartConfig.description}</CardDescription>
            </CardHeader>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartConfig.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(var(--primary))"
                    strokeWidth={4}
                    dot={{ r: 6, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "oklch(var(--accent))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : null}

        {financeStats && !isBodyControl && !isDirector && (
          <DashboardChart
            title="Finance Overview"
            description="Invoiced vs Collected vs Balance (BIF)"
            data={[
              { name: "Invoiced", amount: financeStats?.total_invoiced ?? 0 },
              { name: "Collected", amount: financeStats?.total_paid ?? 0 },
              { name: "Balance", amount: financeStats?.balance ?? 0 },
            ]}
            isLoading={isDashboardLoading}
            formatter={formatFbu}
          />
        )}
        {isBodyControl && financeStats && (
          <DashboardChart
            title="Finance Overview"
            description="Overall invoiced vs collected vs balance (BIF)"
            data={[
              { name: "Invoiced", amount: financeStats?.total_invoiced ?? 0 },
              { name: "Collected", amount: financeStats?.total_paid ?? 0 },
              { name: "Balance", amount: financeStats?.balance ?? 0 },
            ]}
            isLoading={isDashboardLoading}
            formatter={formatFbu}
          />
        )}
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  )
}

