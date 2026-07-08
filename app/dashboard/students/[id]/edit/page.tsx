"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentDetail } from "@/hooks/use-students";
import { useUpdateStudent } from "@/hooks/use-update-student";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { StudentImageCapture } from "@/components/students/student-image-capture";
import {
  ArrowLeft, Loader2, User, Users, Phone, Mail,
  CalendarDays, UserCheck, ImageIcon, GraduationCap, AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  const studentId = id ? Number(id) : null;

  const { data: student, isLoading, error } = useStudentDetail(studentId);
  const updateMutation = useUpdateStudent(studentId!);
  const [studentImage, setStudentImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateStudentData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      parent_first_name: "",
      parent_last_name: "",
      parent_contact: "",
      parent_email: "",
      parent_job_title: "",
      parent_address_quarter: "",
      parent_address_commune: "",
      parent_address_province: "",
      father_first_name: "",
      father_last_name: "",
      father_contact: "",
      father_email: "",
      father_job_title: "",
      mother_first_name: "",
      mother_last_name: "",
      mother_contact: "",
      mother_email: "",
      mother_job_title: "",
    },
  });

  useEffect(() => {
    if (student) {
      const parent = student.parents_info?.[0];
      setValue("first_name", student.first_name ?? "");
      setValue("last_name", student.last_name ?? "");
      setValue("gender", String(student.gender ?? "") as "0" | "1");
      setValue("date_of_birth", student.date_of_birth
        ? new Date(student.date_of_birth).toISOString().split("T")[0]
        : "");
      setValue("parent_first_name", parent?.first_name ?? "");
      setValue("parent_last_name", parent?.last_name ?? "");
      setValue("parent_relationship", (parent?.relationship ?? "") as any);
      setValue("parent_contact", parent?.phone ?? parent?.phone_number ?? "");
      setValue("parent_email", parent?.email ?? "");
      setValue("parent_job_title", parent?.job_title ?? "");
      setValue("parent_address_quarter", student.address_quarter ?? parent?.address_quarter ?? "");
      setValue("parent_address_commune", student.address_commune ?? parent?.address_commune ?? "");
      setValue("parent_address_province", student.address_province ?? parent?.address_province ?? "");

      const fatherParts = (student.father_name ?? "").split(" ");
      setValue("father_first_name", fatherParts[0] ?? "");
      setValue("father_last_name", fatherParts.slice(1).join(" ") ?? "");
      setValue("father_contact", student.father_contact ?? "");
      setValue("father_job_title", student.father_job_title ?? "");

      const motherParts = (student.mother_name ?? "").split(" ");
      setValue("mother_first_name", motherParts[0] ?? "");
      setValue("mother_last_name", motherParts.slice(1).join(" ") ?? "");
      setValue("mother_contact", student.mother_contact ?? "");
      setValue("mother_email", student.mother_email ?? "");
      setValue("mother_job_title", student.mother_job_title ?? "");
    }
  }, [student, setValue]);

  const onSubmit = (data: CreateStudentData) => {
    if (!studentId) return;
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") formData.append(key, val as string);
    });
    if (studentImage) formData.append("image", studentImage);
    updateMutation.mutate(formData, {
      onSuccess: () => {
        router.push(`/dashboard/students/${studentId}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-5">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-muted" />
          <span className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <GraduationCap className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground tracking-wide text-sm uppercase">
            Loading Student
          </p>
          <p className="text-muted-foreground text-sm">
            Fetching student record…
          </p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-6 gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-destructive/8 border border-destructive/15 flex items-center justify-center">
            <AlertCircle className="h-9 w-9 text-destructive/70" />
          </div>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive/20 border-2 border-background" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Student record not found
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This record may have been removed or the link you followed is no longer valid.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border/60 hover:bg-muted/60 transition-colors"
          onClick={() => router.push("/dashboard/students")}
        >
          <ArrowLeft className="w-4 h-4" />
          Return to students
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/students/${studentId}`)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground text-sm">
            Update information for {student.full_name}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Student Photo
            </CardTitle>
            <CardDescription>Upload a new photo or take one with your webcam.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentImageCapture value={studentImage} onChange={setStudentImage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Student Information
            </CardTitle>
            <CardDescription>Basic personal details of the student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Jean" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Dupont" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5" />
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  defaultValue={String(student.gender ?? "") as "0" | "1"}
                  onValueChange={(v) => setValue("gender", v as "0" | "1")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Girl</SelectItem>
                    <SelectItem value="0">Boy</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  defaultValue={student.date_of_birth
                    ? new Date(student.date_of_birth).toISOString().split("T")[0]
                    : ""
                  }
                  {...register("date_of_birth")}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Parent / Guardian Details
            </CardTitle>
            <CardDescription>At least one parent or guardian contact is required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Marc" {...register("parent_first_name")} />
                {errors.parent_first_name && (
                  <p className="text-sm text-destructive">{errors.parent_first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Dupont" {...register("parent_last_name")} />
                {errors.parent_last_name && (
                  <p className="text-sm text-destructive">{errors.parent_last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Relationship <span className="text-destructive">*</span></Label>
              <Select
                defaultValue={student.parents_info?.[0]?.relationship ?? ""}
                onValueChange={(v) => setValue("parent_relationship", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.parent_relationship && (
                <p className="text-sm text-destructive">{errors.parent_relationship.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input placeholder="Teacher, Trader, Nurse..." {...register("parent_job_title")} />
                {errors.parent_job_title && (
                  <p className="text-sm text-destructive">{errors.parent_job_title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Input placeholder="Rohero" {...register("parent_address_quarter")} />
                {errors.parent_address_quarter && (
                  <p className="text-sm text-destructive">{errors.parent_address_quarter.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commune</Label>
                <Input placeholder="Mukaza" {...register("parent_address_commune")} />
                {errors.parent_address_commune && (
                  <p className="text-sm text-destructive">{errors.parent_address_commune.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Input placeholder="Bujumbura Mairie" {...register("parent_address_province")} />
                {errors.parent_address_province && (
                  <p className="text-sm text-destructive">{errors.parent_address_province.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> Phone <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="+243812345678" {...register("parent_contact")} />
                {errors.parent_contact && (
                  <p className="text-sm text-destructive">{errors.parent_contact.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  type="email"
                  placeholder="parent@example.com"
                  {...register("parent_email")}
                />
                {errors.parent_email && (
                  <p className="text-sm text-destructive">{errors.parent_email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/students/${studentId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending} className="min-w-[140px]">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {updateMutation.isError && (
          <p className="text-center text-sm text-destructive font-medium">
            Failed to update student. Please check the form and try again.
          </p>
        )}
      </form>
    </div>
  );
}
