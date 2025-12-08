"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardCheck, Download, Search, UserCheck, UserX, Clock, FileCheck } from "lucide-react"
import { mockAttendance } from "@/lib/mock-data"

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedDate, setSelectedDate] = useState("2024-06-24")

  const filteredAttendance = mockAttendance.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.class.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === "all" || record.class === selectedClass
    const matchesDate = record.date === selectedDate
    return matchesSearch && matchesClass && matchesDate
  })

  const todayStats = {
    present: mockAttendance.filter((r) => r.date === selectedDate && r.status === "present").length,
    absent: mockAttendance.filter((r) => r.date === selectedDate && r.status === "absent").length,
    late: mockAttendance.filter((r) => r.date === selectedDate && r.status === "late").length,
    excused: mockAttendance.filter((r) => r.date === selectedDate && r.status === "excused").length,
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
      present: { variant: "default", label: "Présent" },
      absent: { variant: "destructive", label: "Absent" },
      late: { variant: "secondary", label: "Retard" },
      excused: { variant: "outline", label: "Excusé" },
    }
    const config = variants[status] || variants.present
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des présences</h1>
          <p className="text-muted-foreground">Suivi quotidien de la présence des élèves</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Présents</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.present}</div>
            <p className="text-xs text-muted-foreground">élèves présents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserX className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{todayStats.absent}</div>
            <p className="text-xs text-muted-foreground">élèves absents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retards</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.late}</div>
            <p className="text-xs text-muted-foreground">élèves en retard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Excusés</CardTitle>
            <FileCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.excused}</div>
            <p className="text-xs text-muted-foreground">absences justifiées</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Registre de présence
          </CardTitle>
          <CardDescription>Liste des présences pour la date sélectionnée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6ème A">6ème A</SelectItem>
                <SelectItem value="6ème B">6ème B</SelectItem>
                <SelectItem value="5ème A">5ème A</SelectItem>
                <SelectItem value="5ème B">5ème B</SelectItem>
                <SelectItem value="4ème A">4ème A</SelectItem>
                <SelectItem value="4ème B">4ème B</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{record.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
