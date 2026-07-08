"use client";

import { useAuth } from "@/lib/auth-context";
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
import { useAcademicYears, useClassRooms, useEnrollStudent } from "@/hooks/use-academic-data";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { StudentImageCapture } from "@/components/students/student-image-capture";
import { NATIONALITY_OPTIONS } from "@/constants/nationalities";
import {
  ArrowLeft, Loader2, User, Users, Phone, Mail,
  CalendarDays, UserCheck, ImageIcon, School, MapPin, Globe2, BookOpen
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

export default function NewStudentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canAssignClass = user?.role === "academic_principal";
  const createMutation = useCreateStudent();
  const enrollMutation = useEnrollStudent();
  const { data: years = [], isLoading: loadingYears } = useAcademicYears();
  const { data: classrooms = [], isLoading: loadingClasses } = useClassRooms();

  useEffect(() => {
    if (!user?.can?.('users.manage')) {
      router.push('/dashboard/students');
    }
  }, [user]);
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      const current = years.find((y: any) => y.is_current);
      if (current) setSelectedYear(current.id);
    }
  }, [years, selectedYear]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateStudentData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      place_of_birth: "",
      nationality: "Burundian",
      religion: "",
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

  const onSubmit = async (data: CreateStudentData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") formData.append(key, val as string);
    });
    if (studentImage) formData.append("image", studentImage);
    try {
      const result: any = await createMutation.mutateAsync(formData as any);
      if (canAssignClass && selectedYear && selectedClass) {
        await enrollMutation.mutateAsync({
          student: result.id,
          academic_year: selectedYear,
          class_room: selectedClass,
        });
      }
      reset();
      router.push("/dashboard/students");
    } catch {
      // errors handled by mutation onError toasts
    }
  };

  const isPending = createMutation.isPending || (canAssignClass && enrollMutation.isPending);

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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Jean" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Middle Name</Label>
                <Input placeholder="(optional)" {...register("middle_name")} />
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
                    <SelectItem value="1">Male</SelectItem>
                    <SelectItem value="0">Female</SelectItem>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Place of Birth
                </Label>
                <Input placeholder="Bujumbura" {...register("place_of_birth")} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe2 className="h-3.5 w-3.5" />
                  Nationality
                </Label>
                <Select
                  defaultValue="Burundian"
                  onValueChange={(value) => setValue("nationality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITY_OPTIONS.map((nationality) => (
                      <SelectItem key={nationality.value} value={nationality.value}>
                        {nationality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  Religion
                </Label>
                <Input placeholder="Christian" {...register("religion")} />
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
                <Label>First Name</Label>
                <Input placeholder="Marc" {...register("parent_first_name")} />
                {errors.parent_first_name && (
                  <p className="text-sm text-destructive">{errors.parent_first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Dupont" {...register("parent_last_name")} />
                {errors.parent_last_name && (
                  <p className="text-sm text-destructive">{errors.parent_last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select onValueChange={(v) => setValue("parent_relationship", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="stepmother">Step mother</SelectItem>
                  <SelectItem value="stepfather">Step father</SelectItem>
                  <SelectItem value="brother">Brother</SelectItem>
                  <SelectItem value="sister">Sister</SelectItem>
                  <SelectItem value="uncle">Uncle</SelectItem>
                  <SelectItem value="aunt">Aunt</SelectItem>
                  <SelectItem value="grandfather">Grandfather</SelectItem>
                  <SelectItem value="grandmother">Grandmother</SelectItem>
                  <SelectItem value="cousin">Cousin</SelectItem>
                  <SelectItem value="nephew">Nephew</SelectItem>
                  <SelectItem value="niece">Niece</SelectItem>
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
                  <Phone className="h-3.5 w-3.5" /> Phone
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="text-sm font-medium">Father Details</div>
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="Jean" {...register("father_first_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Ndayisenga" {...register("father_last_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input placeholder="Trader, Engineer..." {...register("father_job_title")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </Label>
                    <Input placeholder="+243812345678" {...register("father_contact")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Label>
                    <Input type="email" placeholder="father@example.com" {...register("father_email")} />
                    {errors.father_email && (
                      <p className="text-sm text-destructive">{errors.father_email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="text-sm font-medium">Mother Details</div>
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="Marie" {...register("mother_first_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Ndayisenga" {...register("mother_last_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input placeholder="Doctor, Banker..." {...register("mother_job_title")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </Label>
                    <Input placeholder="+243812345678" {...register("mother_contact")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Label>
                    <Input type="email" placeholder="mother@example.com" {...register("mother_email")} />
                    {errors.mother_email && (
                      <p className="text-sm text-destructive">{errors.mother_email.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment — réservé au academic_principal */}
        {canAssignClass && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <School className="h-4 w-4 text-primary" />
                Enrollment
              </CardTitle>
              <CardDescription>Enroll the student in a class for the academic year.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year <span className="text-destructive">*</span></Label>
                  <Select
                    value={selectedYear ? String(selectedYear) : ""}
                    onValueChange={(v) => setSelectedYear(Number(v))}
                    disabled={loadingYears}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingYears ? "Loading..." : "Select Year"} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y: any) => (
                        <SelectItem key={y.id} value={String(y.id)}>
                          {y.start_year} - {y.end_year} {y.is_current ? "(Current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class <span className="text-destructive">*</span></Label>
                  <Select
                    value={selectedClass ? String(selectedClass) : ""}
                    onValueChange={(v) => setSelectedClass(Number(v))}
                    disabled={loadingClasses || !selectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingClasses ? "Loading..." : "Select Class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/students")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[140px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {createMutation.isPending ? "Creating..." : "Enrolling..."}
              </>
            ) : (
              "Create Student"
            )}
          </Button>
        </div>

        {(createMutation.isError || enrollMutation.isError) && (
          <p className="text-center text-sm text-destructive font-medium">
            {(() => {
              const errData = createMutation.error as any;
              const fieldErrors = errData?.response?.data?.errors;
              if (fieldErrors && typeof fieldErrors === "object") {
                return Object.entries(fieldErrors)
                  .map(([f, msgs]) =>
                    Array.isArray(msgs) ? `${f}: ${(msgs as string[]).join(", ")}` : `${f}: ${msgs}`
                  )
                  .join(" | ");
              }
              return errData?.response?.data?.message || "Failed to create student";
            })()}
          </p>
        )}
      </form>
    </div>
  );
}
