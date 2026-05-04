"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen, GraduationCap, Calendar, Loader2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useClassRooms, useAcademicYears } from "@/hooks/use-academic-data"
import { useCourses, useGrades, useAssessments, useReportCards, useGenerateReportCards, useDownloadReportCardPDF } from "@/hooks/use-pedagogy"
import { useMemo, useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CreateGradeDialog } from "@/components/pedagogy/create-grade-dialog"
import { CreateAssessmentDialog } from "@/components/pedagogy/create-assessment-dialog"
import { FileText, Download, Play, CheckCircle, ClipboardList, ChevronLeft, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function PedagogyPage() {
  const { data: yearsData, isLoading: yearsLoading } = useAcademicYears()
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined)

  const academicYears = yearsData?.results || yearsData || []

  useEffect(() => {
    if (academicYears.length > 0 && selectedYearId === undefined) {
      const currentYear = academicYears.find((y: any) => y.is_current)
      if (currentYear) setSelectedYearId(currentYear.id)
      else setSelectedYearId(academicYears[0].id)
    }
  }, [academicYears, selectedYearId])

  const [coursePage, setCoursePage] = useState(1)
  const [assessmentPage, setAssessmentPage] = useState(1)
  const [gradePage, setGradePage] = useState(1)
  const [reportPage, setReportPage] = useState(1)

  const [classSearch, setClassSearch] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [assessmentSearch, setAssessmentSearch] = useState("")
  const [gradeSearch, setGradeSearch] = useState("")
  const [reportSearch, setReportSearch] = useState("")

  const { data: classData, isLoading: classLoading } = useClassRooms(classSearch)
  const { data: courseData, isLoading: courseLoading } = useCourses(undefined, selectedYearId, coursePage, courseSearch)
  const { data: gradeData, isLoading: gradeLoading } = useGrades(selectedYearId, gradePage, gradeSearch)
  const { data: assessmentData, isLoading: assessmentLoading } = useAssessments(selectedYearId, assessmentPage, assessmentSearch)
  const { data: reportCardData, isLoading: reportCardLoading } = useReportCards(selectedYearId, reportPage, reportSearch)
  const generateMutation = useGenerateReportCards()
  const downloadMutation = useDownloadReportCardPDF()

  const [isCreateGradeOpen, setIsCreateGradeOpen] = useState(false)
  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false)

  const classes = classData || []
  const courses = courseData?.results || []
  const grades = gradeData?.results || []
  const assessments = assessmentData?.results || []
  const reportCards = reportCardData?.results || []

  const totalClasses = classes.length || 0
  const totalCourses = courseData?.count || 0
  const totalStudents = 0 // Needs enrollment count in the future

  const averageGPA = useMemo(() => {
    if (grades.length === 0) return "0.0"
    const sum = grades.reduce((acc, g) => acc + parseFloat(g.gpa_points || "0"), 0)
    return (sum / grades.length).toFixed(1)
  }, [grades])

  const distribution = useMemo(() => {
    const dist: Record<string, number> = { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 }
    grades.forEach(g => {
        if (g.letter_grade && dist[g.letter_grade] !== undefined) {
            dist[g.letter_grade]++
        }
    })
    return Object.keys(dist).map(key => ({ range: key, count: dist[key] }))
  }, [grades])

  const handleGenerateReportCards = async () => {
    // For demo/simplicity, we'll assume there's a term 1. In a real app, we'd have a term selector.
    // We'll generate for all enrollments in the current academic year.
    try {
        await generateMutation.mutateAsync({ term: 1 })
        toast.success("Report cards generated successfully!")
    } catch (error: any) {
        toast.error("Failed to generate report cards. Please ensure terms are created.")
    }
  }

  const handleDownloadPdf = async (reportId: number) => {
    try {
      const blob = await downloadMutation.mutateAsync(reportId)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `report_card_${reportId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  const isLoading = classLoading || courseLoading || gradeLoading || reportCardLoading || assessmentLoading

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-bold animate-pulse">Loading pedagogical data...</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedagogy</h1>
          <p className="text-muted-foreground mt-1">Manage classes, courses, and student grades</p>
        </div>
        <div className="flex gap-4">
          <Select
            disabled={yearsLoading}
            value={selectedYearId?.toString()}
            onValueChange={(val) => setSelectedYearId(parseInt(val))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year: any) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.name || `${year.start_year}-${year.end_year}`}
                  {year.is_current && " (Current)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalStudents} students total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">All levels combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <GraduationCap className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGPA}/4.0</div>
            <p className="text-xs text-muted-foreground mt-1">All subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evaluations</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="reports">Report Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Classrooms</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search classes..."
                  className="pl-8 h-9"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls: any) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{cls.code}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/pedagogy/class/${cls.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course List</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 h-9"
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setCoursePage(1);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.teacher_name || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.credits} Credits</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination for Courses */}
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoursePage(p => Math.max(1, p - 1))}
                    disabled={!courseData?.previous}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center justify-center min-w-[80px]">
                    Page {coursePage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoursePage(p => p + 1)}
                    disabled={!courseData?.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== ASSESSMENTS TAB ========== */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assessments</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Create quizzes, tests and exams before recording grades</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search assessments..."
                    className="pl-8 h-9"
                    value={assessmentSearch}
                    onChange={(e) => {
                      setAssessmentSearch(e.target.value);
                      setAssessmentPage(1);
                    }}
                  />
                </div>
                <Button size="sm" onClick={() => setIsCreateAssessmentOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Max Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ClipboardList className="w-8 h-8" />
                            <p className="font-medium">No assessments yet</p>
                            <p className="text-sm">Create an assessment first, then record grades for students.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assessments.map((ast) => (
                        <TableRow key={ast.id}>
                          <TableCell className="font-medium">{ast.title}</TableCell>
                          <TableCell>{ast.course_display || "—"}</TableCell>
                          <TableCell>{ast.term_display || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ast.assessment_type_label || "—"}</Badge>
                          </TableCell>
                          <TableCell>{ast.max_score} pts</TableCell>
                          <TableCell>{ast.date ? new Date(ast.date).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination for Assessments */}
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssessmentPage(p => Math.max(1, p - 1))}
                    disabled={!assessmentData?.previous}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center justify-center min-w-[80px]">
                    Page {assessmentPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssessmentPage(p => p + 1)}
                    disabled={!assessmentData?.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== GRADES TAB ========== */}
        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Grades</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search grades..."
                    className="pl-8 h-9"
                    value={gradeSearch}
                    onChange={(e) => {
                      setGradeSearch(e.target.value);
                      setGradePage(1);
                    }}
                  />
                </div>
                <Button size="sm" onClick={() => setIsCreateGradeOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Letter Grade</TableHead>
                      <TableHead>GPA Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student_name}</TableCell>
                        <TableCell>{grade.assessment_display}</TableCell>
                        <TableCell>
                          <span className="font-bold">
                            {parseFloat(grade.score).toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={grade.letter_grade === 'F' ? 'destructive' : 'default'}>
                            {grade.letter_grade || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(grade.gpa_points || "0").toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination for Grades */}
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGradePage(p => Math.max(1, p - 1))}
                    disabled={!gradeData?.previous}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center justify-center min-w-[80px]">
                    Page {gradePage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGradePage(p => p + 1)}
                    disabled={!gradeData?.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Report Cards</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">GPA and academic transcripts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reports..."
                    className="pl-8 h-9"
                    value={reportSearch}
                    onChange={(e) => {
                      setReportSearch(e.target.value);
                      setReportPage(1);
                    }}
                  />
                </div>
                <Button size="sm" onClick={handleGenerateReportCards} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Generate for Term 1
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Term GPA</TableHead>
                      <TableHead>Cumulative GPA</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No report cards generated yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportCards.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.enrollment_detail?.student_name || "Student"}
                          </TableCell>
                          <TableCell>{report.term_display}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {report.data?.gpa?.term?.toFixed(2) || "0.00"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {report.data?.gpa?.cumulative?.toFixed(2) || "0.00"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="text-red-600 font-medium">{report.data?.attendance?.absences || 0} Abs</span>
                            <span className="mx-2 text-muted-foreground">|</span>
                            <span className="text-orange-600 font-medium">{report.data?.attendance?.lates || 0} Late</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(report.id)} disabled={downloadMutation.isPending}>
                              {downloadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination for Report Cards */}
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportPage(p => Math.max(1, p - 1))}
                    disabled={!reportCardData?.previous}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center justify-center min-w-[80px]">
                    Page {reportPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportPage(p => p + 1)}
                    disabled={!reportCardData?.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CreateGradeDialog 
        isOpen={isCreateGradeOpen} 
        onClose={() => setIsCreateGradeOpen(false)} 
      />

      <CreateAssessmentDialog
        isOpen={isCreateAssessmentOpen}
        onClose={() => setIsCreateAssessmentOpen(false)}
      />
    </div>
  )
}
