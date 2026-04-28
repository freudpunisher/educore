"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search, UserCheck, UserX, AlertCircle, CalendarDays,
  Clock, School, FileText, XCircle, CheckCircle2, Loader2,
  Timer, Save, Lock, ChevronLeft, Users, BarChart3,
} from "lucide-react";

import { useAttendanceSessionDetail, useBulkMarkAttendance } from "@/hooks/use-attendance-sessions";
import { useStudentsByClassLevel } from "@/hooks/use-discipline";
import { AttendanceStatusValues, type AttendanceStatusType, type BulkAttendanceItem } from "@/types/attendance";

const STATUS_CONFIG = {
  present: {
    label: "Présent",
    icon: CheckCircle2,
    color: "border-green-500 bg-green-50 dark:bg-green-950/30",
    avatarClass: "bg-green-600 text-white",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    buttonVariant: "default" as const,
  },
  absent: {
    label: "Absent",
    icon: XCircle,
    color: "border-red-500 bg-red-50 dark:bg-red-950/30",
    avatarClass: "bg-red-600 text-white",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    buttonVariant: "destructive" as const,
  },
  late: {
    label: "En retard",
    icon: Timer,
    color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    avatarClass: "bg-amber-600 text-white",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    buttonVariant: "secondary" as const,
  },
  excused: {
    label: "Justifié",
    icon: AlertCircle,
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    avatarClass: "bg-blue-600 text-white",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    buttonVariant: "outline" as const,
  },
  authorized: {
    label: "Autorisé",
    icon: UserCheck,
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
    avatarClass: "bg-purple-600 text-white",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    buttonVariant: "outline" as const,
  },
};

const JUSTIFICATION_OPTIONS = [
  "Maladie",
  "Permission familiale",
  "Rendez-vous médical",
  "Problème de transport",
  "Décès dans la famille",
  "Compétition scolaire",
  "Autre",
];

interface AttendanceRecord {
  status: AttendanceStatusType;
  lateness_minutes: number;
  notes: string;
  justification?: string;
}

