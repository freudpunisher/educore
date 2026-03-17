// src/components/students/enroll-student-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcademicYears, useClassRooms, useEnrollStudent } from "@/hooks/use-academic-data";
import { enrollmentCreateSchema, type EnrollmentCreate } from "@/types/enrollment";
import { Loader2, Calendar, School } from "lucide-react";

type Props = {
  studentId: number;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EnrollStudentDialog({ studentId, studentName, open, onOpenChange }: Props) {
  const { data: years = [], isLoading: loadingYears } = useAcademicYears();
  const { data: classrooms = [], isLoading: loadingClasses } = useClassRooms();
  const enrollMutation = useEnrollStudent();
  console.log(years)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnrollmentCreate>({
    resolver: zodResolver(enrollmentCreateSchema),
    defaultValues: {
      student: studentId,

    },
  });

  const selectedYear = watch("academic_year");

  const onSubmit = (data: EnrollmentCreate) => {
    enrollMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            {studentName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Select
              disabled={loadingYears}
              onValueChange={(v) => setValue("academic_year", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingYears ? "Loading..." : "Select Year"} />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.start_year} - {y.end_year} {y.is_current && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academic_year && (
              <p className="text-sm text-destructive">Year required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <Select
              disabled={loadingClasses || !selectedYear}
              onValueChange={(v) => setValue("class_room", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClasses ? "Loading..." : "Select Class"} />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.class_room && (
              <p className="text-sm text-destructive">Class required</p>
            )}
          </div>



          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}