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
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import { Loader2, Plus, Phone, Mail } from "lucide-react";
import { useState } from "react";

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateStudent();

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
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input placeholder="Jane" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
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