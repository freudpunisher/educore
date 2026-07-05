"use client"

import { useDirectorSchoolLife } from "@/hooks/use-director-dashboard"
import { KpiGrid, type KpiCardData } from "@/components/dashboard/kpi-grid"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, ShieldAlert, Bus, UtensilsCrossed, UserCheck, UserX, Clock } from "lucide-react"
import {
  Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts"

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"]

interface Props {
  filters?: Record<string, string | number | undefined>
}

export function SchoolLifeTab({ filters }: Props) {
  const { data, isLoading, error } = useDirectorSchoolLife(filters)

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Impossible de charger les données de vie scolaire.</AlertDescription>
      </Alert>
    )
  }

  if (!data && isLoading) return <LoadingSkeleton />
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Aucune donnée</AlertTitle>
        <AlertDescription>Aucune donnée disponible.</AlertDescription>
      </Alert>
    )
  }

  const attendanceKpis: KpiCardData[] = [
    {
      title: "Élèves Présents (J)",
      value: `${data.attendance.present.count}`,
      sub: `${data.attendance.present.percent}% de présence`,
      icon: <UserCheck className="w-5 h-5 text-green-600" />,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Absents",
      value: `${data.attendance.absent.count}`,
      sub: `${data.attendance.absent.percent}% d'absence`,
      icon: <UserX className="w-5 h-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Retards",
      value: `${data.attendance.late.count}`,
      sub: `${data.attendance.late.percent}% de retard`,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Enseignants",
      value: `${data.attendance.teachers_present} Présents`,
      sub: `${data.attendance.teachers_absent} Absents · ${data.attendance.staff_absent} Personnel absent`,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
  ]

  const disciplineKpis: KpiCardData[] = [
    {
      title: "Incidents",
      value: data.discipline.incidents,
      sub: "Signalés",
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Sanctions",
      value: data.discipline.sanctions,
      sub: "En cours",
      icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Avertissements",
      value: data.discipline.warnings,
      sub: "Niveau 1",
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Bus Disponibles",
      value: `${data.logistics.available_buses}/${data.logistics.available_buses + data.logistics.broken_buses}`,
      sub: `${data.logistics.broken_buses} en panne · ${data.logistics.students_transported} élèves transportés`,
      icon: <Bus className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
  ]

  const studentPie = [
    { name: "Présents", value: data.attendance_chart.students.present },
    { name: "Absents", value: data.attendance_chart.students.absent },
    { name: "Retards", value: data.attendance_chart.students.late },
  ]
  const teacherPie = [
    { name: "Présents", value: data.attendance_chart.teachers.present },
    { name: "Absents", value: data.attendance_chart.teachers.absent },
  ]

  const absenceColumns = [
    { key: "student_name" as const, label: "Élève", sortable: true },
    { key: "class_name" as const, label: "Classe", sortable: true },
    { key: "absence_count" as const, label: "Absences (7j)", sortable: true },
  ]

  const sanctionColumns = [
    { key: "student_name" as const, label: "Élève", sortable: true },
    { key: "reason" as const, label: "Motif", sortable: true },
    { key: "points" as const, label: "Points" },
    { key: "date" as const, label: "Date", sortable: true },
    {
      key: "status" as const,
      label: "Statut",
      render: (v: string) => (
        <Badge variant={v === "recorded" ? "destructive" : "secondary"}>
          {v === "recorded" ? "Enregistré" : v}
        </Badge>
      ),
    },
  ]

  return (
    <>
      {/* Section Présence */}
      <div className="space-y-2">
        <h2 className="text-lg font-heading font-bold text-foreground/80 tracking-tight">Présence du Jour</h2>
        <KpiGrid cards={attendanceKpis} isLoading={isLoading} />
      </div>

      {/* Section Discipline & Logistique */}
      <div className="space-y-2">
        <h2 className="text-lg font-heading font-bold text-foreground/80 tracking-tight">Discipline & Logistique</h2>
        <KpiGrid cards={disciplineKpis} isLoading={isLoading} />
      </div>

      {/* Attendance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Taux de Présence - Élèves</CardTitle>
          </CardHeader>
          <CardContent>
            {studentPie.every((d) => d.value === 0) ? (
              <p className="text-muted-foreground text-sm text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={studentPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {studentPie.map((_, i) => (
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

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Présence Enseignants</CardTitle>
          </CardHeader>
          <CardContent>
            {teacherPie.every((d) => d.value === 0) ? (
              <p className="text-muted-foreground text-sm text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={teacherPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {teacherPie.map((_, i) => (
                      <Cell key={i} fill={[COLORS[0], COLORS[1]][i]} />
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

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Absences Critiques (3+ / semaine)</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={absenceColumns}
              data={data.critical_absences.map((a) => ({ ...a, id: a.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Sanctions Lourdes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={sanctionColumns}
              data={data.heavy_sanctions.map((s) => ({ ...s, id: s.id }))}
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
