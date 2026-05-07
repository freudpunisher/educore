"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Loader2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  LayoutDashboard,
  Filter,
  MoreVertical,
  Play
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useClassRooms, useAcademicYears, useClassRoom } from "@/hooks/use-academic-data"
import { 
  useCourses, 
  useGrades, 
  useAssessments, 
  useReportCards, 
  useGenerateReportCards,
  useDownloadReportCardPDF, 
  useTerms, 
  useEnrollments 
} from "@/hooks/use-pedagogy"
import { useMemo, useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CreateAssessmentDialog } from "@/components/pedagogy/create-assessment-dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function PedagogyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: yearsData, isLoading: yearsLoading } = useAcademicYears()
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined)
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined)
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined)
  const [classSearch, setClassSearch] = useState("")

  const academicYears = yearsData || []

  // Initialize selectedYearId with current academic year
  useEffect(() => {
    if (academicYears.length > 0 && selectedYearId === undefined) {
      const currentYear = academicYears.find((y: any) => y.is_current)
      if (currentYear) setSelectedYearId(currentYear.id)
      else setSelectedYearId(academicYears[0].id)
    }
  }, [academicYears, selectedYearId])

  // Data fetching
  const { data: classrooms = [], isLoading: classroomsLoading } = useClassRooms(classSearch)
  const { data: selectedClass, isLoading: selectedClassLoading } = useClassRoom(selectedClassId || "")
  
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments(selectedClassId, selectedYearId)
  const { data: coursesData, isLoading: coursesLoading } = useCourses(selectedClassId, selectedYearId)
  const { data: gradesData, isLoading: gradesLoading } = useGrades(undefined, selectedYearId) // We fetch grades for the year, we'll filter by enrollment
  const { data: terms = [] } = useTerms(selectedYearId)
  const generateMutation = useGenerateReportCards()
  const downloadMutation = useDownloadReportCardPDF()

  const enrollments = enrollmentsData?.results || []
  const courses = coursesData?.results || []
  const allGrades = gradesData?.results || []

  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false)
  const [activeCourseForAssessment, setActiveCourseForAssessment] = useState<number | undefined>(undefined)

  // Auto-select class if teacher has only one
  useEffect(() => {
    if (user?.role === "teacher" && classrooms.length === 1 && !selectedClassId) {
      setSelectedClassId(classrooms[0].id)
    }
  }, [user, classrooms, selectedClassId])

  // Compute Stats for the selected class
  const classStats = useMemo(() => {
    if (!selectedClassId || enrollments.length === 0) return null

    // Map grades by enrollment and course
    const gradesByEnrollment: Record<number, Record<number, any>> = {}
    allGrades.forEach(g => {
      if (!gradesByEnrollment[g.enrollment]) gradesByEnrollment[g.enrollment] = {}
      // We assume one grade per course/enrollment for simplicity in this dashboard view 
      // (usually it would be the average of assessments in that course)
      // Actually, if we have multiple grades for same course, we take average
      gradesByEnrollment[g.enrollment][g.course!] = g
    })

    const studentAverages = enrollments.map(enr => {
      const studentGrades = Object.values(gradesByEnrollment[enr.id] || {})
      const sum = studentGrades.reduce((acc, g) => acc + parseFloat(g.score), 0)
      const count = studentGrades.length
      const avg = count > 0 ? sum / count : 0
      
      // Calculate GPA and Letter based on avg if High School
      let letter = "F"
      let gpa = 0
      if (avg >= 90) { letter = "A"; gpa = 4.0 }
      else if (avg >= 80) { letter = "B"; gpa = 3.0 }
      else if (avg >= 70) { letter = "C"; gpa = 2.0 }
      else if (avg >= 60) { letter = "D"; gpa = 1.0 }

      return {
        ...enr,
        average: avg,
        letter,
        gpa,
        grades: gradesByEnrollment[enr.id] || {}
      }
    })

    const classAverage = studentAverages.length > 0 
      ? studentAverages.reduce((acc, s) => acc + s.average, 0) / studentAverages.length 
      : 0

    return {
      studentAverages,
      classAverage: classAverage.toFixed(1),
      totalStudents: enrollments.length,
      totalCourses: courses.length
    }
  }, [selectedClassId, enrollments, courses, allGrades])

  // Grade distribution for chart
  const distribution = useMemo(() => {
    const dist: Record<string, number> = { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 }
    classStats?.studentAverages.forEach(s => {
      if (dist[s.letter] !== undefined) dist[s.letter]++
    })
    return Object.keys(dist).map(key => ({ range: key, count: dist[key] }))
  }, [classStats])

  const handleGenerateGroupReportCards = async () => {
    if (!selectedClassId || !selectedTermId) {
      toast.error("Please select a term first.")
      return
    }

    try {
      await generateMutation.mutateAsync({
        term: selectedTermId,
        classroom: selectedClassId
      })
      toast.success("Report cards generation started.")
    } catch (error) {
      toast.error("Failed to generate report cards.")
    }
  }

  const { data: reportCardsData } = useReportCards(selectedYearId)
  const reportCards = reportCardsData?.results || []

  const handleDownloadPdf = async (enrollmentId: number) => {
    if (!selectedTermId) {
       toast.error("Select a term first to export the bulletin.")
       return
    }
    
    // Find the report card for this enrollment and term
    const report = reportCards.find(r => r.enrollment === enrollmentId && r.term === selectedTermId)
    
    if (!report) {
      toast.error("Report card not found for this term. Please generate it first.")
      return
    }

    try {
      const blob = await downloadMutation.mutateAsync(report.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `report_card_${report.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  if (yearsLoading || classroomsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold animate-pulse">Loading pedagogical environment...</p>
      </div>
    )
  }

  // --- SELECTION VIEW ---
  if (!selectedClassId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedagogy Dashboard</h1>
            <p className="text-muted-foreground mt-1">Select a class to manage courses, assessments and grades.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select 
              value={selectedYearId?.toString()} 
              onValueChange={(v) => setSelectedYearId(parseInt(v))}
            >
              <SelectTrigger className="w-[200px]">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y: any) => (
                  <SelectItem key={y.id} value={y.id.toString()}>
                    {y.start_year}/{y.end_year} {y.is_current && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                className="pl-8"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classrooms.map((cls: any) => (
            <Card 
              key={cls.id} 
              className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setSelectedClassId(cls.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">{cls.code}</Badge>
                  <Badge className={cn(
                    "capitalize",
                    cls.level === 'high' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' :
                    cls.level === 'middle' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                    'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  )}>
                    {cls.level}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-xl">{cls.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Roster</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{cls.grade_label || 'Manage'}</span>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  Open Pedagogy
                </Button>
              </CardContent>
            </Card>
          ))}
          {classrooms.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
              <h3 className="mt-4 font-semibold text-lg">No classes found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- CLASS DETAIL VIEW ---
  const isHighSchool = selectedClass?.level === "high"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedClassId(undefined)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{selectedClass?.name}</h1>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                {selectedClass?.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedClass?.grade_label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Academic Year {academicYears.find(y => y.id === selectedYearId)?.start_year}/{academicYears.find(y => y.id === selectedYearId)?.end_year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedTermId?.toString()} onValueChange={(v) => setSelectedTermId(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t: any) => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateGroupReportCards} disabled={!selectedTermId || generateMutation.isPending}>
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Export Group Bulletins
          </Button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50/30 border-blue-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-blue-600 uppercase">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats?.classAverage || '0.0'}%</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/30 border-purple-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-purple-600 uppercase">Assigned Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats?.totalCourses || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/30 border-emerald-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-600 uppercase">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats?.totalStudents || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/30 border-amber-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-amber-600 uppercase">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allGrades.length} recorded</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" /> Students
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" /> Courses
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <GraduationCap className="w-4 h-4" /> Statistics
          </TabsTrigger>
        </TabsList>

        {/* --- STUDENTS TAB --- */}
        <TabsContent value="students" className="mt-6">
          <Card className="shadow-sm overflow-hidden border-muted/60">
            <CardHeader className="bg-muted/10 border-b border-muted/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Student Academic Records</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">{enrollments.length} Students</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="w-[200px] font-bold">Student</TableHead>
                      <TableHead className="font-bold">ID / Number</TableHead>
                      {courses.map(course => (
                        <TableHead key={course.id} className="text-center font-bold min-w-[100px]">
                          {course.name || course.code}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-bold bg-muted/30">Average</TableHead>
                      {isHighSchool && (
                        <>
                          <TableHead className="text-center font-bold">Letter</TableHead>
                          <TableHead className="text-center font-bold">GPA</TableHead>
                        </>
                      )}
                      <TableHead className="text-right font-bold pr-6">Report</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={courses.length + 5} className="text-center py-20">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : classStats?.studentAverages.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/5 group">
                        <TableCell className="font-medium">
                          <Link 
                            href={`/dashboard/pedagogy/class/${selectedClassId}/student/${student.id}`}
                            className="flex items-center gap-3 group/name hover:text-primary transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold group-hover/name:bg-primary group-hover/name:text-white transition-colors">
                              {student.student_name.charAt(0)}
                            </div>
                            <span>{student.student_name}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {student.enrollment_number || 'N/A'}
                          </code>
                        </TableCell>
                        {courses.map(course => {
                          const grade = student.grades[course.id]
                          const score = grade ? parseFloat(grade.score).toFixed(1) : '-'
                          return (
                            <TableCell key={course.id} className="text-center font-medium">
                              <span className={cn(
                                grade ? (parseFloat(grade.score) < 50 ? "text-red-500" : "text-foreground") : "text-muted-foreground"
                              )}>
                                {score}
                              </span>
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center bg-muted/10 font-bold">
                          <div className={cn(
                            "inline-flex items-center justify-center w-12 h-12 rounded-full border-2",
                            student.average < 50 ? "border-red-200 text-red-600 bg-red-50" : 
                            student.average >= 80 ? "border-emerald-200 text-emerald-600 bg-emerald-50" : 
                            "border-blue-200 text-blue-600 bg-blue-50"
                          )}>
                            {student.average.toFixed(0)}%
                          </div>
                        </TableCell>
                        {isHighSchool && (
                          <>
                            <TableCell className="text-center">
                              <Badge variant={student.letter === 'F' ? 'destructive' : 'secondary'} className="font-bold">
                                {student.letter}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-indigo-600">
                              {student.gpa.toFixed(1)}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="text-right pr-6">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => handleDownloadPdf(student.id)}
                           >
                             <FileText className="w-4 h-4 mr-1" /> PDF
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- COURSES TAB --- */}
        <TabsContent value="courses" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              // Get class avg for this course
              const studentGrades = classStats?.studentAverages.map(s => s.grades[course.id]).filter(Boolean) || []
              const courseAvg = studentGrades.length > 0 
                ? studentGrades.reduce((acc, g) => acc + parseFloat(g.score), 0) / studentGrades.length 
                : 0

              return (
                <Card key={course.id} className="border-muted/60 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="cursor-pointer" onClick={() => router.push(`/dashboard/pedagogy/class/${selectedClassId}/course/${course.id}`)}>
                      <Badge variant="outline" className="mb-2">{course.code}</Badge>
                      <CardTitle className="text-lg hover:text-primary transition-colors">{course.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/dashboard/pedagogy/class/${selectedClassId}/course/${course.id}`)}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setActiveCourseForAssessment(course.id)
                          setIsCreateAssessmentOpen(true)
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Teacher</span>
                        <span className="font-medium">{course.teacher_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credits</span>
                        <Badge variant="secondary" className="font-mono">{course.credits} Cr.</Badge>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Class Average</span>
                          <span className={cn(
                            "text-lg font-bold",
                            courseAvg < 50 ? "text-red-500" : courseAvg >= 80 ? "text-emerald-500" : "text-primary"
                          )}>{courseAvg.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              courseAvg < 50 ? "bg-red-500" : courseAvg >= 80 ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${courseAvg}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* --- STATISTICS TAB --- */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs font-medium" axisLine={false} tickLine={false} />
                    <YAxis className="text-xs font-medium" axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(classStats?.studentAverages || [])
                    .sort((a, b) => b.average - a.average)
                    .slice(0, 5)
                    .map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs",
                            i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-600" : "bg-muted-foreground/30"
                          )}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{s.student_name}</p>
                            <p className="text-xs text-muted-foreground">{s.enrollment_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{s.average.toFixed(1)}%</p>
                          {isHighSchool && <Badge variant="outline" className="text-[10px] h-4">{s.letter}</Badge>}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <CreateAssessmentDialog 
        isOpen={isCreateAssessmentOpen}
        onClose={() => setIsCreateAssessmentOpen(false)}
        initialCourseId={activeCourseForAssessment}
        initialTermId={selectedTermId}
        classLevel={selectedClass?.level}
      />
    </div>
  )
}
