"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { useCreateStudent } from "@/hooks/use-create-student";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { StudentImageCapture } from "@/components/students/student-image-capture";
import {
  ArrowLeft, Loader2, User, Users, Phone, Mail,
  CalendarDays, UserCheck, ImageIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function NewStudentPage() {
  const router = useRouter();
  const createMutation = useCreateStudent();
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
      parent_first_name: "",
      parent_last_name: "",
      parent_contact: "",
      parent_email: "",
    },
  });

  const onSubmit = (data: CreateStudentData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") formData.append(key, val as string);
    });
    if (studentImage) formData.append("image", studentImage);
    createMutation.mutate(formData as any, {
      onSuccess: () => {
        reset();
        router.push("/dashboard/students");
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/students")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Student</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the information below to register a new student.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Student Photo
            </CardTitle>
            <CardDescription>Upload a photo or take one with your webcam.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentImageCapture value={studentImage} onChange={setStudentImage} />
          </CardContent>
        </Card>

        {/* Student Info */}
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
                <Select onValueChange={(v) => setValue("gender", v as "0" | "1")}>
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
                <Input type="date" {...register("date_of_birth")} />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Info */}
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
              <Select onValueChange={(v) => setValue("parent_relationship", v as any)}>
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

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/students")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending} className="min-w-[140px]">
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Student"
            )}
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-center text-sm text-destructive font-medium">
            Failed to create student. Please check the form and try again.
          </p>
        )}
      </form>
    </div>
  );
}
