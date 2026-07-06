"use client"

import { useDirectorPedagogy } from "@/hooks/use-director-dashboard"
import { KpiGrid, type KpiCardData } from "@/components/dashboard/kpi-grid"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown, Award, Trophy, Package, AlertTriangle, PackageOpen } from "lucide-react"
import {
  Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts"

interface Props {
  filters?: Record<string, string | number | undefined>
}

export function PedagogyTab({ filters }: Props) {
  const { data, isLoading, error } = useDirectorPedagogy(filters)

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to load pedagogy data.</AlertDescription>
      </Alert>
    )
  }

  if (!data && isLoading) return <LoadingSkeleton />
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>No data</AlertTitle>
        <AlertDescription>No data available.</AlertDescription>
      </Alert>
    )
  }

  // Alerts section (top of tab)
  const { alerts } = data

  // Performance KPIs
  const perfKpis: KpiCardData[] = [
    {
      title: "Best Average",
      value: data.performance.best_average.toFixed(1),
      sub: `Overall average: ${data.performance.overall_average.toFixed(1)}`,
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Lowest Average",
      value: data.performance.lowest_average.toFixed(1),
      sub: "Lowest class average",
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Pass Rate",
      value: `${data.performance.pass_rate.toFixed(1)}%`,
      sub: `${data.performance.fail_rate.toFixed(1)}% fail rate`,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Promotion Rate",
      value: `${data.performance.promotion_rate.toFixed(1)}%`,
      sub: `${data.performance.repetition_rate.toFixed(1)}% repetition · ${data.performance.dropout_rate.toFixed(1)}% dropout`,
      icon: <Trophy className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ]

  const stockKpis: KpiCardData[] = [
    {
      title: "Available Products",
      value: data.stock.available_products,
      sub: "Active references",
      icon: <Package className="w-5 h-5 text-indigo-600" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Low Stock",
      value: data.stock.low_stock,
      sub: "Restocking needed",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Out of Stock",
      value: data.stock.out_of_stock,
      sub: "Unavailable products",
      icon: <PackageOpen className="w-5 h-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Distributions",
      value: data.stock.distributions_in_progress,
      sub: "In progress",
      icon: <Package className="w-5 h-5 text-teal-600" />,
      color: "text-teal-600",
      bgColor: "bg-teal-500/10",
    },
  ]

  const topStudentCols = [
    { key: "name" as const, label: "Name", sortable: true },
    { key: "class_name" as const, label: "Class", sortable: true },
    { key: "average" as const, label: "Average", sortable: true, render: (v: number) => v.toFixed(1) },
  ]
  const topTeacherCols = [
    { key: "name" as const, label: "Teacher", sortable: true },
    { key: "average" as const, label: "Class Avg", sortable: true, render: (v: number) => v.toFixed(1) },
  ]
  const topClassCols = [
    { key: "name" as const, label: "Class", sortable: true },
    { key: "average" as const, label: "Average", sortable: true, render: (v: number) => v.toFixed(1) },
  ]

  return (
    <>
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-heading font-bold text-foreground/80 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Critical Alerts
          </h2>
          <div className="grid gap-2">
            {alerts.map((alert, i) => (
              <Alert key={i} variant={alert.severity === "high" ? "destructive" : "default"}>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle className="capitalize">{alert.type}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Performance Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-heading font-bold text-foreground/80 tracking-tight">
          Academic Performance
        </h2>
        <KpiGrid cards={perfKpis} isLoading={isLoading} />
      </div>

      {/* Score Trend Chart */}
      {data.performance.score_trend.length > 0 && (
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Score Trend by Term</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.performance.score_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                <XAxis dataKey="term" axisLine={false} tickLine={false} className="text-xs font-bold text-muted-foreground" dy={10} />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(v) => [`${Number(v).toFixed(1)}`, "Average"]} />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Rankings */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Students</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topStudentCols}
              data={data.performance.top_students.map((s) => ({ ...s, id: s.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topTeacherCols}
              data={data.performance.top_teachers.map((t) => ({ ...t, id: t.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Top Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topClassCols}
              data={data.performance.top_classes.map((c) => ({ ...c, id: c.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Stock Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-heading font-bold text-foreground/80 tracking-tight">
          Stock Management
        </h2>
        <KpiGrid cards={stockKpis} isLoading={isLoading} />
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
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
    </div>
  )
}
