"use client"

import { useParams, useRouter } from "next/navigation"
import { useEnrollments, useCourses, useGrades } from "@/hooks/use-pedagogy"
import { useClassRoom, useAcademicYears } from "@/hooks/use-academic-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Award,
  ClipboardList,
} from "lucide-react"
import { useState, useMemo } from "react"
import Link from "next/link"

function GradeLetterBadge({ percentage }: { percentage: number | null | undefined }) {
  if (percentage == null) return <span className="text-muted-foreground">-</span>

  const pct = Number(percentage)
  let letter = "F"
  let colorClass = "bg-red-100 text-red-800 border-red-200"

  if (pct >= 90) { letter = "A"; colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200" }
  else if (pct >= 80) { letter = "B"; colorClass = "bg-blue-100 text-blue-800 border-blue-200" }
  else if (pct >= 70) { letter = "C"; colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200" }
  else if (pct >= 60) { letter = "D"; colorClass = "bg-orange-100 text-orange-800 border-orange-200" }

  return (
    <Badge variant="outline" className={`font-bold ${colorClass}`}>
      {letter} — {pct.toFixed(1)}%
    </Badge>
  )
}

export default function StudentClassGradesPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const enrollmentId = params.enrollmentId as string

  const [selectedYear, setSelectedYear] = useState<string>("")

  const { data: years } = useAcademicYears()
  const { data: classItem, isLoading: loadingClass } = useClassRoom(classId)

  const academicYearId = selectedYear && selectedYear !== "all" ? parseInt(selectedYear) : undefined

  // Get this specific enrollment
  const { data: enrollmentData, isLoading: loadingEnrollment } = useEnrollments(parseInt(classId), academicYearId)
  const enrollment = enrollmentData?.results?.find((e: any) => e.id === parseInt(enrollmentId))

  // Get all courses for this class
  const { data: courseData } = useCourses(parseInt(classId), academicYearId)
  const courses = courseData?.results || []

  // Get all grades for this enrollment
  const { data: gradesData, isLoading: loadingGrades } = useGrades(parseInt(enrollmentId), academicYearId)
  const grades = gradesData?.results || []

  // Group grades by course (via assessment_display which contains course info)
  const gradesByCourse = useMemo(() => {
    const map: Record<number, any[]> = {}
    for (const course of courses) {
      map[course.id] = []
    }
    for (const grade of grades) {
      // grades are linked to assessments which belong to courses
      // We match via assessment_display or group all together if no course breakdown
      const key = 0 // fallback grouping
      if (!map[key]) map[key] = []
      map[key].push(grade)
    }
    return map
  }, [grades, courses])

  // Compute overall stats
  const stats = useMemo(() => {
    if (grades.length === 0) return { average: null, total: 0, passed: 0, failed: 0 }
    const withPct = grades.filter((g: any) => g.percentage != null)
    const avg = withPct.length > 0
      ? withPct.reduce((sum: number, g: any) => sum + Number(g.percentage), 0) / withPct.length
      : null
    const passed = withPct.filter((g: any) => Number(g.percentage) >= 50).length
    const failed = withPct.length - passed
    return { average: avg, total: grades.length, passed, failed }
  }, [grades])

  const isLoading = loadingClass || loadingEnrollment

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  const studentName = enrollment?.student_name || `Student #${enrollmentId}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/dashboard/pedagogy/class/${classId}`)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{studentName}</h1>
            <p className="text-muted-foreground mt-0.5">
              Grades report —{" "}
              <Link
                href={`/dashboard/pedagogy/class/${classId}`}
                className="text-primary hover:underline"
              >
                {classItem?.name}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Academic Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Academic Years</SelectItem>
              {years?.map((year: any) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.start_year}-{year.end_year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Average</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.average != null ? `${stats.average.toFixed(1)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Grades</CardTitle>
            <ClipboardList className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
            <Award className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.passed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            <BookOpen className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGrades ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No grades recorded for this student yet.</p>
              <p className="text-sm mt-1">Grades will appear here once assessments are evaluated.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade: any) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {grade.assessment_display}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{grade.score}</span>
                      </TableCell>
                      <TableCell>
                        <GradeLetterBadge percentage={grade.percentage} />
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[240px] truncate">
                        {grade.comment || <span className="italic text-sm">No comment</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
