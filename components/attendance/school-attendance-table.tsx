"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  Users,
  School,
  Save,
  Loader2,
  CalendarDays,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";

import {
  useSchoolDailyAttendances,
  useBulkMarkSchoolAttendance,
  useSchoolDailyAttendanceSummary,
} from "@/hooks/use-attendance-sessions";
import { useClassRooms } from "@/hooks/use-academic-data";
import { useStudentsByClassLevel } from "@/hooks/use-discipline";
import type { BulkSchoolAttendanceItem } from "@/types/attendance";

const STATUS_OPTIONS = [
  { value: "present", label: "Présent", icon: CheckCircle2, color: "text-green-600" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-red-500" },
  { value: "late", label: "En retard", icon: Timer, color: "text-amber-500" },
  { value: "excused", label: "Justifié", icon: FileText, color: "text-blue-500" },
  { value: "half_day", label: "Demi-journée", icon: AlertCircle, color: "text-purple-500" },
];

const STATUS_BADGE: Record<string, string> = {
  present: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  absent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  excused: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  half_day: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const JUSTIFICATIONS = [
  "Maladie", "Permission familiale", "Rendez-vous médical",
  "Problème de transport", "Décès dans la famille", "Autre",
];

interface StudentRecord {
  status: string;
  arrival_time: string;
  departure_time: string;
  lateness_minutes: number;
  justification: string;
  notes: string;
}

export function SchoolAttendanceTable() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<Record<number, StudentRecord>>({});
  const [editDialog, setEditDialog] = useState<{ open: boolean; studentId: number | null }>({ open: false, studentId: null });
  const [tempRecord, setTempRecord] = useState<Partial<StudentRecord>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { data: classrooms = [] } = useClassRooms();
  const { data: enrollments = [], isLoading: enrollLoading } = useStudentsByClassLevel(
    selectedClassroom,
    !!selectedClassroom
  );
  const { data: summaryData, isLoading: summaryLoading } = useSchoolDailyAttendanceSummary(
    selectedClassroom,
    selectedDate
  );
  const bulkMark = useBulkMarkSchoolAttendance();

  // Init records when enrollments load
  const initRecords = () => {
    if (enrollments.length > 0 && Object.keys(records).length === 0) {
      const init: Record<number, StudentRecord> = {};
      enrollments.forEach((enr) => {
        init[enr.student?.id || enr.id] = {
          status: "present",
          arrival_time: "",
          departure_time: "",
          lateness_minutes: 0,
          justification: "",
          notes: "",
        };
      });
      setRecords(init);
    }
  };
  if (enrollments.length > 0 && Object.keys(records).length === 0) initRecords();

  const filtered = enrollments.filter((enr) => {
    const name = enr.student?.full_name || enr.student_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const stats = {
    total: enrollments.length,
    present: Object.values(records).filter((r) => r.status === "present").length,
    absent: Object.values(records).filter((r) => r.status === "absent").length,
    late: Object.values(records).filter((r) => r.status === "late").length,
    excused: Object.values(records).filter((r) => r.status === "excused").length,
  };

  const openEdit = (studentId: number) => {
    setTempRecord(records[studentId] || { status: "present" });
    setEditDialog({ open: true, studentId });
  };

  const saveEdit = () => {
    if (editDialog.studentId === null) return;
    setRecords((prev) => ({
      ...prev,
      [editDialog.studentId!]: { ...prev[editDialog.studentId!], ...tempRecord } as StudentRecord,
    }));
    setEditDialog({ open: false, studentId: null });
    setIsSaved(false);
  };

  const quickStatus = (studentId: number, status: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId] || {}, status } as StudentRecord,
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!selectedClassroom || !selectedDate) return;
    const attendances: BulkSchoolAttendanceItem[] = enrollments.map((enr) => {
      const sid = enr.student?.id || enr.id;
      const rec = records[sid] || { status: "present", lateness_minutes: 0, justification: "", notes: "" };
      return {
        student: sid,
        enrollment: enr.id,
        status: rec.status,
        arrival_time: rec.arrival_time || undefined,
        departure_time: rec.departure_time || undefined,
        lateness_minutes: rec.lateness_minutes,
        justification: rec.justification,
        notes: rec.notes,
      };
    });
    await bulkMark.mutateAsync({ date: selectedDate, classroom_id: selectedClassroom, attendances });
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setRecords({}); setIsSaved(false); }}
            className="h-11"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Classe</Label>
          <Select
            onValueChange={(v) => { setSelectedClassroom(Number(v)); setRecords({}); setIsSaved(false); }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {classrooms.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Rechercher</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nom de l'élève..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {selectedClassroom && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800", textColor: "text-slate-700 dark:text-slate-300", icon: Users },
            { label: "Présents", value: stats.present, color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900", textColor: "text-green-700 dark:text-green-300", icon: CheckCircle2 },
            { label: "Absents", value: stats.absent, color: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900", textColor: "text-red-700 dark:text-red-300", icon: XCircle },
            { label: "Retards", value: stats.late, color: "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900", textColor: "text-amber-700 dark:text-amber-300", icon: Timer },
            { label: "Justifiés", value: stats.excused, color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900", textColor: "text-blue-700 dark:text-blue-300", icon: FileText },
          ].map(({ label, value, color, textColor, icon: Icon }) => (
            <Card key={label} className={`border-0 bg-gradient-to-br ${color}`}>
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${textColor} shrink-0`} />
                <div>
                  <p className={`text-xl font-bold ${textColor}`}>{value}</p>
                  <p className={`text-xs ${textColor} opacity-70`}>{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Placeholder when no class selected */}
      {!selectedClassroom ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-16">
            <School className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-lg text-muted-foreground">Sélectionnez une classe et une date</p>
            <p className="text-sm text-muted-foreground mt-1">pour commencer la prise de présence journalière.</p>
          </CardContent>
        </Card>
      ) : enrollLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground">Aucun élève dans cette classe.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Élève</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Arrivée</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Retard</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Motif</TableHead>
                <TableHead className="text-right font-semibold">Actions rapides</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((enr) => {
                const sid = enr.student?.id || enr.id;
                const name = enr.student?.full_name || enr.student_name || "—";
                const rec = records[sid] || { status: "present", lateness_minutes: 0, justification: "", notes: "", arrival_time: "" };
                const statusOpt = STATUS_OPTIONS.find((s) => s.value === rec.status) || STATUS_OPTIONS[0];
                const StatusIcon = statusOpt.icon;

                return (
                  <TableRow key={sid} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                            {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {enr.student?.enrollment_number || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[rec.status] || ""}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusOpt.label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {rec.arrival_time || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {rec.lateness_minutes > 0 ? (
                        <span className="text-amber-600 font-medium">+{rec.lateness_minutes} min</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[120px]">
                      {rec.justification || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {["present", "absent", "late"].map((s) => {
                          const opt = STATUS_OPTIONS.find((o) => o.value === s)!;
                          const Icon = opt.icon;
                          return (
                            <Button
                              key={s}
                              size="sm"
                              variant={rec.status === s ? "default" : "ghost"}
                              className="h-7 w-7 p-0"
                              title={opt.label}
                              onClick={() => quickStatus(sid, s)}
                            >
                              <Icon className={`w-3.5 h-3.5 ${rec.status !== s ? opt.color : ""}`} />
                            </Button>
                          );
                        })}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => openEdit(sid)}
                        >
                          Détails
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

      {/* Save button */}
      {selectedClassroom && filtered.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={bulkMark.isPending || isSaved}
            className="gap-2 px-8 shadow"
          >
            {bulkMark.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            ) : isSaved ? (
              <><CheckCircle2 className="w-4 h-4" /> Enregistré !</>
            ) : (
              <><Save className="w-4 h-4" /> Sauvegarder les présences</>
            )}
          </Button>
        </div>
      )}

      {/* Edit Detail Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(o) => setEditDialog({ open: o, studentId: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Détails de présence
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Statut</Label>
              <Select
                value={tempRecord.status}
                onValueChange={(v) => setTempRecord((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Arrivée</Label>
                <Input
                  type="time"
                  value={tempRecord.arrival_time || ""}
                  onChange={(e) => setTempRecord((p) => ({ ...p, arrival_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Départ</Label>
                <Input
                  type="time"
                  value={tempRecord.departure_time || ""}
                  onChange={(e) => setTempRecord((p) => ({ ...p, departure_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>
            {tempRecord.status === "late" && (
              <div>
                <Label className="text-sm font-medium">Minutes de retard</Label>
                <Input
                  type="number"
                  min={1}
                  value={tempRecord.lateness_minutes || ""}
                  onChange={(e) => setTempRecord((p) => ({ ...p, lateness_minutes: Number(e.target.value) }))}
                  className="mt-1.5"
                />
              </div>
            )}
            {(tempRecord.status === "excused" || tempRecord.status === "absent") && (
              <div>
                <Label className="text-sm font-medium">Motif de l'absence</Label>
                <Select
                  value={tempRecord.justification || ""}
                  onValueChange={(v) => setTempRecord((p) => ({ ...p, justification: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choisir un motif..." />
                  </SelectTrigger>
                  <SelectContent>
                    {JUSTIFICATIONS.map((j) => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Remarques</Label>
              <Textarea
                value={tempRecord.notes || ""}
                onChange={(e) => setTempRecord((p) => ({ ...p, notes: e.target.value }))}
                className="mt-1.5 resize-none"
                rows={2}
                placeholder="Notes supplémentaires..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialog({ open: false, studentId: null })}>
                Annuler
              </Button>
              <Button onClick={saveEdit}>Sauvegarder</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
