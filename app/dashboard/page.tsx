"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, DollarSign, BookOpen, TrendingUp, Truck, Receipt, Wallet, BarChart3, ClipboardList } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useDashboard, DashboardData } from "@/hooks/use-dashboard"
import { KpiGrid, KpiCardData } from "@/components/dashboard/kpi-grid"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { RecentActivity, ActivityItem } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"

const enrollmentData = [
  { month: "Jan", students: 1100 },
  { month: "Feb", students: 1150 },
  { month: "Mar", students: 1180 },
  { month: "Apr", students: 1200 },
  { month: "May", students: 1220 },
  { month: "Jun", students: 1234 },
]

function formatFbu(amount: number | string): string {
  if (typeof amount === 'string') return amount
  return new Intl.NumberFormat("fr-BI").format(amount) + " BIF"
}

// Construire les KPIs dynamiquement selon le rôle
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

  return cards
}

// Données d'activité statiques (peuvent être remplacées par des données dynamiques)
const defaultActivities: ActivityItem[] = [
  { 
    action: "New student enrolled", 
    name: "Sophie Martin", 
    time: "2 hours ago", 
    color: "bg-emerald-500", 
    icon: <Users className="w-5 h-5" /> 
  },
  { 
    action: "Payment received", 
    name: "Dubois Family", 
    time: "4 hours ago", 
    color: "bg-amber-500", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    action: "Grade added", 
    name: "Class 5th A", 
    time: "6 hours ago", 
    color: "bg-indigo-500", 
    icon: <BookOpen className="w-5 h-5" /> 
  },
  { 
    action: "Transport scheduled", 
    name: "North Route", 
    time: "8 hours ago", 
    color: "bg-primary", 
    icon: <Truck className="w-5 h-5" /> 
  },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()

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

  const kpiCards = buildKpiCards(dashboardData, isDashboardLoading)
  const financeStats = dashboardData?.finance

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
        <QuickActions
          actions={[
            {
              label: "Academic Report",
              icon: <BookOpen className="w-4 h-4" />,
              variant: "outline",
            },
            {
              label: "Financial Summary",
              icon: <TrendingUp className="w-4 h-4" />,
              variant: "default",
            },
          ]}
        />
      </div>

      {/* KPI Grid - Dynamic */}
      {kpiCards.length > 0 && (
        <KpiGrid cards={kpiCards} isLoading={isDashboardLoading} />
      )}

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Student population growth over the last term</CardDescription>
          </CardHeader>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="oklch(var(--primary))"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "oklch(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {financeStats && (
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
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={defaultActivities} />
    </div>
  )
}

