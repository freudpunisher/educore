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
import { useAcademicYears, useClassRooms, useEnrollStudent, useClassroomFeesPreview } from "@/hooks/use-academic-data";
import { enrollmentCreateSchema, type EnrollmentCreate } from "@/types/enrollment";
import { Loader2, Calendar, School, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const selectedClass = watch("class_room");

  const { data: feesPreview, isLoading: loadingFees } = useClassroomFeesPreview(selectedClass || null);

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

          {selectedClass && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between pb-1 border-b">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Expected Fees Preview
                </Label>
                {loadingFees && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {feesPreview?.fees.map((fee, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-foreground leading-none mb-1">{fee.label}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{fee.assignment || "Academic Fee"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-black text-foreground">{Number(fee.amount).toLocaleString()} FBU</p>
                    </div>
                  </div>
                ))}

                {feesPreview?.fees.length === 0 && !loadingFees && (
                  <div className="py-8 text-center border-2 border-dashed rounded-2xl opacity-40">
                    <p className="text-xs font-bold">No fees configured for this class</p>
                  </div>
                )}
              </div>

              {feesPreview?.notice && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400">
                  <p className="text-[10px] font-bold leading-relaxed">
                    <span className="uppercase mr-1">Note:</span>
                    {feesPreview.notice}
                  </p>
                </div>
              )}
            </div>
          )}



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