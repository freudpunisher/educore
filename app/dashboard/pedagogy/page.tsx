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
  Play,
  ClipboardList,
  AlertCircle
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
  useEnrollments,
  useGeneratePreschoolAnnualReportCards,
  useGenerateElementaryAnnualReportCards,
  useGenerateMiddleSchoolAnnualReportCards,
  useGenerateHighSchoolAnnualReportCards,
  useAllTeachers,
  useTeacherCourses,
  useAllCourses,
  useCourseAssessmentPolicies,
} from "@/hooks/use-pedagogy"
import React, { useMemo, useState, useEffect } from "react"
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
  const [activeTab, setActiveTab] = useState("classes")
  const [teacherToDetail, setTeacherToDetail] = useState<number | null>(null)

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
  const { data: classrooms = [], isLoading: classroomsLoading, isError: classroomsError } = useClassRooms(classSearch)
  const { data: teachers = [], isLoading: teachersLoading } = useAllTeachers()
  const { data: allCoursesData } = useAllCourses(1)
  const { data: teacherOverview, isLoading: teacherOverviewLoading } = useTeacherCourses(teacherToDetail)
  const { data: selectedClass, isLoading: selectedClassLoading } = useClassRoom(selectedClassId || "")
  const isHighSchool = selectedClass?.level === 'high'
  
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments(selectedClassId, selectedYearId)
  const { data: coursesData, isLoading: coursesLoading } = useCourses(selectedClassId, selectedYearId)
  const { data: gradesData, isLoading: gradesLoading } = useGrades(
    undefined, 
    selectedYearId, 
    selectedTermId, 
    1, 
    undefined, 
    selectedClassId
  )
  const { data: terms = [] } = useTerms(selectedYearId)
  const generateMutation = useGenerateReportCards()
  const generatePreschoolAnnualMutation = useGeneratePreschoolAnnualReportCards()
  const generateElementaryAnnualMutation = useGenerateElementaryAnnualReportCards()
  const generateMiddleAnnualMutation = useGenerateMiddleSchoolAnnualReportCards()
  const generateHighAnnualMutation = useGenerateHighSchoolAnnualReportCards()
  const downloadMutation = useDownloadReportCardPDF()

  const enrollments = enrollmentsData?.results || []
  const courses = coursesData?.results || []
  const allGrades = gradesData?.results || []
  const courseIds = useMemo(() => courses.map((c: any) => c.id), [courses])
  const { data: allPolicies = [] } = useCourseAssessmentPolicies(courseIds)

  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false)
  const [activeCourseForAssessment, setActiveCourseForAssessment] = useState<number | undefined>(undefined)

  // Auto-select class if teacher has only one
  useEffect(() => {
    if (user?.role === "teacher" && classrooms.length === 1 && !selectedClassId) {
      setSelectedClassId(classrooms[0].id)
    }
  }, [user, classrooms, selectedClassId])

  // Compute Stats for the selected class
  // Auto-select first term when terms are loaded
  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id)
    }
  }, [terms, selectedTermId])

  // Build policy lookup: { courseId: { assessmentTypeId: { weight, categoryCode } } }
  const policyMap = useMemo(() => {
    const map: Record<number, Record<number, { weight: number; categoryCode: string }>> = {}
    allPolicies.forEach((p: any) => {
      if (!map[p.course]) map[p.course] = {}
      map[p.course][p.assessment_type] = {
        weight: parseFloat(p.weight) || 0,
        categoryCode: p.category_label || '',
      }
    })
    return map
  }, [allPolicies])

  const classStats = useMemo(() => {
    if (!selectedClassId || enrollments.length === 0) return null

    // Map grades by enrollment and course
    const gradesByEnrollment: Record<number, Record<number, any[]>> = {}
    allGrades.forEach(g => {
      if (!gradesByEnrollment[g.enrollment]) gradesByEnrollment[g.enrollment] = {}
      if (!gradesByEnrollment[g.enrollment][g.course!]) gradesByEnrollment[g.enrollment][g.course!] = []
      gradesByEnrollment[g.enrollment][g.course!].push(g)
    })

    const isHighSchool = selectedClass?.level === 'high'
    const isPrimary = selectedClass?.level === 'primary' || selectedClass?.level === 'preschool'

    const studentAverages = enrollments.map(enr => {
      const studentCoursesGrades = gradesByEnrollment[enr.id] || {}

      const coursePercentages = Object.entries(studentCoursesGrades).map(([courseId, courseGrades]) => {
        const course = courses.find(c => c.id === parseInt(courseId))
        if (!course) return null

        const coursePolicies = policyMap[parseInt(courseId)] || {}
        const hasPolicies = Object.keys(coursePolicies).length > 0

        // Group grades by assessment_type to apply policy weights
        const typeGroups: Record<string, { grades: any[]; weight: number }> = {}
        const examCodes = ['EXAM', 'FINAL', 'MIDTERM', 'AQA', 'PROJECT']

        for (const g of courseGrades as any[]) {
          const atCode = g.assessment_type_code
          const atId = g.assessment_type_detail?.id || g.assessment_type
          const policy = coursePolicies[atId]
          const weight = policy?.weight || 0

          if (!typeGroups[atCode]) {
            typeGroups[atCode] = { grades: [], weight }
          }
          typeGroups[atCode].grades.push(g)
        }

        // Compute weighted percentage using policies or fallback
        let totalWeightedPct = 0
        let totalActiveWeight = 0

        if (hasPolicies) {
          for (const [, group] of Object.entries(typeGroups)) {
            if (group.grades.length === 0 || group.weight === 0) continue
            const groupAvg = group.grades.reduce((acc: number, g: any) => acc + (parseFloat(g.percentage) || 0), 0) / group.grades.length
            totalWeightedPct += groupAvg * group.weight / 100
            totalActiveWeight += group.weight
          }
        } else {
          // Fallback: split grades into DW and Exam categories
          const dwGrades = (courseGrades as any[]).filter((g: any) => !examCodes.includes(g.assessment_type_code))
          const exGrades = (courseGrades as any[]).filter((g: any) => examCodes.includes(g.assessment_type_code))

          if (dwGrades.length > 0) {
            const dwAvg = dwGrades.reduce((acc: number, g: any) => acc + (parseFloat(g.percentage) || 0), 0) / dwGrades.length
            totalWeightedPct += dwAvg * (dwGrades.length)
            totalActiveWeight += dwGrades.length
          }
          if (exGrades.length > 0) {
            const exAvg = exGrades.reduce((acc: number, g: any) => acc + (parseFloat(g.percentage) || 0), 0) / exGrades.length
            totalWeightedPct += exAvg * (exGrades.length)
            totalActiveWeight += exGrades.length
          }
        }

        const percentage = totalActiveWeight > 0 ? (totalWeightedPct / totalActiveWeight) : 0
        const totalMax = 100
        const rawSum = (percentage / 100) * totalMax

        return {
          courseId: parseInt(courseId),
          percentage,
          rawSum,
          totalMax,
          hasPolicies
        }
      }).filter(Boolean) as { courseId: number, percentage: number, rawSum: number, totalMax: number, hasPolicies: boolean }[]

      const avg = coursePercentages.length > 0 
        ? coursePercentages.reduce((acc, cp) => acc + cp.percentage, 0) / coursePercentages.length 
        : 0
      
      const uiGrades: Record<number, any> = {}
      coursePercentages.forEach(cp => {
        uiGrades[cp.courseId] = { 
          score: cp.percentage.toFixed(1),
          rawSum: cp.rawSum,
          totalMax: cp.totalMax
        }
      })

      const isKindergarten = selectedClass?.level === 'preschool'
      
      let letter = "F"
      let gpa = 0
      
      if (isKindergarten) {
        if (avg >= 90) letter = "Expert";
        else if (avg >= 75) letter = "Mastered";
        else if (avg >= 50) letter = "Developing";
        else letter = "Emerging";
        gpa = 0
      } else if (isPrimary) {
        if (avg >= 80) letter = "A";
        else if (avg >= 60) letter = "B";
        else if (avg >= 40) letter = "C";
        else letter = "D";
        gpa = 0
      } else {
        if (avg >= 90) { letter = "A"; gpa = 4.0 }
        else if (avg >= 80) { letter = "B"; gpa = 3.0 }
        else if (avg >= 70) { letter = "C"; gpa = 2.0 }
        else if (avg >= 60) { letter = "D"; gpa = 1.0 }
        else { letter = "F"; gpa = 0.0 }
      }

      return {
        ...enr,
        average: avg,
        letter,
        gpa,
        grades: uiGrades,
        level: selectedClass?.level,
        isKindergarten
      }
    })

    const classAverage = studentAverages.length > 0 
      ? studentAverages.reduce((acc, s) => acc + s.average, 0) / studentAverages.length 
      : 0

    return {
      studentAverages,
      classAverage: classAverage.toFixed(1),
      totalStudents: enrollments.length,
      totalCourses: courses.length,
      gradesByEnrollment
    }
  }, [selectedClassId, selectedClass, enrollments, courses, allGrades, policyMap])

  // Grade distribution for chart
  const distribution = useMemo(() => {
    if (isHighSchool) {
      const dist: Record<string, number> = { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 }
      classStats?.studentAverages.forEach(s => {
        if (dist[s.letter] !== undefined) dist[s.letter]++
      })
      return Object.keys(dist).map(key => ({ range: key, count: dist[key] }))
    }
    const ranges = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]
    const dist: Record<string, number> = Object.fromEntries(ranges.map(r => [r, 0]))
    classStats?.studentAverages.forEach(s => {
      const avg = s.average
      if (avg < 20) dist["0-20%"]++
      else if (avg < 40) dist["20-40%"]++
      else if (avg < 60) dist["40-60%"]++
      else if (avg < 80) dist["60-80%"]++
      else dist["80-100%"]++
    })
    return ranges.map(key => ({ range: key, count: dist[key] }))
  }, [classStats, isHighSchool])

  const handleGenerateGroupReportCards = async () => {
    if (!selectedTermId || !selectedClassId) return
    
    try {
      toast.loading("Génération des bulletins en cours...", { id: "generating" })
      await generateMutation.mutateAsync({ 
        term: selectedTermId,
        classroom: selectedClassId 
      })
      toast.success("Bulletins générés avec succès !", { id: "generating" })
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message, { id: "generating" })
    }
  }

  const handleGenerateMiddleAnnualReportCards = async () => {
    if (!selectedClassId) return
    
    try {
      toast.loading("Génération des bulletins annuels Middle School...", { id: "generating-annual" })
      await generateMiddleAnnualMutation.mutateAsync({ 
        classroom: selectedClassId 
      })
      toast.success("Bulletins annuels générés avec succès !", { id: "generating-annual" })
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message, { id: "generating-annual-ms" })
    }
  }

  const handleGenerateElementaryAnnualReportCards = async () => {
    if (!selectedClassId || !selectedYearId) return
    
    try {
      toast.loading("Génération des bulletins annuels Primaire...", { id: "generating-annual-el" })
      await generateElementaryAnnualMutation.mutateAsync({ 
        academic_year: selectedYearId,
        classroom: selectedClassId 
      })
      toast.success("Bulletins annuels générés avec succès !", { id: "generating-annual-el" })
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message, { id: "generating-annual-el" })
    }
  }

  const handleGenerateHighAnnualReportCards = async () => {
    if (!selectedClassId) return
    
    try {
      toast.loading("Génération des bulletins annuels High School...", { id: "generating-annual-hs" })
      await generateHighAnnualMutation.mutateAsync({ 
        classroom: selectedClassId 
      })
      toast.success("Bulletins annuels générés avec succès !", { id: "generating-annual-hs" })
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message, { id: "generating-annual-hs" })
    }
  }

  const handleGeneratePreschoolAnnualReportCards = async () => {
    if (!selectedClassId || !selectedYearId) return
    
    try {
      toast.loading("Génération des bulletins annuels Maternelle...", { id: "generating-annual-ps" })
      await generatePreschoolAnnualMutation.mutateAsync({ 
        academic_year: selectedYearId,
        classroom: selectedClassId 
      })
      toast.success("Bulletins annuels générés avec succès !", { id: "generating-annual-ps" })
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message, { id: "generating-annual-ps" })
    }
  }

  const { data: reportCardsData } = useReportCards(selectedYearId, selectedClassId, selectedTermId)
  const reportCards = reportCardsData?.results || []

  const handleDownloadPdf = async (enrollmentId: number) => {
    console.log("Downloading PDF for enrollment:", enrollmentId, "Term:", selectedTermId)
    if (!selectedTermId) {
       toast.error("Please select a term first.")
       return
    }
    
    // Robust matching for enrollment and term (handles both IDs and objects)
    const report = reportCards.find(r => {
      const rEnrollmentId = typeof r.enrollment === 'object' ? r.enrollment.id : r.enrollment
      const rTermId = typeof r.term === 'object' ? r.term.id : r.term
      return rEnrollmentId === enrollmentId && rTermId === selectedTermId
    })
    
    if (!report) {
      console.warn("Report card not found in the loaded list.", { enrollmentId, selectedTermId, availableReports: reportCards })
      toast.error("Report card not found for this term. Please generate it first.")
      return
    }

    try {
      toast.loading("Generating PDF...", { id: "downloading" })
      const data = await downloadMutation.mutateAsync(report.id)
      
      // Axios with responseType: 'blob' returns the blob in response.data
      // If the hook returns response.data, then 'data' is the Blob.
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `bulletin_${enrollmentId}_term_${selectedTermId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Download started", { id: "downloading" })
    } catch (error: any) {
      console.error("PDF Download Error:", error)
      toast.error(error.message || "Failed to download PDF", { id: "downloading" })
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

  if (classroomsError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h3 className="mt-2 font-semibold text-lg">Failed to load classes</h3>
        <p className="text-muted-foreground">Check that the backend server is running and accessible.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // --- SELECTION VIEW ---
  if (!selectedClassId) {
    const totalTeachers = teachers.length
    const totalCourses = allCoursesData?.count || 0

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedagogy Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage classes, teachers, courses, assessments and grades.</p>
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
            {activeTab === "classes" && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  className="pl-8"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-blue-50/30 border-blue-100 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-blue-600 uppercase">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/30 border-purple-100 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-purple-600 uppercase">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTeachers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Classes / Teachers */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="classes" className="gap-2">
              <Users className="w-4 h-4" /> Classes
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2">
              <BookOpen className="w-4 h-4" /> Teachers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="mt-6">
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
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <Card className="shadow-sm overflow-hidden border-muted/60">
              <CardHeader className="bg-muted/10 border-b border-muted/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Teachers</CardTitle>
                  <Badge variant="outline" className="bg-white">{teachers.length} Teachers</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Username</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="text-center font-bold">Courses</TableHead>
                      <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                          No teachers found.
                        </TableCell>
                      </TableRow>
                    ) : teachers.map((t: any) => (
                      <React.Fragment key={t.id}>
                        <TableRow className="hover:bg-muted/5 group">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {(t.user?.first_name?.charAt(0) || t.user?.username?.charAt(0) || '?').toUpperCase()}
                              </div>
                              <span>{t.user?.first_name} {t.user?.last_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.user?.username}</code>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{t.user?.email || '—'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-mono">{t.courses_count ?? 0}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => setTeacherToDetail(teacherToDetail === t.id ? null : t.id)}
                            >
                              <BookOpen className="w-4 h-4 mr-1" /> 
                              {teacherToDetail === t.id ? 'Hide Details' : 'Details'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {teacherToDetail === t.id && (
                          <TableRow key={`${t.id}-detail`}>
                            <TableCell colSpan={5} className="p-4 bg-muted/10">
                              {teacherOverviewLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                              ) : teacherOverview ? (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Courses ({teacherOverview.courses?.length || 0})</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {teacherOverview.courses?.length > 0 ? teacherOverview.courses.map((c: any) => (
                                        <Badge key={c.id} variant="secondary" className="text-xs">
                                          {c.name} ({c.code})
                                        </Badge>
                                      )) : (
                                        <p className="text-xs text-muted-foreground">No courses assigned.</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Classes ({teacherOverview.classrooms?.length || 0})</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {teacherOverview.classrooms?.length > 0 ? teacherOverview.classrooms.map((c: any) => (
                                        <Badge key={c.id} variant="outline" className="text-xs">
                                          {c.name}
                                        </Badge>
                                      )) : (
                                        <p className="text-xs text-muted-foreground">No classes assigned.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">Failed to load details.</p>
                              )}
                            </TableCell>
                          </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // --- CLASS DETAIL VIEW ---

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
          <Button 
            onClick={handleGenerateGroupReportCards} 
            disabled={!selectedTermId || generateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ClipboardList className="w-4 h-4 mr-2" />
            )}
            Generate Report Cards
          </Button>

          {selectedClass?.level === 'elementary' && (
            <Button 
              onClick={handleGenerateElementaryAnnualReportCards} 
              disabled={generateElementaryAnnualMutation.isPending}
              variant="outline"
              className="border-blue-600 text-blue-700 hover:bg-blue-50"
            >
              {generateElementaryAnnualMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Annual Report (Elementary)
            </Button>
          )}

          {selectedClass?.level === 'middle' && (
            <Button 
              onClick={handleGenerateMiddleAnnualReportCards} 
              disabled={generateMiddleAnnualMutation.isPending}
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
            >
              {generateMiddleAnnualMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Annual Report (Middle School)
            </Button>
          )}

          {selectedClass?.level === 'high' && (
            <Button 
              onClick={handleGenerateHighAnnualReportCards} 
              disabled={generateHighAnnualMutation.isPending}
              variant="outline"
              className="border-indigo-600 text-indigo-700 hover:bg-indigo-50"
            >
              {generateHighAnnualMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Annual Report (High School)
            </Button>
          )}

          {selectedClass?.level === 'preschool' && (
            <Button 
              onClick={handleGeneratePreschoolAnnualReportCards} 
              disabled={generatePreschoolAnnualMutation.isPending}
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              {generatePreschoolAnnualMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Annual Report (Creche/Pre-K)
            </Button>
          )}
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
                      <TableHead className="w-[200px] font-bold">Student Name</TableHead>
                      <TableHead className="w-[120px] font-bold">ID Number</TableHead>
                      {courses.map(course => (
                        <TableHead key={course.id} className="text-center font-bold">
                          {course.code}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-bold bg-primary/5">Overall Avg</TableHead>
                      {isHighSchool && (
                        <>
                          <TableHead className="text-center font-bold">Grade</TableHead>
                          <TableHead className="text-center font-bold">GPA</TableHead>
                        </>
                      )}
                      <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!classStats || classStats.studentAverages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={courses.length + (isHighSchool ? 6 : 4)} className="text-center py-20 text-muted-foreground">
                          No student academic records found for this classroom and year.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {reportCards.length === 0 && (
                          <TableRow className="bg-amber-50/50">
                            <TableCell colSpan={courses.length + (isHighSchool ? 6 : 4)} className="py-2 text-center text-xs font-medium text-amber-700 border-b border-amber-100">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Report cards haven't been generated for this term yet. Click "Generate Report Cards" above to enable PDF exports.
                            </TableCell>
                          </TableRow>
                        )}
                        {classStats?.studentAverages.map((student) => (
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
                        {courses.map((course) => {
                          const gradeInfo = student.grades[course.id]
                          const percentage = gradeInfo?.score || '0.0'
                          const rawSum = gradeInfo?.rawSum || 0
                          const maxPoints = gradeInfo?.totalMax || 100

                          return (
                            <TableCell key={course.id} className="text-center">
                              {gradeInfo ? (
                                <div className="flex flex-col items-center gap-1">
                                  {student.isKindergarten ? (
                                    <div className="flex flex-col items-center">
                                      {parseFloat(percentage) >= 90 ? (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none gap-1">
                                          <span className="text-xs">🌟</span> Expert
                                        </Badge>
                                      ) : parseFloat(percentage) >= 75 ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none gap-1">
                                          <span className="text-xs">✅</span> Mastered
                                        </Badge>
                                      ) : parseFloat(percentage) >= 50 ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none gap-1">
                                          <span className="text-xs">🚧</span> Developing
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none gap-1">
                                          <span className="text-xs">❌</span> Emerging
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <span className={cn(
                                        "font-bold",
                                        parseFloat(percentage) < 50 ? "text-red-500" : parseFloat(percentage) >= 80 ? "text-emerald-500" : "text-primary"
                                      )}>
                                        {percentage}%
                                      </span>
                                      <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        {Math.round(rawSum)} / {maxPoints}
                                      </span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center bg-muted/10 font-bold">
                          {student.isKindergarten ? (
                            <div className={cn(
                              "inline-flex flex-col items-center justify-center min-w-[80px] p-2 rounded-xl border-2",
                              student.average >= 90 ? "border-purple-200 text-purple-700 bg-purple-50" : 
                              student.average >= 75 ? "border-green-200 text-green-700 bg-green-50" : 
                              student.average >= 50 ? "border-amber-200 text-amber-700 bg-amber-50" : 
                              "border-red-200 text-red-700 bg-red-50"
                            )}>
                              <span className="text-[10px] uppercase font-black opacity-60">Status</span>
                              <span className="text-xs font-bold leading-tight">
                                {student.letter}
                              </span>
                            </div>
                          ) : (
                            <div className={cn(
                              "inline-flex items-center justify-center w-12 h-12 rounded-full border-2",
                              student.average < 50 ? "border-red-200 text-red-600 bg-red-50" : 
                              student.average >= 80 ? "border-emerald-200 text-emerald-600 bg-emerald-50" : 
                              "border-blue-200 text-blue-600 bg-blue-50"
                            )}>
                              {student.average.toFixed(0)}%
                            </div>
                          )}
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
                  </>
                )}
              </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- COURSES TAB --- */}
        <TabsContent value="courses" className="mt-6">
          <Card className="shadow-sm overflow-hidden border-muted/60">
            <CardHeader className="bg-muted/10 border-b border-muted/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Assigned Courses</CardTitle>
                <Badge variant="outline" className="bg-white">{courses.length} Courses</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {coursesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !coursesData ? (
                <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2">
                  <AlertCircle className="w-8 h-8" />
                  <p className="font-medium">Failed to load courses</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="w-[120px] font-bold">Code</TableHead>
                    <TableHead className="font-bold">Course Name</TableHead>
                    <TableHead className="font-bold">Teacher</TableHead>
                    <TableHead className="text-center font-bold">Credits</TableHead>
                    <TableHead className="text-center font-bold">Max Points</TableHead>
                    <TableHead className="text-center font-bold">Class Average</TableHead>
                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                        No courses assigned to this classroom.
                      </TableCell>
                    </TableRow>
                  ) : courses.map((course) => {
                    // Get class avg for this course
                    const studentGrades = classStats?.studentAverages?.map((s: any) => s.grades[course.id]).filter(Boolean) || []
                    const courseAvg = studentGrades.length > 0 
                      ? studentGrades.reduce((acc: number, g: any) => acc + parseFloat(g.score), 0) / studentGrades.length 
                      : 0

                    const dw = parseFloat(String(course.max_points_dw || "0")) || 0
                    const exam = parseFloat(String(course.max_points_exam || "0")) || 0
                    const total = parseFloat(String(course.max_points_total || "0")) || 0
                    const maxPointsTotal = total || (dw + exam) || 20

                    return (
                      <TableRow key={course.id} className="hover:bg-muted/5 group">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{course.code}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div 
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => router.push(`/dashboard/pedagogy/class/${selectedClassId}/course/${course.id}`)}
                          >
                            {course.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                              {course.teacher_name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm">{course.teacher_name || 'Unassigned'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono text-sm">{course.credits}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono bg-blue-50 text-blue-700 border-blue-100">
                            {maxPointsTotal} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "font-bold",
                              courseAvg < 50 ? "text-red-500" : courseAvg >= 80 ? "text-emerald-500" : "text-primary"
                            )}>
                              {courseAvg.toFixed(1)}%
                            </span>
                            <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  courseAvg < 50 ? "bg-red-500" : courseAvg >= 80 ? "bg-emerald-500" : "bg-primary"
                                )}
                                style={{ width: `${courseAvg}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => router.push(`/dashboard/pedagogy/class/${selectedClassId}/course/${course.id}`)}
                            >
                              <LayoutDashboard className="w-4 h-4 mr-1" /> View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => {
                                setActiveCourseForAssessment(course.id)
                                setIsCreateAssessmentOpen(true)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Assessment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- STATISTICS TAB --- */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isHighSchool ? "Grade Distribution (A-F)" : "Class Performance Distribution"}
                </CardTitle>
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
