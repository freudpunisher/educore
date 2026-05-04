"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCreateGrade, useAssessments, useEnrollments } from "@/hooks/use-pedagogy"
import { gradeCreateSchema } from "@/types/pedagogy"
import toast from "react-hot-toast"
import { Loader2, Info } from "lucide-react"

interface CreateGradeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateGradeDialog({ isOpen, onClose }: CreateGradeDialogProps) {
  const { data: assessmentsData, isLoading: loadingAssessments } = useAssessments()
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useEnrollments()
  const createMutation = useCreateGrade()

  const assessments = assessmentsData?.results || []
  const enrollments = enrollmentsData?.results || []

  const form = useForm<z.infer<typeof gradeCreateSchema>>({
    resolver: zodResolver(gradeCreateSchema),
    defaultValues: { score: "", comment: "" },
  })

  const watchedAssessmentId = form.watch("assessment")
  const selectedAssessment = assessments.find((a) => a.id === watchedAssessmentId)

  const onSubmit = async (values: z.infer<typeof gradeCreateSchema>) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success("Grade recorded successfully!")
      form.reset()
      onClose()
    } catch (error: any) {
      const detail =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(" ") ||
        error.message ||
        "Failed to record grade"
      toast.error(String(detail))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Record Grade</DialogTitle>
          <DialogDescription>
            Select a student and an assessment, then enter the score. If a grade already exists for this
            pair, it will be <strong>updated automatically</strong>.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Make sure the <strong>Assessment</strong> exists first — create it in the{" "}
            <strong>Assessments</strong> tab.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enrollment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Enrollment</FormLabel>
                  <Select
                    disabled={loadingEnrollments}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingEnrollments ? "Loading..." : "Select a student"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {enrollments.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No enrollments found</div>
                      )}
                      {enrollments.map((enr) => (
                        <SelectItem key={enr.id} value={enr.id.toString()}>
                          {enr.student_name} — {enr.academic_year_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment</FormLabel>
                  <Select
                    disabled={loadingAssessments}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingAssessments
                              ? "Loading..."
                              : assessments.length === 0
                              ? "No assessments — create one first"
                              : "Select an assessment"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assessments.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No assessments. Go to the Assessments tab to create one.
                        </div>
                      )}
                      {assessments.map((ast) => (
                        <SelectItem key={ast.id} value={ast.id.toString()}>
                          {ast.title} — {ast.course_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {selectedAssessment && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Max score: <strong>{selectedAssessment.max_score} pts</strong>
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Score{selectedAssessment ? ` (out of ${selectedAssessment.max_score})` : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={selectedAssessment ? parseFloat(selectedAssessment.max_score) : undefined}
                      placeholder={`e.g. ${selectedAssessment ? Math.round(parseFloat(selectedAssessment.max_score) * 0.85) : 85}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Comment (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add feedback for the student..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || assessments.length === 0}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Record Grade
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
