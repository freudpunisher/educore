"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Calendar,
  Search,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle2,
  Circle,
  GraduationCap,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useClassRooms, useAcademicYears } from "@/hooks/use-academic-data"
import { useAllTeachers, useAllCourses, useTerms } from "@/hooks/use-pedagogy"
import {
  useUpdateCourseTeacher,
  useUpdateClassroomTutor,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
} from "@/hooks/use-academic-planning"
import { useAuth } from "@/lib/auth-context"
import toast from "react-hot-toast"

export default function AcademicPlanningPage() {
  const { user } = useAuth()
  const { data: years = [], isLoading: yearsLoading } = useAcademicYears()
  const { data: classrooms = [], isLoading: classroomsLoading } = useClassRooms()
  const { data: teachers = [], isLoading: teachersLoading } = useAllTeachers()

  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined)
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("teacher-courses")

  useEffect(() => {
    if (years.length > 0 && selectedYearId === undefined) {
      const current = years.find((y: any) => y.is_current)
      setSelectedYearId(current ? current.id : years[0].id)
    }
  }, [years, selectedYearId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Academic Planning</h1>
          <p className="text-muted-foreground mt-1">Manage teacher assignments, class tutors and academic calendar</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="teacher-courses" className="gap-2">
            <Users className="w-4 h-4" />
            Teacher-Course Assignment
          </TabsTrigger>
          <TabsTrigger value="academic-year" className="gap-2">
            <Calendar className="w-4 h-4" />
            Academic Year Planning
          </TabsTrigger>
          <TabsTrigger value="tutor-assignment" className="gap-2">
            <Users className="w-4 h-4" />
            Class Tutor Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teacher-courses">
          <TeacherCourseAssignment
            years={years}
            classrooms={classrooms}
            teachers={teachers}
            selectedYearId={selectedYearId}
            setSelectedYearId={setSelectedYearId}
            selectedClassId={selectedClassId}
            setSelectedClassId={setSelectedClassId}
            loading={classroomsLoading || teachersLoading}
          />
        </TabsContent>

        <TabsContent value="academic-year">
          <AcademicYearPlanning years={years} loading={yearsLoading} />
        </TabsContent>
        <TabsContent value="tutor-assignment">
          <TutorAssignment
            classrooms={classrooms}
            teachers={teachers}
            loading={classroomsLoading || teachersLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Teacher-Course Assignment Tab
// ──────────────────────────────────────────────
function TeacherCourseAssignment({
  years,
  classrooms,
  teachers,
  selectedYearId,
  setSelectedYearId,
  selectedClassId,
  setSelectedClassId,
  loading,
}: {
  years: any[]
  classrooms: any[]
  teachers: any[]
  selectedYearId: number | undefined
  setSelectedYearId: (id: number | undefined) => void
  selectedClassId: number | undefined
  setSelectedClassId: (id: number | undefined) => void
  loading: boolean
}) {
  const { data: coursesData, isLoading: coursesLoading } = useAllCourses(1)
  const updateTeacher = useUpdateCourseTeacher()

  const filteredCourses = (coursesData?.results || []).filter((c: any) => {
    if (selectedClassId && c.classroom !== selectedClassId) return false
    return true
  })

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return "—"
    const teacher = teachers.find((t: any) => t.id === teacherId)
    return teacher?.user?.username || teacher?.username || `Teacher #${teacherId}`
  }

  const handleTeacherChange = (courseId: number, teacherId: string) => {
    const value = teacherId === "none" ? null : parseInt(teacherId)
    updateTeacher.mutate({ courseId, teacher: value })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Academic Year</label>
              <Select
                value={selectedYearId?.toString() || ""}
                onValueChange={(v) => setSelectedYearId(parseInt(v))}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y: any) => (
                    <SelectItem key={y.id} value={y.id.toString()}>
                      {y.name || `${y.start_year} - ${y.end_year}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Classroom</label>
              <Select
                value={selectedClassId?.toString() || ""}
                onValueChange={(v) => setSelectedClassId(v === "all" ? undefined : parseInt(v))}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classrooms</SelectItem>
                  {classrooms.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Courses
          </CardTitle>
          <CardDescription>
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Classroom</TableHead>
                    <TableHead>Current Teacher</TableHead>
                    <TableHead>Assign Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono text-sm">{course.code}</TableCell>
                      <TableCell className="font-medium">{course.name || course.code}</TableCell>
                      <TableCell>
                        {classrooms.find((c: any) => c.id === course.classroom)?.name || `#${course.classroom}`}
                      </TableCell>
                      <TableCell>
                        {course.teacher ? (
                          <Badge variant="secondary" className="font-normal">
                            {getTeacherName(course.teacher)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={course.teacher?.toString() || "none"}
                          onValueChange={(v) => handleTeacherChange(course.id, v)}
                          disabled={updateTeacher.isPending}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— Unassign —</SelectItem>
                            {teachers.map((t: any) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.user?.username || t.username || `Teacher #${t.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

// ──────────────────────────────────────────────
//  Academic Year Planning Tab
// ──────────────────────────────────────────────
function AcademicYearPlanning({ years, loading }: { years: any[]; loading: boolean }) {
  const createYear = useCreateAcademicYear()
  const updateYear = useUpdateAcademicYear()
  const deleteYear = useDeleteAcademicYear()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingYearId, setEditingYearId] = useState<number | null>(null)

  // New year form
  const [newStartYear, setNewStartYear] = useState("")
  const [newEndYear, setNewEndYear] = useState("")
  const [newIsCurrent, setNewIsCurrent] = useState(false)

  // Edit year form
  const [editStartYear, setEditStartYear] = useState("")
  const [editEndYear, setEditEndYear] = useState("")
  const [editIsCurrent, setEditIsCurrent] = useState(false)

  const resetNewForm = () => {
    setNewStartYear("")
    setNewEndYear("")
    setNewIsCurrent(false)
    setShowCreateForm(false)
  }

  const handleCreateYear = () => {
    if (!newStartYear || !newEndYear) {
      toast.error("Start year and end year are required")
      return
    }
    createYear.mutate(
      {
        start_year: parseInt(newStartYear),
        end_year: parseInt(newEndYear),
        is_current: newIsCurrent,
      },
      { onSuccess: () => resetNewForm() }
    )
  }

  const startEdit = (year: any) => {
    setEditingYearId(year.id)
    setEditStartYear(year.start_year.toString())
    setEditEndYear(year.end_year.toString())
    setEditIsCurrent(year.is_current)
  }

  const cancelEdit = () => {
    setEditingYearId(null)
  }

  const handleUpdateYear = (id: number) => {
    updateYear.mutate(
      {
        id,
        data: {
          start_year: parseInt(editStartYear),
          end_year: parseInt(editEndYear),
          is_current: editIsCurrent,
        },
      },
      { onSuccess: () => setEditingYearId(null) }
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Academic Years
            </CardTitle>
            <CardDescription>Manage academic years and their terms</CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Year
          </Button>
        </CardHeader>
        <CardContent>
          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-semibold text-sm">Create Academic Year</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Start Year</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2025"
                    value={newStartYear}
                    onChange={(e) => setNewStartYear(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">End Year</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2026"
                    value={newEndYear}
                    onChange={(e) => setNewEndYear(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsCurrent}
                      onChange={(e) => setNewIsCurrent(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Set as current</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateYear} disabled={createYear.isPending}>
                  {createYear.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create
                </Button>
                <Button size="sm" variant="ghost" onClick={resetNewForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Years List */}
          {years.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No academic years found</div>
          ) : (
            <div className="space-y-4">
              {years.map((year: any) => (
                <YearCard
                  key={year.id}
                  year={year}
                  isEditing={editingYearId === year.id}
                  editStartYear={editStartYear}
                  editEndYear={editEndYear}
                  editIsCurrent={editIsCurrent}
                  onEditStartYear={setEditStartYear}
                  onEditEndYear={setEditEndYear}
                  onEditIsCurrent={setEditIsCurrent}
                  onStartEdit={() => startEdit(year)}
                  onCancelEdit={cancelEdit}
                  onSave={() => handleUpdateYear(year.id)}
                  onDelete={() => deleteYear.mutate(year.id)}
                  isUpdating={updateYear.isPending}
                  isDeleting={deleteYear.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Class Tutor Assignment Tab
// ──────────────────────────────────────────────
function TutorAssignment({
  classrooms,
  teachers,
  loading,
}: {
  classrooms: any[]
  teachers: any[]
  loading: boolean
}) {
  const { data: years = [] } = useAcademicYears()
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState("")
  const updateTutor = useUpdateClassroomTutor()

  useEffect(() => {
    if (years.length > 0 && selectedYearId === undefined) {
      const current = years.find((y: any) => y.is_current)
      setSelectedYearId(current ? current.id : years[0].id)
    }
  }, [years, selectedYearId])

  const filtered = classrooms.filter((c: any) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  )

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return null
    const teacher = teachers.find((t: any) => t.id === teacherId)
    return teacher?.user?.username || teacher?.username || `Teacher #${teacherId}`
  }

  const handleTutorChange = (classroomId: number, tutorId: string) => {
    const value = tutorId === "none" ? null : parseInt(tutorId)
    updateTutor.mutate({ classroomId, tutor: value })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Academic Year</label>
              <Select
                value={selectedYearId?.toString() || ""}
                onValueChange={(v) => setSelectedYearId(parseInt(v))}
              >
                <SelectTrigger className="w-[220px]">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y: any) => (
                    <SelectItem key={y.id} value={y.id.toString()}>
                      {y.name || `${y.start_year}/${y.end_year}`} {y.is_current ? "(Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Search Class</label>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Classes
          </CardTitle>
          <CardDescription>
            {filtered.length} class{filtered.length !== 1 ? "es" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-center">Places</TableHead>
                    <TableHead className="text-center">Enrolled</TableHead>
                    <TableHead>Current Tutor</TableHead>
                    <TableHead>Assign Tutor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((cls: any) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-mono text-sm">{cls.code}</TableCell>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{cls.level}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{cls.place}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cls.enrollment_count >= cls.place ? "destructive" : "secondary"}>
                          {cls.enrollment_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cls.tutor ? (
                          <Badge variant="secondary" className="font-normal">
                            {getTeacherName(cls.tutor)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={cls.tutor?.toString() || "none"}
                          onValueChange={(v) => handleTutorChange(cls.id, v)}
                          disabled={updateTutor.isPending}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select tutor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— Unassign —</SelectItem>
                            {teachers.map((t: any) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.user?.username || t.username || `Teacher #${t.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

function YearCard({
  year,
  isEditing,
  editStartYear,
  editEndYear,
  editIsCurrent,
  onEditStartYear,
  onEditEndYear,
  onEditIsCurrent,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  year: any
  isEditing: boolean
  editStartYear: string
  editEndYear: string
  editIsCurrent: boolean
  onEditStartYear: (v: string) => void
  onEditEndYear: (v: string) => void
  onEditIsCurrent: (v: boolean) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const { data: terms = [] } = useTerms(year.id)
  const createTerm = useCreateTerm()
  const updateTerm = useUpdateTerm()
  const deleteTerm = useDeleteTerm()

  const [showTermForm, setShowTermForm] = useState(false)
  const [editingTermId, setEditingTermId] = useState<number | null>(null)

  // New term form
  const [newTermName, setNewTermName] = useState("")
  const [newTermStart, setNewTermStart] = useState("")
  const [newTermEnd, setNewTermEnd] = useState("")

  // Edit term form
  const [editTermName, setEditTermName] = useState("")
  const [editTermStart, setEditTermStart] = useState("")
  const [editTermEnd, setEditTermEnd] = useState("")

  const resetTermForm = () => {
    setNewTermName("")
    setNewTermStart("")
    setNewTermEnd("")
    setShowTermForm(false)
  }

  const handleCreateTerm = () => {
    if (!newTermName || !newTermStart || !newTermEnd) {
      toast.error("All term fields are required")
      return
    }
    createTerm.mutate(
      {
        academic_year: year.id,
        name: newTermName,
        start_date: newTermStart,
        end_date: newTermEnd,
      },
      { onSuccess: () => resetTermForm() }
    )
  }

  const startEditTerm = (term: any) => {
    setEditingTermId(term.id)
    setEditTermName(term.name)
    setEditTermStart(term.start_date)
    setEditTermEnd(term.end_date)
  }

  const cancelEditTerm = () => {
    setEditingTermId(null)
  }

  const handleUpdateTerm = (id: number) => {
    updateTerm.mutate(
      {
        id,
        data: {
          name: editTermName,
          start_date: editTermStart,
          end_date: editTermEnd,
        },
      },
      { onSuccess: () => setEditingTermId(null) }
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Year header */}
      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Start Year</label>
            <Input
              type="number"
              value={editStartYear}
              onChange={(e) => onEditStartYear(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">End Year</label>
            <Input
              type="number"
              value={editEndYear}
              onChange={(e) => onEditEndYear(e.target.value)}
            />
          </div>
          <div className="space-y-1 flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editIsCurrent}
                onChange={(e) => onEditIsCurrent(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Current</span>
            </label>
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" onClick={onSave} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <span className="font-semibold">
                {year.name || `${year.start_year} - ${year.end_year}`}
              </span>
              {year.is_current && (
                <Badge variant="default" className="ml-2 bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onStartEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Terms section */}
      <div className="ml-4 pl-4 border-l-2 border-muted space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Terms ({terms.length})
          </span>
          <Button size="sm" variant="ghost" onClick={() => setShowTermForm(!showTermForm)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Term
          </Button>
        </div>

        {/* Create Term Form */}
        {showTermForm && (
          <div className="p-3 border rounded bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Term Name</label>
                <Input
                  placeholder="e.g. Term 1"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newTermStart}
                  onChange={(e) => setNewTermStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">End Date</label>
                <Input
                  type="date"
                  value={newTermEnd}
                  onChange={(e) => setNewTermEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={handleCreateTerm} disabled={createTerm.isPending}>
                  {createTerm.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetTermForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Terms List */}
        {terms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No terms defined</p>
        ) : (
          <div className="space-y-1">
            {terms.map((term: any) => (
              <div key={term.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50">
                {editingTermId === term.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Name</label>
                      <Input
                        value={editTermName}
                        onChange={(e) => setEditTermName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Start</label>
                      <Input
                        type="date"
                        value={editTermStart}
                        onChange={(e) => setEditTermStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">End</label>
                      <Input
                        type="date"
                        value={editTermEnd}
                        onChange={(e) => setEditTermEnd(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button size="sm" onClick={() => handleUpdateTerm(term.id)} disabled={updateTerm.isPending}>
                        {updateTerm.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditTerm}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Circle className="w-2 h-2 fill-primary text-primary" />
                      <span className="text-sm font-medium">{term.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {term.start_date} → {term.end_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEditTerm(term)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTerm.mutate(term.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
