"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useMemo, useState, useEffect } from "react"
import { useCreateAssessment, useUpdateAssessment, useAssessmentTypes, useTerms, useCourses } from "@/hooks/use-pedagogy"
import { assessmentCreateSchema, AssessmentCreate } from "@/types/pedagogy"
import toast from "react-hot-toast"
import { Loader2, ClipboardList, Plus } from "lucide-react"
import { CreateAssessmentTypeDialog } from "./create-assessment-type-dialog"

interface CreateAssessmentDialogProps {
  isOpen: boolean
  onClose: () => void
  initialCourseId?: number
  initialTermId?: number
  classLevel?: string
  classId?: number
  assessment?: any // For editing
}

export function CreateAssessmentDialog({ isOpen, onClose, initialCourseId, initialTermId, classLevel, classId, assessment }: CreateAssessmentDialogProps) {
  const { data: coursesData, isLoading: loadingCourses } = useCourses(classId)
  const { data: terms, isLoading: loadingTerms } = useTerms()
  const { data: types = [], isLoading: loadingTypes } = useAssessmentTypes()
  const createMutation = useCreateAssessment()
  const updateMutation = useUpdateAssessment()
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)

  const courses = coursesData?.results || []

  // Filter types based on class level
  const filteredTypes = useMemo(() => {
    if (!classLevel || types.length === 0) return types
    return types.filter((t: any) => !t.level || t.level === "all" || t.level === classLevel)
  }, [types, classLevel])

  const form = useForm<AssessmentCreate>({
    resolver: zodResolver(assessmentCreateSchema),
    defaultValues: {
      title: "",
      max_score: "100",
      date: "",
      course: initialCourseId,
      term: initialTermId,
    },
  })

  // Reset form when assessment changes (for editing)
  useEffect(() => {
    if (isOpen) {
      if (assessment) {
        form.reset({
          title: assessment.title,
          max_score: assessment.max_score?.toString() || "100",
          date: assessment.date || "",
          course: assessment.course,
          term: assessment.term,
          assessment_type: assessment.assessment_type,
        })
      } else {
        form.reset({
          title: "",
          max_score: "100",
          date: "",
          course: initialCourseId,
          term: initialTermId,
        })
      }
    }
  }, [isOpen, assessment, initialCourseId, initialTermId, form])

  const onSubmit = async (data: AssessmentCreate) => {
    try {
      if (assessment?.id) {
        await updateMutation.mutateAsync({ id: assessment.id, data })
        toast.success("Assessment updated successfully")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Assessment created successfully")
      }
      form.reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {assessment ? "Edit Assessment" : "Create New Assessment"}
          </DialogTitle>
          <DialogDescription>
            Create an assessment (quiz, test, exam…) for a course and term. Students can then be graded on this assessment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Midterm Exam, Chapter 3 Quiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => {
                  const selectedCourse = courses.find((c: any) => c.id === field.value)
                  return (
                    <FormItem>
                      <FormLabel>Course (Section)</FormLabel>
                      <Select
                        disabled={loadingCourses || !!initialCourseId}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedCourse ? `${selectedCourse.name || selectedCourse.code}` : "Select course"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name || c.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select disabled={loadingTerms} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(terms || []).map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assessment_type"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Type</FormLabel>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-1.5 text-[10px] text-primary"
                          onClick={() => setIsTypeDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> New Type
                        </Button>
                      </div>
                      <Select 
                        disabled={loadingTypes} 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {loadingTypes ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Loading types...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder={filteredTypes.length === 0 ? "No types for this level" : "Select type"} />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredTypes.length > 0 ? (
                            filteredTypes.map((t: any) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{t.label}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{t.code}{t.category_label ? ` — ${t.category_label}` : ''}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="py-6 px-2 text-center">
                              <p className="text-sm text-muted-foreground">No assessment types found for {classLevel || 'this level'}.</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Please ensure types are configured in the system.</p>
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Assessment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <CreateAssessmentTypeDialog 
      isOpen={isTypeDialogOpen}
      onClose={() => setIsTypeDialogOpen(false)}
      initialLevel={classLevel}
    />
    </>
  )
}
