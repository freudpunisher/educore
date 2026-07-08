"use client"

import { useDirectorOverview } from "@/hooks/use-director-dashboard"
import { KpiGrid, type KpiCardData } from "@/components/dashboard/kpi-grid"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, BookOpen, GraduationCap, Building2, BookText, Heart, UserCheck } from "lucide-react"
import {
  Bar, BarChart, Line, LineChart, Pie, PieChart, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts"

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"]

interface Props {
  filters?: Record<string, string | number | undefined>
}

export function OverviewTab({ filters }: Props) {
  const { data, isLoading, error } = useDirectorOverview(filters)

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to load data. Please try again.</AlertDescription>
      </Alert>
    )
  }

  if (!data && isLoading) {
    return <LoadingSkeleton />
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>No data</AlertTitle>
        <AlertDescription>No data available for the selected period.</AlertDescription>
      </Alert>
    )
  }

  const kpis: KpiCardData[] = [
    {
      title: "Total Students",
      value: data.kpis.total_students,
      sub: `Overseen by ${data.kpis.total_teachers} teachers`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Teachers",
      value: data.kpis.total_teachers,
      sub: `+ ${data.kpis.total_staff} admin staff`,
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Active Classes",
      value: data.kpis.active_classes,
      sub: `${data.kpis.occupied_rooms} available seats`,
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Subjects",
      value: data.kpis.total_subjects,
      sub: `${data.kpis.total_parents} registered parents`,
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ]

  const enrollmentColumns = [
    { key: "student_name" as const, label: "Name", sortable: true },
    { key: "class_name" as const, label: "Class", sortable: true },
    { key: "date" as const, label: "Date", sortable: true },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "validated" ? "default" : "secondary"}>
          {value === "validated" ? "Validated" : "Pending"}
        </Badge>
      ),
    },
  ]

  const activityColumns = [
    { key: "user" as const, label: "User", sortable: true },
    { key: "action" as const, label: "Action", sortable: true },
    { key: "module" as const, label: "Module", sortable: true },
    { key: "time" as const, label: "Date", sortable: true },
  ]

  const genderLabelMap: Record<string, string> = {
    Hommes: "Male",
    Femmes: "Female",
  }
  const genderData = Object.entries(data.student_distribution.by_gender).map(([name, value]) => ({
    name: genderLabelMap[name] || name,
    value,
  }))

  const levelData = Object.entries(data.student_distribution.by_level).map(([name, value]) => ({
    name,
    value,
  }))

  const ageData = Object.entries(data.student_distribution.by_age_range).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <>
      {/* KPIs */}
      <KpiGrid cards={kpis} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrollment Trend */}
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Trend</CardTitle>
            <CardDescription>Per month (January - December)</CardDescription>
          </CardHeader>
          <CardContent>
            {data.enrollment_trend.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.enrollment_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Gender Distribution</CardTitle>
            <CardDescription>Male / Female ratio</CardDescription>
          </CardHeader>
          <CardContent>
            {genderData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">By Level</CardTitle>
          </CardHeader>
          <CardContent>
            {levelData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={levelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis type="number" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" width={100} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#3b82f6">
                    {levelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">By Age Range</CardTitle>
          </CardHeader>
          <CardContent>
            {ageData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={enrollmentColumns}
              data={data.recent_enrollments.map((e) => ({ ...e, id: e.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={activityColumns}
              data={data.recent_activities.map((a) => ({ ...a, id: a.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-none">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-none">
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/30 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
