"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCreateAssessmentType, useGradingCategories } from "@/hooks/use-pedagogy"
import { assessmentTypeCreateSchema, AssessmentTypeCreate } from "@/types/pedagogy"
import toast from "react-hot-toast"
import { Loader2, Settings2 } from "lucide-react"

interface CreateAssessmentTypeDialogProps {
  isOpen: boolean
  onClose: () => void
  initialLevel?: string
}

export function CreateAssessmentTypeDialog({ isOpen, onClose, initialLevel = "all" }: CreateAssessmentTypeDialogProps) {
  const createMutation = useCreateAssessmentType()
  const { data: categories = [], isLoading: loadingCategories } = useGradingCategories()

  const form = useForm<AssessmentTypeCreate>({
    resolver: zodResolver(assessmentTypeCreateSchema),
    defaultValues: {
      code: "",
      label: "",
      category: "",
      level: initialLevel,
    },
  })

  const onSubmit = async (values: AssessmentTypeCreate) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success("Assessment Type created successfully!")
      form.reset()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to create assessment type")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <DialogTitle>New Assessment Type</DialogTitle>
          </div>
          <DialogDescription>
            Configure a new type of assessment (e.g. "Final Exam", "Daily Quiz") and assign it to a grading category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Quiz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="QZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grading Category</FormLabel>
                  <Select disabled={loadingCategories} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.label} ({cat.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="preschool">Preschool</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Type
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