export default function TakeAttendancePage() {
  const { id } = useParams();
  const router = useRouter();
  const sessionId = Number(id);

  const { data: session, isLoading: sessionLoading } = useAttendanceSessionDetail(id as string);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useStudentsByClassLevel(
    session?.classroom || null,
    !!session?.classroom
  );
  const bulkMark = useBulkMarkAttendance();

  const [records, setRecords] = useState<Record<number, AttendanceRecord>>({});
  const [search, setSearch] = useState("");
  const [latenessDialog, setLatenessDialog] = useState<{ open: boolean; studentId: number | null }>({
    open: false, studentId: null,
  });
  const [justifyDialog, setJustifyDialog] = useState<{ open: boolean; studentId: number | null }>({
    open: false, studentId: null,
  });
  const [tempLateness, setTempLateness] = useState<string>("10");
  const [tempJustification, setTempJustification] = useState<string>("");
  const [tempNotes, setTempNotes] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  // Initialise tous les élèves à "present" dès le chargement
  useEffect(() => {
    if (enrollments.length > 0 && Object.keys(records).length === 0) {
      const initial: Record<number, AttendanceRecord> = {};
      enrollments.forEach((enr) => {
        initial[enr.student.id] = { status: "present", lateness_minutes: 0, notes: "" };
      });
      setRecords(initial);
    }
  }, [enrollments]);

  const updateStatus = useCallback(
    (studentId: number, status: AttendanceStatusType, extra?: Partial<AttendanceRecord>) => {
      setRecords((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status,
          lateness_minutes: status === "late" ? (extra?.lateness_minutes ?? 10) : 0,
          notes: extra?.notes ?? prev[studentId]?.notes ?? "",
          justification: extra?.justification ?? prev[studentId]?.justification,
        },
      }));
      setIsSaved(false);
    },
    []
  );

  const handleSaveLateness = () => {
    if (latenessDialog.studentId === null) return;
    updateStatus(latenessDialog.studentId, "late", {
      lateness_minutes: parseInt(tempLateness) || 10,
      notes: tempNotes,
    });
    setLatenessDialog({ open: false, studentId: null });
    setTempLateness("10");
    setTempNotes("");
  };

  const handleSaveJustification = () => {
    if (justifyDialog.studentId === null) return;
    updateStatus(justifyDialog.studentId, "excused", {
      notes: tempJustification ? `${tempJustification}${tempNotes ? " — " + tempNotes : ""}` : tempNotes,
      justification: tempJustification,
    });
    setJustifyDialog({ open: false, studentId: null });
    setTempJustification("");
    setTempNotes("");
  };

  const handleFinish = async () => {
    if (!session) return;

    const attendances: BulkAttendanceItem[] = enrollments.map((enr) => {
      const rec = records[enr.student.id] || { status: "present", lateness_minutes: 0, notes: "" };
      return {
        student: enr.student.id,
        enrollment: enr.id,
        status: rec.status,
        lateness_minutes: rec.lateness_minutes,
        notes: rec.notes,
      };
    });

    await bulkMark.mutateAsync({ session_id: sessionId, attendances });
    setIsSaved(true);
  };

  const filtered = enrollments.filter((enr) =>
    enr.student.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present: Object.values(records).filter((r) => r.status === "present").length,
    absent: Object.values(records).filter((r) => r.status === "absent").length,
    late: Object.values(records).filter((r) => r.status === "late").length,
    excused: Object.values(records).filter((r) => r.status === "excused" || r.status === "authorized").length,
    total: enrollments.length,
  };

  const attendanceRate = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  if (sessionLoading || enrollmentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="relative">
          <Loader2 className="w-14 h-14 animate-spin text-primary" />
          <School className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground animate-pulse">Chargement de la séance...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Séance introuvable</h2>
        <p className="text-muted-foreground mt-2">Impossible de trouver cette séance.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 pb-32">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ChevronLeft className="w-4 h-4" /> Retour aux séances
        </Button>

        {/* Hero Header */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <School className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Prise de présence</h1>
                    <p className="text-indigo-200 text-sm">
                      {session.session_type_display || "Cours"}
                      {session.is_locked && (
                        <Badge className="ml-2 bg-red-500/80 text-white border-0 gap-1">
                          <Lock className="w-3 h-3" /> Verrouillée
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-semibold">
                  {session.classroom_name}
                  {session.subject && <span className="font-normal opacity-80"> · {session.subject}</span>}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-indigo-100">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {format(new Date(session.date), "EEEE dd MMMM yyyy", { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {session.start_time} – {session.end_time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    Retard après {session.late_threshold_minutes || 10} min
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 shrink-0">
                {[
                  { label: "Présents", value: stats.present, icon: CheckCircle2, color: "bg-green-500/30" },
                  { label: "Absents", value: stats.absent, icon: XCircle, color: "bg-red-500/30" },
                  { label: "Retards", value: stats.late, icon: Timer, color: "bg-amber-500/30" },
                  { label: "Justifiés", value: stats.excused, icon: FileText, color: "bg-blue-500/30" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`${color} backdrop-blur rounded-xl p-3 text-center`}>
                    <Icon className="w-5 h-5 mx-auto mb-1 opacity-90" />
                    <p className="text-2xl font-bold leading-none">{value}</p>
                    <p className="text-xs opacity-80 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance rate bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-indigo-200 mb-1">
                <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Taux de présence</span>
                <span className="font-bold">{attendanceRate}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Search + Counters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un élève..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filtered.length} élève(s)</span>
          </div>
        </div>

        {/* Students Grid */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-16">
              <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="text-muted-foreground">Aucun élève trouvé pour cette classe.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((enr) => {
              const record = records[enr.student.id] || { status: "present" as AttendanceStatusType, lateness_minutes: 0, notes: "" };
              const status = record.status;
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.present;
              const StatusIcon = cfg.icon;
              const initials = (enr.student.full_name || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card
                  key={enr.student.id}
                  className={`border-2 transition-all duration-200 hover:shadow-lg ${cfg.color} ${session.is_locked ? "opacity-75" : ""}`}
                >
                  <CardContent className="p-5">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-800 shrink-0">
                        <AvatarFallback className={`text-sm font-bold ${cfg.avatarClass}`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">
                          {enr.student.full_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {enr.student.enrollment_number || ""}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${cfg.badgeClass}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                      {record.lateness_minutes > 0 && (
                        <span className="text-xs text-amber-600 font-medium">
                          +{record.lateness_minutes} min
                        </span>
                      )}
                    </div>

                    {/* Justification note */}
                    {record.notes && (
                      <p className="text-xs text-muted-foreground italic mb-3 truncate">
                        📝 {record.notes}
                      </p>
                    )}

                    {/* Action Buttons */}
                    {!session.is_locked && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          variant={status === "present" ? "default" : "ghost"}
                          onClick={() => updateStatus(enr.student.id, "present")}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Présent
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          variant={status === "absent" ? "destructive" : "ghost"}
                          onClick={() => updateStatus(enr.student.id, "absent")}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Absent
                        </Button>

                        {/* Retard dialog */}
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          variant={status === "late" ? "secondary" : "ghost"}
                          onClick={() => {
                            setTempLateness(String(record.lateness_minutes || 10));
                            setTempNotes(record.notes || "");
                            setLatenessDialog({ open: true, studentId: enr.student.id });
                          }}
                        >
                          <Timer className="w-3.5 h-3.5 mr-1" />
                          Retard
                        </Button>

                        {/* Justify full-width */}
                        <Button
                          size="sm"
                          className="h-8 text-xs col-span-3 mt-0.5"
                          variant={status === "excused" ? "outline" : "ghost"}
                          onClick={() => {
                            setTempJustification(record.justification || "");
                            setTempNotes(record.notes || "");
                            setJustifyDialog({ open: true, studentId: enr.student.id });
                          }}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Justifier
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Lateness Dialog */}
      <Dialog open={latenessDialog.open} onOpenChange={(o) => setLatenessDialog({ open: o, studentId: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" /> Enregistrer un retard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Minutes de retard</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={tempLateness}
                onChange={(e) => setTempLateness(e.target.value)}
                className="mt-1.5"
                placeholder="Ex: 15"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Remarque (optionnel)</Label>
              <Textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Ex: Problème de transport..."
                className="mt-1.5 resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLatenessDialog({ open: false, studentId: null })}>
                Annuler
              </Button>
              <Button onClick={handleSaveLateness} className="gap-2">
                <Timer className="w-4 h-4" /> Confirmer retard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Justification Dialog */}
      <Dialog open={justifyDialog.open} onOpenChange={(o) => setJustifyDialog({ open: o, studentId: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Justifier l'absence
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Motif</Label>
              <Select value={tempJustification} onValueChange={setTempJustification}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choisir un motif..." />
                </SelectTrigger>
                <SelectContent>
                  {JUSTIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Détails (optionnel)</Label>
              <Textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Précisions supplémentaires..."
                className="mt-1.5 resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJustifyDialog({ open: false, studentId: null })}>
                Annuler
              </Button>
              <Button onClick={handleSaveJustification} className="gap-2">
                <FileText className="w-4 h-4" /> Valider
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Footer — Save button */}
      {!session.is_locked && (
        <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t shadow-2xl px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.total}</span> élèves ·{" "}
              <span className="text-green-600 font-semibold">{stats.present}</span> présents ·{" "}
              <span className="text-red-500 font-semibold">{stats.absent}</span> absents ·{" "}
              <span className="text-amber-500 font-semibold">{stats.late}</span> retards
            </div>
            <Button
              size="lg"
              onClick={handleFinish}
              disabled={bulkMark.isPending || isSaved || enrollments.length === 0}
              className="gap-2 px-8 shadow-lg"
            >
              {bulkMark.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</>
              ) : isSaved ? (
                <><CheckCircle2 className="w-5 h-5" /> Enregistré !</>
              ) : (
                <><Save className="w-5 h-5" /> Terminer la séance</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}