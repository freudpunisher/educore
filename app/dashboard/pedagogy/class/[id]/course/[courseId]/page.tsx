"use client"

import { useParams, useRouter } from "next/navigation"
import { useAssessments, useDeleteAssessment } from "@/hooks/use-pedagogy"
import { useAcademicYears, useTerms as useAcademicTerms } from "@/hooks/use-academic-data"
import { useClassRoom } from "@/hooks/use-academic-data"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Trash2,
} from "lucide-react"
import { useState, useMemo } from "react"
import Link from "next/link"
import axiosInstance from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { CreateAssessmentDialog } from "@/components/pedagogy/create-assessment-dialog"
import { GradingDialog } from "@/components/pedagogy/grading-dialog"

function useCourseDetail(courseId: number) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/config/courses/${courseId}/`)
      const payload = data?.status === "success" ? data.data : data
      return payload
    },
    enabled: !!courseId,
  })
}

function useTermsList() {
  return useQuery({
    queryKey: ["terms-list"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/terms/")
      return data?.results || data || []
    },
  })
}

export default function CourseAssessmentsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const courseId = params.courseId as string

  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedAssessmentToGrade, setSelectedAssessmentToGrade] = useState<any>(null)
  const [selectedAssessmentToEdit, setSelectedAssessmentToEdit] = useState<any>(null)
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null)

  const { data: classItem } = useClassRoom(classId)
  const { data: courseDetail, isLoading: loadingCourse } = useCourseDetail(parseInt(courseId))
  const { data: terms } = useTermsList()

  const { mutate: deleteAssessment, isPending: isDeleting } = useDeleteAssessment()

  const termId = selectedTerm && selectedTerm !== "all" ? parseInt(selectedTerm) : undefined

  const { data: assessmentData, isLoading: loadingAssessments, refetch: refetchAssessments } = useAssessments(parseInt(courseId), undefined, 1, undefined)

  // Filter by term client-side if selected (term filter on API requires academic_year, not term directly)
  const allAssessments = assessmentData?.results || []
  const assessments = useMemo(() => {
    if (!termId) return allAssessments
    return allAssessments.filter((a: any) => a.term === termId)
  }, [allAssessments, termId])

  // Stats
  const stats = useMemo(() => {
    const total = assessments.length
    const published = assessments.filter((a: any) => a.published).length
    const upcoming = assessments.filter((a: any) => {
      if (!a.date) return false
      return new Date(a.date) > new Date()
    }).length
    const past = assessments.filter((a: any) => {
      if (!a.date) return false
      return new Date(a.date) <= new Date()
    }).length
    return { total, published, upcoming, past }
  }, [assessments])

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold">
              {courseDetail?.name || courseDetail?.code || `Course #${courseId}`}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded mr-2">
                {courseDetail?.code}
              </span>
              Assessments —{" "}
              <Link
                href={`/dashboard/pedagogy/class/${classId}`}
                className="text-primary hover:underline"
              >
                {classItem?.name}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {terms?.map((term: any) => (
                <SelectItem key={term.id} value={term.id.toString()}>
                  {term.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateOpen(true)}>
            <ClipboardList className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      <CreateAssessmentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialCourseId={parseInt(courseId)}
        initialTermId={termId}
        classLevel={classItem?.level}
        classId={parseInt(classId)}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <ClipboardList className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground mt-1">Visible to students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled ahead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Past</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.past}</div>
            <p className="text-xs text-muted-foreground mt-1">Already completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments List</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAssessments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No assessments for this course</p>
              <p className="text-sm mt-1">Assessments will appear here once created by the teacher.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment: any) => {
                    const isUpcoming = assessment.date && new Date(assessment.date) > new Date()
                    const isPast = assessment.date && new Date(assessment.date) <= new Date()
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assessment.assessment_type_label || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {assessment.term_display || "-"}
                        </TableCell>
                        <TableCell>
                          {assessment.date ? (
                            <span className={isUpcoming ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                              {new Date(assessment.date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">No date</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{assessment.max_score}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {assessment.has_grades ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 w-fit">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Graded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-50 w-fit">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!assessment.has_grades && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssessmentToEdit(assessment)
                                  setIsEditOpen(true)
                                }}
                                className="text-muted-foreground hover:text-primary h-8"
                              >
                                <ClipboardList className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            )}
                            {!assessment.has_grades && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssessmentToDelete(assessment)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 border-destructive/20"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssessmentToGrade(assessment)}
                              className="bg-primary/5 text-primary hover:bg-primary/10 h-8 border-primary/20"
                            >
                              <GraduationCap className="w-4 h-4 mr-1" />
                              Grade
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <GradingDialog 
        isOpen={!!selectedAssessmentToGrade}
        onClose={() => {
          setSelectedAssessmentToGrade(null)
          refetchAssessments()
        }}
        assessment={selectedAssessmentToGrade}
        classId={parseInt(classId)}
        classLevel={classItem?.level}
      />

      <CreateAssessmentDialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedAssessmentToEdit(null)
        }}
        assessment={selectedAssessmentToEdit}
        initialCourseId={parseInt(courseId)}
        initialTermId={termId}
        classLevel={classItem?.level}
        classId={parseInt(classId)}
      />

      <AlertDialog open={!!assessmentToDelete} onOpenChange={(open) => !open && setAssessmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assessment "{assessmentToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (assessmentToDelete) {
                  deleteAssessment(assessmentToDelete.id, {
                    onSuccess: () => {
                      toast.success("Assessment deleted successfully")
                      setAssessmentToDelete(null)
                      refetchAssessments()
                    },
                    onError: () => {
                      toast.error("Failed to delete assessment")
                    }
                  })
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
