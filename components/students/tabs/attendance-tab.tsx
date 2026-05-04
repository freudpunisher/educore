"use client";

import { useStudentLife } from "@/hooks/use-students";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

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
    const attendancePercentage = stats ? Math.round((stats.present_count / stats.total_count) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
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
        </div>
    );
}
