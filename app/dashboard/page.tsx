"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, BookOpen, TrendingUp, TrendingDown, AlertCircle, Truck, Loader2, Wallet, Receipt } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useDashboard } from "@/hooks/use-dashboard"

const enrollmentData = [
  { month: "Jan", students: 1100 },
  { month: "Feb", students: 1150 },
  { month: "Mar", students: 1180 },
  { month: "Apr", students: 1200 },
  { month: "May", students: 1220 },
  { month: "Jun", students: 1234 },
]

function formatFbu(amount: number) {
  return new Intl.NumberFormat("fr-BI").format(amount) + " Fbu";
}

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

  const studentStats = dashboardData?.students
  const financeStats = dashboardData?.finance

  const statsCards = [
    {
      title: "Total Students",
      value: isDashboardLoading ? null : String(studentStats?.total ?? "—"),
      sub: isDashboardLoading ? null : `${studentStats?.enrolled ?? 0} enrolled · ${studentStats?.inactive ?? 0} inactive`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Invoiced",
      value: isDashboardLoading ? null : formatFbu(financeStats?.total_invoiced ?? 0),
      sub: "All pending & paid",
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Collected",
      value: isDashboardLoading ? null : formatFbu(financeStats?.total_paid ?? 0),
      sub: "Confirmed payments",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Outstanding Balance",
      value: isDashboardLoading ? null : formatFbu(financeStats?.balance ?? 0),
      sub: "Remaining unpaid",
      icon: Wallet,
      color: "text-rose-600",
      bgColor: "bg-rose-500/10",
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Main Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Welcome back, <span className="text-primary font-bold">{user.fullName}</span>. Here is your institutional overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-primary/20 text-primary font-bold">
            <BookOpen className="w-4 h-4 mr-2" />
            Academic Report
          </Button>
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Financial Summary
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="group hover:scale-[1.02] transition-all duration-300 border-none bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{stat.title}</CardTitle>
              <div className={`p-3 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <div className="flex items-center gap-2 h-9">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-2xl font-heading font-bold text-foreground/90 leading-tight">{stat.value}</div>
              )}
              {stat.sub && (
                <p className="text-[11px] text-muted-foreground font-medium mt-2">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Student population growth over the last term</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Finance Overview</CardTitle>
            <CardDescription>Invoiced vs Collected vs Balance (Fbu)</CardDescription>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="flex items-center justify-center h-[320px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={[
                  { name: "Invoiced", amount: financeStats?.total_invoiced ?? 0 },
                  { name: "Collected", amount: financeStats?.total_paid ?? 0 },
                  { name: "Balance", amount: financeStats?.balance ?? 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} tickFormatter={(v) => new Intl.NumberFormat("fr-BI", { notation: "compact" }).format(v)} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(v: number) => [formatFbu(v), "Amount"]}
                  />
                  <Bar dataKey="amount" fill="oklch(var(--primary))" radius={[8, 8, 4, 4]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-xl shadow-primary/5 last-section mt-4 mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Institutional Activity</CardTitle>
            <CardDescription>Real-time updates from all school departments</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-primary rounded-lg">View All Logs</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              { action: "New student enrolled", name: "Sophie Martin", time: "2 hours ago", color: "bg-emerald-500", icon: Users },
              { action: "Payment received", name: "Dubois Family", time: "4 hours ago", color: "bg-amber-500", icon: DollarSign },
              { action: "Grade added", name: "Class 5th A", time: "6 hours ago", color: "bg-indigo-500", icon: BookOpen },
              { action: "Transport scheduled", name: "North Route", time: "8 hours ago", color: "bg-primary", icon: Truck },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${activity.color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <activity.icon className={`w-5 h-5 ${activity.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground/90">{activity.action}</p>
                    <p className="text-sm text-muted-foreground font-medium">{activity.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-tighter">{activity.time}</span>
                  <div className="mt-1 h-1 w-8 bg-muted rounded-full ml-auto group-hover:w-full group-hover:bg-primary/20 transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

