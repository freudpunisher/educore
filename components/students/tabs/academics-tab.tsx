"use client";

import { useStudentAcademics } from "@/hooks/use-students";
import { 
    GraduationCap, 
    FileText, 
    Loader2, 
    BookOpen, 
    ClipboardCheck, 
    Users, 
    ListTodo, 
    Armchair, 
    LayoutList, 
    TrendingUp, 
    Award, 
    User,
    Calendar,
    ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

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

    // Sort history chronologically for timeline tracking
    const chronologicalHistory = [...history].sort((a, b) => {
        const yearA = parseInt(a.academic_year_label?.split("-")[0] || "0");
        const yearB = parseInt(b.academic_year_label?.split("-")[0] || "0");
        return yearA - yearB;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {history.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed mx-6">
                    <p className="text-muted-foreground">No academic records found.</p>
                </div>
            ) : (
                <Tabs defaultValue="classes" className="w-full">
                    <div className="px-6 py-3 border-b bg-muted/5">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4 flex-wrap">
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
                        {/* ── Sub-tab: Enrolled Classes ── */}
                        <TabsContent value="classes" className="m-0 space-y-6">
                            {history.map((record) => (
                                <Card key={record.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
                                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{record.class_name}</h4>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{record.academic_year_label}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] py-1 border-muted-foreground/30">
                                                Enrolled: {record.date_enrolled ? format(new Date(record.date_enrolled), "MMM dd, yyyy") : "N/A"}
                                            </Badge>
                                            {record.is_current && (
                                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 py-1 font-bold">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                                <Users className="h-4 w-4 mx-auto text-blue-500" />
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Students</p>
                                                <p className="text-lg font-extrabold">{record.student_count || 0}</p>
                                            </div>
                                            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                                <ListTodo className="h-4 w-4 mx-auto text-purple-500" />
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Evaluations</p>
                                                <p className="text-lg font-extrabold">{record.assessment_count || 0}</p>
                                            </div>
                                            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                                <Armchair className="h-4 w-4 mx-auto text-green-500" />
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Seats</p>
                                                <p className="text-lg font-extrabold">{record.class_capacity || "-"}</p>
                                            </div>
                                            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                                <LayoutList className="h-4 w-4 mx-auto text-orange-500" />
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Courses</p>
                                                <p className="text-lg font-extrabold">{record.course_count || 0}</p>
                                            </div>
                                            <div className="space-y-1 p-3 bg-primary/5 rounded-xl text-center border border-primary/10 col-span-2 sm:col-span-1">
                                                <TrendingUp className="h-4 w-4 mx-auto text-primary" />
                                                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Class Average</p>
                                                <p className="text-lg font-extrabold text-primary">{record.class_average || "0.0"}/20</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* ── Sub-tab: Subject List ── */}
                        <TabsContent value="subjects" className="m-0">
                            <Card className="overflow-hidden">
                                <CardHeader className="pb-3 bg-muted/10 border-b">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Classroom Courses & Subject Averages</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="font-bold">Course Name</TableHead>
                                                <TableHead className="font-bold">Teacher</TableHead>
                                                <TableHead className="text-center font-bold">Student Average</TableHead>
                                                <TableHead className="text-center font-bold">Class Average</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!history[0]?.subjects || history[0]?.subjects.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                                        No subjects or course details found for this enrollment.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                history[0].subjects.map((subj, idx) => (
                                                    <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {subj.course_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-secondary rounded-full text-slate-600">
                                                                    <User className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-xs font-medium">{subj.teacher}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={`${subj.student_grade === "-" ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'} font-bold font-mono px-2.5 py-0.5`}>
                                                                {subj.student_grade !== "-" ? `${subj.student_grade} / 20` : "-"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="font-bold font-mono px-2.5 py-0.5 border-slate-300">
                                                                {subj.class_average} / 20
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Sub-tab: Grades & Evaluations ── */}
                        <TabsContent value="grades" className="m-0 space-y-8">
                            {history.map((record) => (
                                <section key={record.id} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" />
                                            {record.academic_year_label} Detailed Grades & Remarks
                                        </h4>
                                    </div>
                                    <Card className="overflow-hidden border-l-4 border-l-primary">
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/20">
                                                        <TableHead className="font-bold">Course</TableHead>
                                                        <TableHead className="font-bold">Assessment</TableHead>
                                                        <TableHead className="font-bold">Score</TableHead>
                                                        <TableHead className="font-bold">Coefficient / Percentage</TableHead>
                                                        <TableHead className="font-bold">Comment</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {record.grades.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                                No individual evaluation grades recorded yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        record.grades.map((grade, idx) => (
                                                            <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                                <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{grade.course_name}</TableCell>
                                                                <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">{grade.assessment_title}</TableCell>
                                                                <TableCell>
                                                                    <span className="font-bold text-primary font-mono">{grade.score} / 20</span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary" className="font-mono font-bold text-[10px]">
                                                                        {grade.percentage}%
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-xs text-muted-foreground italic max-w-xs truncate">
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

                        {/* ── Sub-tab: Curriculum Progress ── */}
                        <TabsContent value="tracking" className="m-0">
                            <Card className="p-6">
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-8 uppercase tracking-wider flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                    Student Academic Progression History
                                </h3>
                                <div className="relative pl-8 border-l border-slate-200 dark:border-slate-800 ml-4 space-y-8">
                                    {chronologicalHistory.map((item, idx) => (
                                        <div key={item.id} className="relative group">
                                            {/* dot */}
                                            <div className={`absolute -left-[41px] top-1.5 p-1 rounded-full border-2 bg-background transition-transform group-hover:scale-110 ${item.is_current ? 'border-green-500 text-green-500' : 'border-slate-300 text-slate-400'}`}>
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            
                                            {/* Content Card */}
                                            <div className="p-5 rounded-xl border bg-card shadow-sm hover:shadow transition-all duration-300">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.academic_year_label}</span>
                                                        {item.is_current && (
                                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 text-[9px] py-0">
                                                                Active Year
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Enrolled on {item.date_enrolled ? format(new Date(item.date_enrolled), "MMMM dd, yyyy") : "N/A"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Assigned Classroom:</span>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.class_name}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-primary font-bold group-hover:translate-x-1 transition-transform">
                                                        View Performance
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            )}
        </div>
    );
}
