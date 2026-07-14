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
import { useSearchParents } from "@/hooks/use-search-parents";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { StudentImageCapture } from "@/components/students/student-image-capture";
import { NATIONALITY_OPTIONS } from "@/constants/nationalities";
import {
  ArrowLeft, Loader2, User, Users, Phone, Mail,
  CalendarDays, UserCheck, ImageIcon, School, MapPin, Globe2, BookOpen,
  Check, X
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
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [parentFound, setParentFound] = useState<any | null>(null);

  useEffect(() => {
    if (!user?.can?.('manage_students')) {
      router.push('/dashboard/students');
    }
  }, [user]);

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
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStudentData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "1",
      date_of_birth: "",
      place_of_birth: "",
      nationality: "Burundian",
      religion: "",
      father_full_name: "",
      father_phone_number: "",
      father_job_name: "",
      mother_full_name: "",
      mother_phone_number: "",
      mother_job_name: "",
      address_parent_quarter: "",
      address_parent_commune: "",
      address_parent_province: "",
      parent_first_name: "",
      parent_last_name: "",
      parent_relationship: "",
      parent_contact: "",
      parent_email: "",
      address: "",
    },
  });

  const parentContact = watch("parent_contact");
  const parentEmail = watch("parent_email");

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = (parentContact || parentEmail || "").trim();
      setDebouncedQuery(q.length >= 3 ? q : "");
    }, 600);
    return () => clearTimeout(timer);
  }, [parentContact, parentEmail]);

  const { data: searchResults, isLoading: parentSearching } = useSearchParents(debouncedQuery);

  useEffect(() => {
    if (searchResults && searchResults.length === 0 && debouncedQuery) {
      setParentFound(null);
    }
  }, [searchResults, debouncedQuery]);

  const handleYearChange = (v: string) => setSelectedYear(Number(v));
  const handleClassChange = (v: string) => setSelectedClass(Number(v));

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
      setStudentImage(null);
      setParentFound(null);
      router.push("/dashboard/students");
    } catch {
      // error handled via mutation state
    }
  };

  const isPending = createMutation.isPending || (canAssignClass && enrollMutation.isPending);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
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
        {/* Student info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Photo
              </Label>
              <StudentImageCapture
                value={studentImage || null}
                onChange={(file) => setStudentImage(file)}
              />
            </div>

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
                <Select
                  defaultValue="1"
                  onValueChange={(v) => setValue("gender", v as "0" | "1")}
                >
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
                  onValueChange={(v) => setValue("nationality", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITY_OPTIONS.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
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

            <Separator />
            <h3 className="text-sm font-medium text-muted-foreground">Father Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Jean Ndayisenga" {...register("father_full_name")} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                <Input placeholder="+243812345678" {...register("father_phone_number")} />
              </div>
              <div className="space-y-2">
                <Label>Job</Label>
                <Input placeholder="Teacher, Trader..." {...register("father_job_name")} />
              </div>
            </div>

            <Separator />
            <h3 className="text-sm font-medium text-muted-foreground">Mother Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Marie Ndayisenga" {...register("mother_full_name")} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                <Input placeholder="+243812345678" {...register("mother_phone_number")} />
              </div>
              <div className="space-y-2">
                <Label>Job</Label>
                <Input placeholder="Doctor, Banker..." {...register("mother_job_name")} />
              </div>
            </div>

            <Separator />
            <h3 className="text-sm font-medium text-muted-foreground">Student Residence Address</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Input placeholder="Rohero" {...register("address_parent_quarter")} />
              </div>
              <div className="space-y-2">
                <Label>Commune</Label>
                <Input placeholder="Mukaza" {...register("address_parent_commune")} />
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Input placeholder="Bujumbura Mairie" {...register("address_parent_province")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent / Guardian — Contact Person */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Parent / Guardian — Contact Person
            </CardTitle>
            <CardDescription>
              Enter the phone number or email to find an existing parent, or fill in the details to create a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(searchResults || []).length > 0 && !parentFound && (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Existing parent found
                </p>
                <div className="space-y-1">
                  {(searchResults || []).map((parent: any) => {
                    const fullName = `${parent.user?.first_name ?? ""} ${parent.user?.last_name ?? ""}`.trim() || "Unnamed";
                    return (
                      <button
                        key={parent.id}
                        type="button"
                        className="w-full text-left flex items-center justify-between p-2 rounded-md text-sm hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          setParentFound(parent);
                          setValue("parent_id", parent.id);
                          setValue("parent_first_name", parent.user?.first_name ?? "");
                          setValue("parent_last_name", parent.user?.last_name ?? "");
                          setValue("parent_contact", parent.phone_number ?? "");
                          setValue("parent_email", parent.user?.email ?? "");
                          setValue("address", parent.address ?? "");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {parent.phone_number && <><Phone className="h-3 w-3 inline mr-1" />{parent.phone_number}</>}
                            {parent.phone_number && parent.user?.email && " · "}
                            {parent.user?.email && <><Mail className="h-3 w-3 inline mr-1" />{parent.user.email}</>}
                          </span>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          <Check className="h-3 w-3 mr-1" /> Use this parent
                        </Button>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {parentSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching for existing parent...
              </div>
            )}

            {parentFound && (
              <div className="flex items-center justify-between rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>
                    Linked to existing parent: <strong>{parentFound.user?.first_name} {parentFound.user?.last_name}</strong>
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParentFound(null);
                    setValue("parent_id", undefined);
                    setValue("parent_first_name", "");
                    setValue("parent_last_name", "");
                    setValue("parent_contact", "");
                    setValue("parent_email", "");
                    setValue("address", "");
                  }}
                  className="text-muted-foreground h-auto py-1"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
            )}

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

            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="123 Main St, Bujumbura" {...register("address")} />
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
          </CardContent>
        </Card>

        {/* Enrollment */}
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
                    onValueChange={handleYearChange}
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
                    onValueChange={handleClassChange}
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/students")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[200px]">
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
