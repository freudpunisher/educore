"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCreateAssessment, useAssessmentTypes, useTerms, useCourses } from "@/hooks/use-pedagogy"
import { assessmentCreateSchema, AssessmentCreate } from "@/types/pedagogy"
import toast from "react-hot-toast"
import { Loader2, ClipboardList } from "lucide-react"

interface CreateAssessmentDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateAssessmentDialog({ isOpen, onClose }: CreateAssessmentDialogProps) {
  const { data: coursesData, isLoading: loadingCourses } = useCourses()
  const { data: terms, isLoading: loadingTerms } = useTerms()
  const { data: types, isLoading: loadingTypes } = useAssessmentTypes()
  const createMutation = useCreateAssessment()

  const courses = coursesData?.results || []

  const form = useForm<AssessmentCreate>({
    resolver: zodResolver(assessmentCreateSchema),
    defaultValues: {
      title: "",
      max_score: "100",
      date: "",
    },
  })

  const onSubmit = async (values: AssessmentCreate) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success("Assessment created successfully!")
      form.reset()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to create assessment")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <DialogTitle>Create Assessment</DialogTitle>
          </div>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course (Section)</FormLabel>
                    <Select disabled={loadingCourses} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name || c.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                    <FormLabel>Type</FormLabel>
                    <Select disabled={loadingTypes} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(types || []).map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.label} ({t.weight}%)
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
  )
}
