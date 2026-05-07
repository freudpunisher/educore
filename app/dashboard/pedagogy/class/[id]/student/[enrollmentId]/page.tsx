"use client"

import { useParams, useRouter } from "next/navigation"
import { useGrades, useAssessments, useCourses, useEnrollments } from "@/hooks/use-pedagogy"
import { useClassRoom } from "@/hooks/use-academic-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Loader2, 
  ChevronLeft, 
  User, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Mail,
  Phone,
  Calendar
} from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function StudentAcademicDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const enrollmentId = params.enrollmentId as string

  const { data: classItem } = useClassRoom(classId)
  const { data: enrollmentsData, isLoading: loadingEnrollment } = useEnrollments(parseInt(classId))
  const { data: gradesData, isLoading: loadingGrades } = useGrades(parseInt(enrollmentId))
  const { data: coursesData } = useCourses(parseInt(classId))

  const enrollment = useMemo(() => 
    enrollmentsData?.results?.find((e: any) => e.id === parseInt(enrollmentId)),
    [enrollmentsData, enrollmentId]
  )

  const grades = gradesData?.results || []
  const courses = coursesData?.results || []

  // Group grades by course
  const gradesByCourse = useMemo(() => {
    const grouped: Record<number, any[]> = {}
    grades.forEach(g => {
      if (!grouped[g.course]) grouped[g.course] = []
      grouped[g.course].push(g)
    })
    return grouped
  }, [grades])

  // Calculate course averages
  const courseAverages = useMemo(() => {
    return courses.map(course => {
      const courseGrades = gradesByCourse[course.id] || []
      const avg = courseGrades.length > 0 
        ? courseGrades.reduce((acc, g) => acc + parseFloat(g.score), 0) / courseGrades.length 
        : 0
      return { ...course, average: avg, grades: courseGrades }
    })
  }, [courses, gradesByCourse])

  const overallAverage = useMemo(() => {
    const gradedCourses = courseAverages.filter(c => c.grades.length > 0)
    if (gradedCourses.length === 0) return 0
    return gradedCourses.reduce((acc, c) => acc + c.average, 0) / gradedCourses.length
  }, [courseAverages])

  if (loadingEnrollment || loadingGrades) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Student not found</h2>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const isHighSchool = classItem?.level === "high"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {enrollment.student_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{enrollment.student_name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Badge variant="secondary" className="font-mono">{enrollment.enrollment_number}</Badge>
                <span>•</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {classItem?.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Card className="shadow-none border-primary/20 bg-primary/5 px-6 py-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Overall Average</div>
            <div className="text-3xl font-black text-primary">{overallAverage.toFixed(1)}%</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Summary & Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Rank in Class
                </div>
                <span className="font-bold"># -</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Credits Earned
                </div>
                <span className="font-bold">0 / 0</span>
              </div>
              {isHighSchool && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                    Cumulative GPA
                  </div>
                  <span className="font-bold text-indigo-700">-</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>student@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+XXX XXXXXXXX</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Enrolled: {new Date(enrollment.date_enrolled).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Grades per Course */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Course-wise Performance
          </h2>
          
          {courseAverages.map(course => (
            <Card key={course.id} className="overflow-hidden border-muted/60">
              <CardHeader className="bg-muted/10 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{course.code}</Badge>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-muted-foreground uppercase">Average</div>
                    <div className={cn(
                      "text-xl font-bold",
                      course.average < 50 ? "text-red-500" : "text-primary"
                    )}>
                      {course.average.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/5">
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Max</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead>Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.grades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic text-sm">
                          No grades recorded yet for this subject.
                        </TableCell>
                      </TableRow>
                    ) : course.grades.map((grade: any) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.assessment_display || `Assessment #${grade.assessment}`}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {grade.date ? new Date(grade.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          <span className={cn(parseFloat(grade.score) < 50 ? "text-red-500" : "")}>
                            {grade.score}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{grade.max_score || 100}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={parseFloat(grade.score) < 50 ? "destructive" : "secondary"} className="font-mono">
                            {((parseFloat(grade.score) / (grade.max_score || 100)) * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {grade.comment || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
