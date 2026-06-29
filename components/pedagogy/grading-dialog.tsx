"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEnrollments, useGrades, useCreateGrade, useAssessmentTypes } from "@/hooks/use-pedagogy"
import { Loader2, Save, GraduationCap } from "lucide-react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GradingDialogProps {
  isOpen: boolean
  onClose: () => void
  assessment: any
  classId: number
  classLevel?: string
}

export function GradingDialog({ isOpen, onClose, assessment, classId, classLevel }: GradingDialogProps) {
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useEnrollments(classId)
  const { data: existingGradesData, isLoading: loadingGrades } = useGrades(undefined, undefined, 1, undefined)
  const { data: types = [] } = useAssessmentTypes()
  const createGradeMutation = useCreateGrade()

  const assessmentType = useMemo(() => {
    if (!assessment?.assessment_type) return null
    return types.find((t: any) => t.id === assessment.assessment_type) || null
  }, [types, assessment])
  const categoryLabel = assessmentType?.category_label

  const [scores, setScores] = useState<Record<number, string>>({})
  const [comments, setComments] = useState<Record<number, string>>({})

  const enrollments = enrollmentsData?.results || []
  const existingGrades = existingGradesData?.results || []

  // Initialize scores with existing grades for this assessment
  useEffect(() => {
    if (isOpen && existingGrades.length > 0 && assessment) {
      const initialScores: Record<number, string> = {}
      const initialComments: Record<number, string> = {}
      
      existingGrades.forEach((g: any) => {
        if (g.assessment === assessment.id) {
          initialScores[g.enrollment] = g.score.toString()
          initialComments[g.enrollment] = g.comment || ""
        }
      })
      setScores(initialScores)
      setComments(initialComments)
    }
  }, [isOpen, existingGrades, assessment])

  const handleScoreChange = (enrollmentId: number, value: string) => {
    // Validate score doesn't exceed max_score
    const numValue = parseFloat(value)
    if (numValue > parseFloat(assessment.max_score)) {
      toast.error(`Score cannot exceed max score (${assessment.max_score})`)
      return
    }
    setScores(prev => ({ ...prev, [enrollmentId]: value }))
  }

  const handleSave = async () => {
    const promises = Object.entries(scores).map(([enrollmentId, score]) => {
      if (score === "" || score === null || score === undefined) return null
      return createGradeMutation.mutateAsync({
        enrollment: parseInt(enrollmentId),
        assessment: assessment.id,
        score: parseFloat(score),
        comment: comments[parseInt(enrollmentId)] || ""
      })
    }).filter(Boolean)

    if (promises.length === 0) {
      toast.error("Please enter at least one score.")
      return
    }

    try {
      await Promise.all(promises)
      toast.success("Grades saved successfully!")
      onClose()
    } catch (error: any) {
      toast.error("Some grades failed to save. Please check and try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <DialogTitle>Grading: {assessment?.title}</DialogTitle>
          </div>
          <DialogDescription className="flex items-center justify-between">
            <span>Enter scores for each student. Max Score: <strong>{assessment?.max_score}</strong></span>
            <div className="flex gap-1">
              {categoryLabel && <Badge variant="secondary">{categoryLabel}</Badge>}
              <Badge variant="outline">{assessment?.assessment_type_label}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto my-4 border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[250px]">Student Name</TableHead>
                <TableHead className="w-[120px]">Score / {assessment?.max_score}</TableHead>
                <TableHead>Comment (Optional)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEnrollments ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                    No students enrolled in this class.
                  </TableCell>
                </TableRow>
              ) : enrollments.map((enr: any) => (
                <TableRow key={enr.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{enr.student_name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{enr.enrollment_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {classLevel === 'preschool' ? (
                      <Select
                        value={scores[enr.id] || ""}
                        onValueChange={(val) => handleScoreChange(enr.id, val)}
                      >
                        <SelectTrigger className="w-32 h-10 font-medium">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={(parseFloat(assessment.max_score) * 0.95).toString()}>
                            <span className="flex items-center gap-1">🌟 Expert</span>
                          </SelectItem>
                          <SelectItem value={(parseFloat(assessment.max_score) * 0.80).toString()}>
                            <span className="flex items-center gap-1">✅ Mastered</span>
                          </SelectItem>
                          <SelectItem value={(parseFloat(assessment.max_score) * 0.65).toString()}>
                            <span className="flex items-center gap-1">🚧 Developing</span>
                          </SelectItem>
                          <SelectItem value={(parseFloat(assessment.max_score) * 0.40).toString()}>
                            <span className="flex items-center gap-1">❌ Emerging</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0"
                        value={scores[enr.id] || ""}
                        onChange={(e) => handleScoreChange(enr.id, e.target.value)}
                        className="w-24 font-mono font-bold"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="e.g. Excellent progress"
                      value={comments[enr.id] || ""}
                      onChange={(e) => setComments(prev => ({ ...prev, [enr.id]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={createGradeMutation.isPending}>
            {createGradeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Grades
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
