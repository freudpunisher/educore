// src/components/attendance/create-session-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import toast from "react-hot-toast";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useClassRooms } from "@/hooks/use-academic-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Plus, Clock, Calendar, BookOpen, Users, Loader2 } from "lucide-react";
import { useState } from "react";

// Schema — classroom is number
const createSessionSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
  classroom: z.number(), // ← number, not string
  subject: z.string().optional(),
  description: z.string().optional(),
});

type CreateSessionData = z.infer<typeof createSessionSchema>;

export function CreateSessionDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: classrooms = [], isLoading: loadingClasses } = useClassRooms();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSessionData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      start_time: "08:00",
      end_time: "10:00",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateSessionData) => {
      const res = await axiosInstance.post("/academics/attendance-sessions/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Séance créée avec succès !");
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail || "Erreur lors de la création";
      toast.error(msg);
    },
  });

  const onSubmit = (data: CreateSessionData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle séance
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer une séance de présence</DialogTitle>
          <DialogDescription>
            Configurez la date, l’heure et la classe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Début
              </Label>
              <Input type="time" {...register("start_time")} />
              {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Fin
              </Label>
              <Input type="time" {...register("end_time")} />
              {errors.end_time && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
            </div>
          </div>

          {/* Classroom — Fixed line */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Classe
            </Label>
            <Select
              disabled={loadingClasses}
              onValueChange={(value) => setValue("classroom", Number(value))} // ← Number(value)
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClasses ? "Chargement..." : "Choisir une classe"} />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classroom && <p className="text-sm text-destructive">La classe est requise</p>}
          </div>

          {/* Subject & Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Matière (facultatif)
            </Label>
            <Input placeholder="Mathématiques..." {...register("subject")} />
          </div>

          <div className="space-y-2">
            <Label>Description (facultatif)</Label>
            <Textarea
              placeholder="Contrôle, sortie..."
              {...register("description")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer la séance"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}