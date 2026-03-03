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
          <DialogTitle>Inscrire l'élève</DialogTitle>
          <DialogDescription>
            {studentName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Année scolaire</Label>
            <Select
              disabled={loadingYears}
              onValueChange={(v) => setValue("academic_year", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingYears ? "Chargement..." : "Choisir l'année"} />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.start_year} - {y.end_year} {y.is_current && "(Actuelle)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academic_year && (
              <p className="text-sm text-destructive">Année requise</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Classe</Label>
            <Select
              disabled={loadingClasses || !selectedYear}
              onValueChange={(v) => setValue("class_room", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClasses ? "Chargement..." : "Choisir la classe"} />
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
              <p className="text-sm text-destructive">Classe requise</p>
            )}
          </div>

          

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                "Inscrire"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}