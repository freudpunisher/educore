"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  Loader2,
  School,
  Calendar,
} from "lucide-react";

import { useClassAttendanceReport } from "@/hooks/use-attendance-sessions";
import { useClassRooms } from "@/hooks/use-academic-data";
import type { ClassAttendanceSummary } from "@/types/attendance";

function RateBar({ rate, max = 100 }: { rate: number; max?: number }) {
  const pct = Math.min((rate / max) * 100, 100);
  const color = rate >= 90 ? "bg-green-500" : rate >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-10 text-right">{rate.toFixed(1)}%</span>
    </div>
  );
}

export function AttendanceReport() {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const { data: classrooms = [] } = useClassRooms();
  const { data: report, isLoading } = useClassAttendanceReport(
    selectedClassroom,
    dateFrom,
    dateTo
  );

  const aggregates = report?.aggregates;
  const summaries: ClassAttendanceSummary[] = report?.daily_summaries || [];

  const avgRate = aggregates?.avg_rate ? Number(aggregates.avg_rate).toFixed(1) : "—";
  const totalPresent = aggregates?.total_present || 0;
  const totalAbsent = aggregates?.total_absent || 0;
  const totalLate = aggregates?.total_late || 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Classe</Label>
          <Select onValueChange={(v) => setSelectedClassroom(Number(v))}>
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
          <Label className="text-sm font-medium mb-1.5 block">Du</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-11"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Au</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {!selectedClassroom ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-16">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-lg text-muted-foreground">Sélectionnez une classe pour voir le rapport</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Taux moyen</span>
                </div>
                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{avgRate}%</p>
                <div className="mt-2">
                  {aggregates?.avg_rate && (
                    <RateBar rate={Number(aggregates.avg_rate)} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Total présences</span>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPresent}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Total absences</span>
                </div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{totalAbsent}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Total retards</span>
                </div>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{totalLate}</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Summaries Table */}
          {summaries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
                <p className="text-muted-foreground">Aucune donnée de présence sur cette période.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Résumés journaliers
                  <Badge variant="secondary" className="ml-auto">{summaries.length} jours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-b-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-center">Total</TableHead>
                        <TableHead className="font-semibold text-center">Présents</TableHead>
                        <TableHead className="font-semibold text-center">Absents</TableHead>
                        <TableHead className="font-semibold text-center">Retards</TableHead>
                        <TableHead className="font-semibold text-center">Justifiés</TableHead>
                        <TableHead className="font-semibold">Taux</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaries.map((s) => (
                        <TableRow key={s.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">
                            {format(new Date(s.date), "EEE dd MMM yyyy", { locale: fr })}
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">{s.total_students}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-semibold text-sm">{s.present_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-red-500 font-semibold text-sm">{s.absent_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-amber-500 font-semibold text-sm">{s.late_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-blue-500 font-semibold text-sm">{s.excused_count}</span>
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <RateBar rate={Number(s.attendance_rate)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
