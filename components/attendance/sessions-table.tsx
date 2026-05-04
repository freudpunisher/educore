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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Lock,
  Unlock,
  BookOpen,
  Loader2,
  GraduationCap,
  School,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

import {
  useAttendanceSessions,
  useCreateAttendanceSession,
  useLockSession,
  useUnlockSession,
} from "@/hooks/use-attendance-sessions";
import { useClassRooms } from "@/hooks/use-academic-data";
import { attendanceSessionCreateSchema } from "@/types/attendance";

const SESSION_TYPE_CONFIG = {
  course: {
    label: "Cours",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    badgeVariant: "secondary" as const,
  },
  exam: {
    label: "Examen",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    badgeVariant: "secondary" as const,
  },
  school: {
    label: "École",
    icon: School,
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    badgeVariant: "secondary" as const,
  },
  other: {
    label: "Autre",
    icon: Calendar,
    color: "bg-gray-100 text-gray-700",
    badgeVariant: "secondary" as const,
  },
};

export function AttendanceSessionsTable() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const { data, isLoading } = useAttendanceSessions();
  const { data: classrooms = [] } = useClassRooms();
  const createMutation = useCreateAttendanceSession();
  const lockMutation = useLockSession();
  const unlockMutation = useUnlockSession();

  const sessions = data?.results || [];

  const form = useForm<z.infer<typeof attendanceSessionCreateSchema>>({
    resolver: zodResolver(attendanceSessionCreateSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      start_time: "08:00",
      end_time: "10:00",
      session_type: "course",
      late_threshold_minutes: 10,
      subject: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof attendanceSessionCreateSchema>) => {
    await createMutation.mutateAsync(values);
    setIsCreateOpen(false);
    form.reset();
  };

  // Filter by tab + search
  const filtered = sessions.filter((s) => {
    const matchTab = activeTab === "all" || s.session_type === activeTab;
    const matchSearch = `${s.classroom_name} ${s.subject || ""} ${format(
      new Date(s.date),
      "dd/MM/yyyy"
    )}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Counts per type
  const counts = {
    all: sessions.length,
    course: sessions.filter((s) => s.session_type === "course").length,
    exam: sessions.filter((s) => s.session_type === "exam").length,
    school: sessions.filter((s) => s.session_type === "school").length,
  };

  // Global stats
  const totalPresent = sessions.reduce((acc, s) => acc + (s.stats?.present || 0), 0);
  const totalAbsent = sessions.reduce((acc, s) => acc + (s.stats?.absent || 0), 0);
  const totalLate = sessions.reduce((acc, s) => acc + (s.stats?.late || 0), 0);

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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{sessions.length}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Total séances</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalPresent}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Présences</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalAbsent}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Absences</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalLate}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Retards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="h-11">
            <TabsTrigger value="all" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Toutes{" "}
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="course" className="gap-2">
              <BookOpen className="w-4 h-4" /> Cours{" "}
              <Badge variant="secondary" className="ml-1">{counts.course}</Badge>
            </TabsTrigger>
            <TabsTrigger value="exam" className="gap-2">
              <GraduationCap className="w-4 h-4" /> Examens{" "}
              <Badge variant="secondary" className="ml-1">{counts.exam}</Badge>
            </TabsTrigger>
            <TabsTrigger value="school" className="gap-2">
              <School className="w-4 h-4" /> École{" "}
              <Badge variant="secondary" className="ml-1">{counts.school}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-11 shrink-0">
                  <Plus className="w-4 h-4" />
                  Nouvelle séance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle séance</DialogTitle>
                  <DialogDescription>
                    Planifiez une séance de cours, examen ou autre.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Type + Classe */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="session_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de séance</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="course">📚 Cours</SelectItem>
                                <SelectItem value="exam">📝 Examen / Test</SelectItem>
                                <SelectItem value="school">🏫 Présence École</SelectItem>
                                <SelectItem value="other">📋 Autre</SelectItem>
                              </SelectContent>
                            </Select>
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

                    {/* Date + Seuil retard */}
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
                        name="late_threshold_minutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seuil retard (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={60}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Heures */}
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
                            <Input
                              placeholder="Ex: Mathématiques, Français..."
                              {...field}
                            />
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
                              placeholder="Détails..."
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Annuler
                      </Button>
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
        </div>

        {/* Table content for all tabs */}
        {(["all", "course", "exam", "school", "other"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="text-center py-20">
                  <Calendar className="w-20 h-20 mx-auto text-muted-foreground mb-4 opacity-30" />
                  <p className="text-xl text-muted-foreground">
                    Aucune séance trouvée
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez votre première séance avec le bouton ci-dessus.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Date & Heure</TableHead>
                      <TableHead className="font-semibold">Classe</TableHead>
                      <TableHead className="font-semibold">Matière</TableHead>
                      <TableHead className="font-semibold">Présences</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="text-right font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((session) => {
                      const typeConfig =
                        SESSION_TYPE_CONFIG[
                          (session.session_type || "course") as keyof typeof SESSION_TYPE_CONFIG
                        ] || SESSION_TYPE_CONFIG.other;
                      const TypeIcon = typeConfig.icon;

                      return (
                        <TableRow
                          key={session.id}
                          className="hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={() => goToSession(session.id)}
                        >
                          {/* Type */}
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${typeConfig.color}`}
                            >
                              <TypeIcon className="w-3.5 h-3.5" />
                              {typeConfig.label}
                            </span>
                          </TableCell>

                          {/* Date & Time */}
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary shrink-0" />
                              <div>
                                <p className="font-semibold text-sm">
                                  {format(new Date(session.date), "EEE dd MMM", {
                                    locale: fr,
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {session.start_time} → {session.end_time}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Classe */}
                          <TableCell>
                            <Badge variant="secondary" className="font-medium">
                              {session.classroom_name}
                            </Badge>
                          </TableCell>

                          {/* Matière */}
                          <TableCell>
                            {session.subject ? (
                              <span className="font-medium text-sm">
                                {session.subject}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>

                          {/* Présences */}
                          <TableCell>
                            {session.stats && session.stats.total > 0 ? (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-green-600 font-semibold">
                                  ✓{session.stats.present}
                                </span>
                                <span className="text-red-500">
                                  ✗{session.stats.absent}
                                </span>
                                {session.stats.late > 0 && (
                                  <span className="text-amber-500">
                                    ⏱{session.stats.late}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <Users className="w-3.5 h-3.5" />
                                <span>{session.attendances_count}</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Statut */}
                          <TableCell>
                            <Badge
                              variant={session.is_locked ? "destructive" : "default"}
                              className="gap-1 text-xs"
                            >
                              {session.is_locked ? (
                                <>
                                  <Lock className="w-3 h-3" /> Verrouillée
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" /> Ouverte
                                </>
                              )}
                            </Badge>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title={session.is_locked ? "Déverrouiller" : "Verrouiller"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  session.is_locked
                                    ? unlockMutation.mutate(session.id)
                                    : lockMutation.mutate(session.id);
                                }}
                              >
                                {session.is_locked ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToSession(session.id);
                                }}
                                disabled={session.is_locked}
                              >
                                {session.is_locked ? "Voir" : "Prendre présence"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}