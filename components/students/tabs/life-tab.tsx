"use client";

import { useStudentLife } from "@/hooks/use-students";
import { DisciplineStatusEnum } from "@/types/student";
import { Activity, Clock, AlertTriangle, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export function LifeTab({ studentId }: { studentId: number }) {
    const { data, isLoading } = useStudentLife(studentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = data?.attendance_stats;
    const history = data?.discipline_history || [];
    const attendancePercentage = stats ? Math.round((stats.present_count / stats.total_count) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Attendance Summary */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    Attendance Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Present</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats?.present_count || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Late</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{stats?.late_count || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase text-center">Absent</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-2xl font-bold text-destructive">{stats?.absent_count || 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2 text-center">
                            <CardTitle className="text-[10px] font-bold text-primary uppercase">Overall Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-center">
                            <p className="text-2xl font-bold text-primary">{attendancePercentage}%</p>
                            <Progress value={attendancePercentage} className="h-1.5" />
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Discipline History */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        Behavioral & Discipline Records
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Conduct Score:</span>
                        <Badge variant="outline" className="font-mono bg-background">{data?.discipline_score || "100"}</Badge>
                    </div>
                </div>

                {history.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-20 text-center">
                            <p className="text-muted-foreground">No discipline incidents recorded.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {history.map((record) => (
                            <div key={record.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors group">
                                <div className={`p-2 rounded-full mt-1 ${record.status === DisciplineStatusEnum.Recorded ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                    {record.status === DisciplineStatusEnum.Recorded ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm">{record.reason_name}</p>
                                        <span className="text-xs font-mono text-destructive font-bold">-{record.points_deducted} pts</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{record.description || "No description provided."}</p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(record.date_incident), "PPP")}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold px-1.5">
                                            {record.status || "Recorded"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
