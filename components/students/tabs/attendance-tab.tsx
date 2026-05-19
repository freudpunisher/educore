"use client";

import { useStudentLife } from "@/hooks/use-students";
import { Activity, Clock, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export function AttendanceTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentLife(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = data?.attendance_stats;
    const history = data?.attendance_history || [];
    const attendancePercentage = stats && stats.total_count > 0 
        ? Math.round((stats.present_count / stats.total_count) * 100) 
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            {/* ── Attendance Summary Header ── */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                Attendance Statistics & Timetable Records
            </h3>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Present</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats?.present_count || 0}</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Late</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats?.late_count || 0}</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Absent</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-2xl font-bold text-destructive">{stats?.absent_count || 0}</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-[10px] font-bold text-primary uppercase">Overall Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-center">
                        <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
                        <Progress value={attendancePercentage} className="h-1.5" />
                    </CardContent>
                </Card>
            </div>

            {/* ── Chronological History Logs ── */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/10">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Chronological Attendance Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Subject / Course</TableHead>
                                <TableHead className="font-bold">Timing & Session</TableHead>
                                <TableHead className="font-bold text-center">Status</TableHead>
                                <TableHead className="font-bold">Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No attendance logs found for the selected academic year.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {format(new Date(record.date), "EEE, MMM dd, yyyy")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{record.subject || "General Daily Presence"}</p>
                                                {record.session_type && (
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{record.session_type}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {record.start_time ? record.start_time.substring(0, 5) : "--:--"} - {record.end_time ? record.end_time.substring(0, 5) : "--:--"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {record.status === "present" && (
                                                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 py-0.5 px-2.5 font-bold uppercase text-[9px] tracking-widest">
                                                        Present
                                                    </Badge>
                                                )}
                                                {record.status === "absent" && (
                                                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 py-0.5 px-2.5 font-bold uppercase text-[9px] tracking-widest">
                                                        Absent
                                                    </Badge>
                                                )}
                                                {record.status === "late" && (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 py-0.5 px-2.5 font-bold uppercase text-[9px] tracking-widest">
                                                            Late
                                                        </Badge>
                                                        {record.lateness_minutes > 0 && (
                                                            <span className="text-[10px] font-bold font-mono text-orange-600 flex items-center gap-0.5">
                                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                                {record.lateness_minutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground italic max-w-xs truncate">
                                            {record.notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
