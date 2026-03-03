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
          Nouvel élève
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un élève</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l’élève. Les champs parent sont facultatifs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nom & Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prénom *</Label>
              <Input placeholder="Marie" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input placeholder="Dupont" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Niveau */}
          <div className="space-y-2">
            <Label>Niveau / Classe *</Label>
            <Input placeholder="6ème A" {...register("class_level")} />
            {errors.class_level && (
              <p className="text-sm text-destructive">{errors.class_level.message}</p>
            )}
          </div>

          {/* Genre + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre *</Label>
              <Select onValueChange={(v) => setValue("gender", v as "0" | "1")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Fille</SelectItem>
                  <SelectItem value="0">Garçon</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            
          </div>

          {/* Parent Contact Info */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Contact du parent/tuteur (facultatif)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone parent
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
                  Email parent
                </Label>
                <Input
                  type="email"
                  placeholder="parent@exemple.com"
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
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l’élève"
              )}
            </Button>
          </div>

          {createMutation.isError && (
            <p className="text-center text-sm text-destructive">
              Erreur lors de la création
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}