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
      present: { variant: "default", label: "Present" },
      absent: { variant: "destructive", label: "Absent" },
      late: { variant: "secondary", label: "Late" },
      excused: { variant: "outline", label: "Excused" },
    }
    const config = variants[status] || variants.present
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">Daily tracking of student attendance</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.present}</div>
            <p className="text-xs text-muted-foreground">students present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{todayStats.absent}</div>
            <p className="text-xs text-muted-foreground">students absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.late}</div>
            <p className="text-xs text-muted-foreground">students late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
            <FileCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.excused}</div>
            <p className="text-xs text-muted-foreground">justified absences</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Attendance Register
          </CardTitle>
          <CardDescription>Attendance list for the selected date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                <SelectItem value="6th A">6th A</SelectItem>
                <SelectItem value="6th B">6th B</SelectItem>
                <SelectItem value="5th A">5th A</SelectItem>
                <SelectItem value="5th B">5th B</SelectItem>
                <SelectItem value="4th A">4th A</SelectItem>
                <SelectItem value="4th B">4th B</SelectItem>
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
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString("en-US")}</TableCell>
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
