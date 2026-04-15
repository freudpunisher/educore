"use client";

import { useStudentAcademics } from "@/hooks/use-students";
import { GraduationCap, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AcademicsTab({ studentId }: { studentId: number }) {
    const { data, isLoading } = useStudentAcademics(studentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const history = data?.academic_history || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {history.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No academic records found.</p>
                </div>
            ) : (
                history.map((record) => (
                    <section key={record.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                {record.academic_year_label} - {record.class_name}
                            </h3>
                            {record.is_current && (
                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                                    Current Year
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Card className="overflow-hidden border-l-4 border-l-primary">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Grades & Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>Course</TableHead>
                                                <TableHead>Assessment</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Percentage</TableHead>
                                                <TableHead>Comment</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {record.grades.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                        No grades recorded yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                record.grades.map((grade, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{grade.course_name}</TableCell>
                                                        <TableCell>{grade.assessment_title}</TableCell>
                                                        <TableCell>{grade.score}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="font-mono">
                                                                {grade.percentage}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground italic">
                                                            {grade.comment || "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
