"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, BookOpen, TrendingUp, TrendingDown, AlertCircle, Truck } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const statsData = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Monthly Revenue",
    value: "€45,231",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Active Courses",
    value: "89",
    change: "+3%",
    trend: "up",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Attendance Rate",
    value: "94.2%",
    change: "-2%",
    trend: "down",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const enrollmentData = [
  { month: "Jan", students: 1100 },
  { month: "Feb", students: 1150 },
  { month: "Mar", students: 1180 },
  { month: "Apr", students: 1200 },
  { month: "May", students: 1220 },
  { month: "Jun", students: 1234 },
]

const revenueData = [
  { month: "Jan", revenue: 38000 },
  { month: "Feb", revenue: 40000 },
  { month: "Mar", revenue: 42000 },
  { month: "Apr", revenue: 43000 },
  { month: "May", revenue: 44000 },
  { month: "Jun", revenue: 45231 },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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
        {statsData.map((stat) => (
          <Card key={stat.title} className="group hover:scale-[1.02] transition-all duration-300 border-none bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{stat.title}</CardTitle>
              <div className={`p-3 rounded-2xl ${stat.bgColor.replace('100', '20')} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-foreground/90">{stat.value}</div>
              <div className="flex items-center gap-2 mt-4 bg-muted/50 w-fit px-2 py-1 rounded-lg">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <span className={`text-xs font-bold ${stat.trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                  {stat.change}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">vs last month</span>
              </div>
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
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Financial collection performance in EUR</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="oklch(var(--accent))" radius={[8, 8, 4, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
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
