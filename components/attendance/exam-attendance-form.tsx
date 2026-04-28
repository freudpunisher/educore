"use client";

import { useState } from "react";
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
  FileText,
  Users,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  Clock,
  Timer,
} from "lucide-react";

import { useBulkMarkExamAttendance } from "@/hooks/use-attendance-sessions";
import { useClassRooms } from "@/hooks/use-academic-data";
import { useStudentsByClassLevel } from "@/hooks/use-discipline";
import type { BulkExamAttendanceItem } from "@/types/attendance";

const EXAM_STATUS_OPTIONS = [
  { value: "present", label: "Présent", icon: CheckCircle2, badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { value: "absent", label: "Absent", icon: XCircle, badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  { value: "excused", label: "Excusé", icon: FileText, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "excluded", label: "Exclu", icon: AlertCircle, badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
];

interface ExamRecord {
  status: string;
  arrival_time: string;
  lateness_minutes: number;
  notes: string;
}

interface ExamAttendanceFormProps {
  assessmentId: number;
  assessmentTitle?: string;
  classroomId: number;
}

export function ExamAttendanceForm({
  assessmentId,
  assessmentTitle,
  classroomId,
}: ExamAttendanceFormProps) {
  const [records, setRecords] = useState<Record<number, ExamRecord>>({});
  const [search, setSearch] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const { data: enrollments = [], isLoading } = useStudentsByClassLevel(
    classroomId,
    !!classroomId
  );
  const bulkMark = useBulkMarkExamAttendance();

  if (enrollments.length > 0 && Object.keys(records).length === 0) {
    const init: Record<number, ExamRecord> = {};
    enrollments.forEach((enr) => {
      init[enr.student?.id || enr.id] = {
        status: "present",
        arrival_time: "",
        lateness_minutes: 0,
        notes: "",
      };
    });
    setRecords(init);
  }

  const stats = {
    total: enrollments.length,
    present: Object.values(records).filter((r) => r.status === "present").length,
    absent: Object.values(records).filter((r) => r.status === "absent").length,
    excused: Object.values(records).filter((r) => r.status === "excused").length,
    excluded: Object.values(records).filter((r) => r.status === "excluded").length,
  };

  const filtered = enrollments.filter((enr) => {
    const name = enr.student?.full_name || enr.student_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const updateRecord = (sid: number, updates: Partial<ExamRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [sid]: { ...prev[sid], ...updates },
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    const attendances: BulkExamAttendanceItem[] = enrollments.map((enr) => {
      const sid = enr.student?.id || enr.id;
      const rec = records[sid] || { status: "present", lateness_minutes: 0, notes: "" };
      return {
        student: sid,
        enrollment: enr.id,
        status: rec.status,
        arrival_time: rec.arrival_time || undefined,
        lateness_minutes: rec.lateness_minutes,
        notes: rec.notes,
      };
    });
    await bulkMark.mutateAsync({ assessment_id: assessmentId, attendances });
    setIsSaved(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      {assessmentTitle && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="p-2 bg-purple-600 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-100">{assessmentTitle}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Feuille de présence examen</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
          { label: "Présents", value: stats.present, color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
          { label: "Absents", value: stats.absent, color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
          { label: "Excusés", value: stats.excused, color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-0">
            <CardContent className={`p-3 text-center ${color} rounded-xl`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Élève</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Heure d'arrivée</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Retard (min)</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Remarques</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((enr) => {
              const sid = enr.student?.id || enr.id;
              const name = enr.student?.full_name || enr.student_name || "—";
              const rec = records[sid] || { status: "present", lateness_minutes: 0, notes: "", arrival_time: "" };
              const statusOpt = EXAM_STATUS_OPTIONS.find((s) => s.value === rec.status) || EXAM_STATUS_OPTIONS[0];
              const StatusIcon = statusOpt.icon;

              return (
                <TableRow key={sid} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-bold bg-purple-600 text-white">
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
                    <Select
                      value={rec.status}
                      onValueChange={(v) => updateRecord(sid, { status: v })}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${statusOpt.badge}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusOpt.label}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_STATUS_OPTIONS.map((opt) => {
                          const Ic = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <Ic className="w-3.5 h-3.5" />
                                {opt.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Input
                      type="time"
                      value={rec.arrival_time}
                      onChange={(e) => updateRecord(sid, { arrival_time: e.target.value })}
                      className="h-8 w-28 text-xs"
                    />
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {rec.status === "present" ? (
                      <Input
                        type="number"
                        min={0}
                        value={rec.lateness_minutes || ""}
                        onChange={(e) => updateRecord(sid, { lateness_minutes: Number(e.target.value) })}
                        placeholder="0"
                        className="h-8 w-20 text-xs"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <Input
                      value={rec.notes}
                      onChange={(e) => updateRecord(sid, { notes: e.target.value })}
                      placeholder="Remarques..."
                      className="h-8 text-xs max-w-[160px]"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={bulkMark.isPending || isSaved || enrollments.length === 0}
          className="gap-2 px-8"
        >
          {bulkMark.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
          ) : isSaved ? (
            <><CheckCircle2 className="w-4 h-4" /> Enregistré !</>
          ) : (
            <><Save className="w-4 h-4" /> Enregistrer les présences</>
          )}
        </Button>
      </div>
    </div>
  );
}
