"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGrades } from "@/hooks/use-pedagogy"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentGradesDialogProps {
  enrollmentId: number
  studentName: string
  academicYearId?: number
  isOpen: boolean
  onClose: () => void
}

export function StudentGradesDialog({
  enrollmentId,
  studentName,
  academicYearId,
  isOpen,
  onClose,
}: StudentGradesDialogProps) {
  const { data: gradesData, isLoading } = useGrades(enrollmentId, academicYearId, 1, undefined)
  const grades = gradesData?.results || []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Grades Details - {studentName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No grades recorded for this student yet.
            </div>
          ) : (
            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade: any) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {grade.assessment_display}
                      </TableCell>
                      <TableCell>{grade.score}</TableCell>
                      <TableCell>
                        {grade.percentage !== undefined && grade.percentage !== null ? (
                          <Badge 
                            variant={grade.percentage >= 50 ? "secondary" : "destructive"}
                          >
                            {Number(grade.percentage).toFixed(1)}%
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate" title={grade.comment}>
                        {grade.comment || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
