"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, BookOpen, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user.name}. Here is an overview of your school.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New student enrolled", name: "Sophie Martin", time: "2 hours ago" },
              { action: "Payment received", name: "Dubois Family", time: "4 hours ago" },
              { action: "Grade added", name: "Class 5th A", time: "6 hours ago" },
              { action: "Transport scheduled", name: "North Route", time: "8 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
