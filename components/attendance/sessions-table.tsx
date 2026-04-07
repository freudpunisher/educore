// src/components/attendance/sessions-table.tsx
"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, Clock, Users, Lock, Unlock, BookOpen, Loader2 } from "lucide-react";

import { useAttendanceSessions, useCreateAttendanceSession } from "@/hooks/use-attendance-sessions";
import { useClassRooms } from "@/hooks/use-academic-data";
import { attendanceSessionCreateSchema } from "@/types/attendance";

export function AttendanceSessionsTable() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const { data, isLoading } = useAttendanceSessions();
  const { data: classrooms = [] } = useClassRooms();
  const createMutation = useCreateAttendanceSession();

  const sessions = data?.results || [];

  const form = useForm<z.infer<typeof attendanceSessionCreateSchema>>({
    resolver: zodResolver(attendanceSessionCreateSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      start_time: "08:00",
      end_time: "10:00",
      subject: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof attendanceSessionCreateSchema>) => {
    await createMutation.mutateAsync(values);
    setIsCreateOpen(false);
    form.reset();
  };

  const filtered = sessions.filter((s) =>
    `${s.classroom_name} ${s.subject || ""} ${format(new Date(s.date), "dd/MM/yyyy")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const goToSession = (id: number) => {
    router.push(`attendance/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une séance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle séance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle séance</DialogTitle>
              <DialogDescription>
                Remplissez les détails pour planifier une séance de présence.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classroom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classe</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir une classe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classrooms.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de début</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matière (Optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mathématiques" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Détails supplémentaires..."
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Créer la séance
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Calendar className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucune séance trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Date & Heure</TableHead>
                <TableHead className="font-bold">Classe</TableHead>
                <TableHead className="font-bold">Matière</TableHead>
                <TableHead className="font-bold">Présents</TableHead>
                <TableHead className="font-bold">Statut</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((session) => (
                <TableRow
                  key={session.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => goToSession(session.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {format(new Date(session.date), "EEEE dd MMMM", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time} → {session.end_time}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {session.classroom_name}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {session.subject ? (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{session.subject}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">{session.attendances_count}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={session.is_locked ? "destructive" : "default"} className="gap-1">
                      {session.is_locked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Verrouillée
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Ouverte
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSession(session.id);
                      }}
                    >
                      Prendre présence
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}