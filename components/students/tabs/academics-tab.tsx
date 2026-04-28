"use client";

import { useStudentAcademics } from "@/hooks/use-students";
import { GraduationCap, FileText, Loader2, BookOpen, ClipboardCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AcademicsTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentAcademics(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const history = data?.academic_history || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {history.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed mx-6">
                    <p className="text-muted-foreground">No academic records found.</p>
                </div>
            ) : (
                <Tabs defaultValue="classes" className="w-full">
                    <div className="px-6 py-3 border-b bg-muted/5">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4">
                            <TabsTrigger 
                                value="classes"
                                className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                            >
                                <GraduationCap className="h-3.5 w-3.5" />
                                Enrolled Classes
                            </TabsTrigger>
                            <TabsTrigger 
                                value="subjects"
                                className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Subject List
                            </TabsTrigger>
                            <TabsTrigger 
                                value="grades"
                                className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Grades & Evaluations
                            </TabsTrigger>
                            <TabsTrigger 
                                value="tracking"
                                className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                            >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Curriculum Progress
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6">
                        <TabsContent value="classes" className="m-0 space-y-6">
                            {history.map((record) => (
                                <div key={record.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{record.class_name}</p>
                                            <p className="text-xs text-muted-foreground">{record.academic_year_label}</p>
                                        </div>
                                    </div>
                                    {record.is_current && (
                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                                            Current
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="subjects" className="m-0">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead>Course Name</TableHead>
                                                <TableHead>Teacher</TableHead>
                                                <TableHead>Schedule</TableHead>
                                                <TableHead className="text-right">Credits</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history[0]?.grades.map((grade, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{grade.course_name}</TableCell>
                                                    <TableCell className="text-muted-foreground text-xs italic">Assigned Teacher</TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">Mon - Wed (10:00)</TableCell>
                                                    <TableCell className="text-right font-mono">3.0</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="grades" className="m-0 space-y-8">
                            {history.map((record) => (
                                <section key={record.id} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                                            {record.academic_year_label} Performance
                                        </h4>
                                    </div>
                                    <Card className="overflow-hidden border-l-4 border-l-primary">
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
                                </section>
                            ))}
                        </TabsContent>

                        <TabsContent value="tracking" className="m-0">
                            <Card className="border-dashed bg-muted/20">
                                <CardContent className="py-20 text-center text-sm text-muted-foreground">
                                    Curriculum tracking and syllabus progress data will be displayed here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            )}
        </div>
    );
}
