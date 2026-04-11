"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { ClipboardCheck, RefreshCw, GraduationCap } from "lucide-react"

type AcademicYear = {
  id: number
  start_year: number
  end_year: number
  is_current: boolean
}

type CourseTracking = {
  id: number
  student: number
  student_name: string
  course: number
  course_name: string
  academic_year: string
  status: "to_repeat" | "in_progress" | "completed"
}

export default function CourseTrackingPage() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [trackingList, setTrackingList] = useState<CourseTracking[]>([])
  const [loading, setLoading] = useState(false)
  const [scaning, setScaning] = useState(false)

  const fetchInitialData = async () => {
    try {
      const res = await api.get<any>("academics/years/")
      const yearData = Array.isArray(res) ? res : (res as any).results || []
      setYears(yearData)
      const current = yearData.find((y: any) => y.is_current)
      if (current) setSelectedYear(current.id.toString())
    } catch {
      toast.error("Error loading academic years")
    }
  }

  const fetchTracking = async () => {
    if (!selectedYear) return
    setLoading(true)
    try {
      const res = await api.get<any>(`academics/course-tracking/`)
      setTrackingList(Array.isArray(res) ? res : (res as any).results || [])
    } catch {
      toast.error("Error loading tracking list")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoGenerate = async () => {
    if (!selectedYear) return
    setScaning(true)
    try {
      const res = await api.post<any>("academics/course-tracking/auto_generate/", {
        academic_year: selectedYear,
      })
      toast.success(res.message || "Identification complete")
      fetchTracking()
    } catch {
      toast.error("Failed to auto-identify failures")
    } finally {
      setScaning(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`academics/course-tracking/${id}/`, { status })
      toast.success("Status updated")
      fetchTracking()
    } catch {
      toast.error("Update failed")
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedYear) fetchTracking()
  }, [selectedYear])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "to_repeat":
        return <Badge variant="destructive">To Retake</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Identify and track students who need to retake courses (&lt; 50%).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.id} value={y.id.toString()}>
                  {y.start_year}/{y.end_year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAutoGenerate}
            disabled={scaning || !selectedYear}
            className="bg-primary hover:bg-primary/90"
          >
            {scaning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ClipboardCheck className="w-4 h-4 mr-2" />
            )}
            Identify Failures
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List of Courses to Retake</CardTitle>
          <CardDescription>
            Students with an average below 50% for the year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Failed Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : trackingList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No students under tracking for this year.
                    </TableCell>
                  </TableRow>
                ) : (
                  trackingList.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          {item.student_name}
                        </div>
                      </TableCell>
                      <TableCell>{item.course_name}</TableCell>
                      <TableCell>{item.academic_year}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            defaultValue={item.status}
                            onValueChange={(val) => updateStatus(item.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="to_repeat">To Retake</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
