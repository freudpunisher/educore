// src/components/students/create-student-dialog.tsx
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
  DialogTrigger,
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
import { useCreateStudent } from "@/hooks/use-create-student";
import { useSearchParents } from "@/hooks/use-search-parents";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { Loader2, Plus, Phone, Mail, User, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateStudent();
  const [parentFound, setParentFound] = useState<any | null>(null);

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
      parent_first_name: "",
      parent_last_name: "",
      parent_contact: "",
      parent_email: "",
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

  const onSubmit = (data: CreateStudentData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setParentFound(null);
        setDebouncedQuery("");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Student
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Fill in student information. Parent fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nom & Prénom */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input placeholder="Jane" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input placeholder="(optional)" {...register("middle_name")} />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input placeholder="Doe" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Genre + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select onValueChange={(v) => setValue("gender", v as "0" | "1")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
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
              <Label>Date of Birth</Label>
              <Input type="date" {...register("date_of_birth")} />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>
          </div>

          {/* Parent Info */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Parent / Guardian Details *
            </h4>

            {(searchResults || []).length > 0 && !parentFound && (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
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
        setDebouncedQuery("");
                    setValue("parent_id", undefined);
                    setValue("parent_first_name", "");
                    setValue("parent_last_name", "");
                    setValue("parent_contact", "");
                    setValue("parent_email", "");
                  }}
                  className="text-muted-foreground h-auto py-1"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent First Name *</Label>
                <Input placeholder="John" {...register("parent_first_name")} />
                {errors.parent_first_name && (
                  <p className="text-sm text-destructive">{errors.parent_first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Parent Last Name *</Label>
                <Input placeholder="Doe" {...register("parent_last_name")} />
                {errors.parent_last_name && (
                  <p className="text-sm text-destructive">{errors.parent_last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Relationship *</Label>
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
                  <Phone className="w-4 h-4" />
                  Parent Phone *
                </Label>
                <Input
                  placeholder="+243812345678"
                  {...register("parent_contact")}
                />
                {errors.parent_contact && (
                  <p className="text-sm text-destructive">
                    {errors.parent_contact.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Parent Email *
                </Label>
                <Input
                  type="email"
                  placeholder="parent@example.com"
                  {...register("parent_email")}
                />
                {errors.parent_email && (
                  <p className="text-sm text-destructive">
                    {errors.parent_email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
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
              Failed to create student. Please try again.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}