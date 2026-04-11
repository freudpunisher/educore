"use client";

import { StudentDetail } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Mail, Phone, MapPin, FileText, Users, Calendar, GraduationCap, Receipt, BarChart3, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMockBills, getMockGrades, getMockAttendance, MOCK_ACADEMIC_YEARS } from "@/lib/student-mock-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentDetailViewProps {
    student: StudentDetail;
}

export function StudentDetailView({ student }: StudentDetailViewProps) {
    const [academicYear, setAcademicYear] = useState(String(MOCK_ACADEMIC_YEARS[0].id));

    const bills = useMemo(() => getMockBills(student.id, Number(academicYear)), [student.id, academicYear]);
    const grades = useMemo(() => getMockGrades(student.id, Number(academicYear)), [student.id, academicYear]);
    const attendance = useMemo(() => getMockAttendance(student.id, Number(academicYear)), [student.id, academicYear]);

    const attendanceStats = useMemo(() => {
        const total = attendance.length;
        const present = attendance.filter(a => a.status === "present").length;
        const late = attendance.filter(a => a.status === "late").length;
        const absent = attendance.filter(a => a.status === "absent").length;
        return {
            rate: total > 0 ? Math.round((present + late) / total * 100) : 0,
            present, late, absent
        };
    }, [attendance]);

    return (
        <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-6 border-b bg-card flex items-center justify-between">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="family"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Family
                    </TabsTrigger>
                    <TabsTrigger
                        value="grades"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Grades
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger
                        value="bills"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Bills
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Documents
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 py-2">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Academic Year:</span>
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_ACADEMIC_YEARS.map(y => (
                                <SelectItem key={y.id} value={String(y.id)}>{y.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <TabsContent value="overview" className="p-6 space-y-8 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        {/* General Information */}
                        <article className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                Academic Info
                            </h3>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Enrollment No.</span>
                                        <code className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{student.enrollment_number}</code>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Enrollment Info</span>
                                        <span className="font-medium">{student.enrollment_info || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={student.is_enrolled ? "default" : "secondary"}>
                                            {student.is_enrolled ? "Currently Enrolled" : "Not Enrolled"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Enrollment Date</span>
                                        <span className="font-medium">{format(new Date(student.enrollment_date), "PPP")}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </article>

                        {/* Personal Details */}
                        <article className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                Personal Details
                            </h3>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Gender</span>
                                        <Badge variant="outline">{student.gender === 1 ? "Girl" : "Boy"}</Badge>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Date of Birth</span>
                                        <span className="font-medium">
                                            {student.date_of_birth ? format(new Date(student.date_of_birth), "PPP") : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Account Status</span>
                                        <span className="font-medium capitalize">{student.account_info || "Inactive"}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </article>
                    </div>
                </TabsContent>

                <TabsContent value="family" className="p-6 m-0 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        Parent / Guardian Contacts
                    </h3>
                    {student.parents.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No family information recorded.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.parents.map((p) => (
                                <Card key={p.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                                    {p.is_primary_contact && (
                                        <div className="absolute top-0 right-0">
                                            <Badge className="rounded-tr-none rounded-bl-lg text-[10px] uppercase font-bold" variant="default">Primary</Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <p className="font-bold text-lg">
                                            {p.account_detail.user.first_name} {p.account_detail.user.last_name}
                                        </p>
                                        <Badge variant="outline" className="w-fit capitalize text-xs bg-muted/50">
                                            {p.relationship}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-1.5 bg-primary/5 rounded-full"><Phone className="h-4 w-4 text-primary" /></div>
                                            <span>{p.account_detail.phone_number || "No phone recorded"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-1.5 bg-primary/5 rounded-full"><Mail className="h-4 w-4 text-primary" /></div>
                                            <span className="truncate">{p.account_detail.user.email || "No email recorded"}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-muted-foreground">
                                            <div className="p-1.5 bg-primary/5 rounded-full mt-0.5"><MapPin className="h-4 w-4 text-primary" /></div>
                                            <span className="text-xs leading-relaxed">{p.account_detail.address}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="grades" className="p-6 m-0 space-y-6 text-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Academic Performance
                    </h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Max Grade</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grades.map((grade) => (
                                    <TableRow key={grade.id}>
                                        <TableCell className="font-medium">{grade.course}</TableCell>
                                        <TableCell>
                                            <span className={grade.grade >= 15 ? "text-green-600 font-bold" : grade.grade >= 10 ? "text-blue-600" : "text-red-600"}>
                                                {grade.grade}
                                            </span>
                                        </TableCell>
                                        <TableCell>{grade.maxGrade}</TableCell>
                                        <TableCell>
                                            <Badge variant={grade.grade >= 10 ? "default" : "destructive"}>
                                                {grade.grade >= 10 ? "Passed" : "Failed"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="attendance" className="p-6 m-0 space-y-8 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2 p-4">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Attendance Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold text-primary">{attendanceStats.rate}%</div>
                                <p className="text-xs text-muted-foreground mt-1">Average for the year</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 p-4">
                                <CardTitle className="text-sm text-muted-foreground">Present</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">{attendanceStats.present}</div>
                                <p className="text-xs text-muted-foreground mt-1 italic">Days at school</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 p-4">
                                <CardTitle className="text-sm text-muted-foreground">Late</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold text-amber-600">{attendanceStats.late}</div>
                                <p className="text-xs text-muted-foreground mt-1">Need monitoring</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 p-4">
                                <CardTitle className="text-sm text-muted-foreground">Absent</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold text-destructive">{attendanceStats.absent}</div>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">Justified</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Recent Activity
                        </h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{format(new Date(record.date), "PPP")}</TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === "present" ? "default" : record.status === "late" ? "secondary" : "destructive"}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground italic">{record.notes || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="bills" className="p-6 m-0 space-y-6 text-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        Billing & Payments
                    </h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.map((bill) => (
                                    <TableRow key={bill.id}>
                                        <TableCell className="font-mono text-xs">{bill.id}</TableCell>
                                        <TableCell className="font-medium text-xs">{bill.description}</TableCell>
                                        <TableCell className="font-bold">{bill.amount.toLocaleString("en-US")} FBU</TableCell>
                                        <TableCell>{format(new Date(bill.dueDate), "PP")}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className="uppercase text-[10px] font-bold"
                                                variant={bill.status === "paid" ? "default" : bill.status === "pending" ? "secondary" : "destructive"}
                                            >
                                                {bill.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-4 border border-dashed border-primary/20">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="font-semibold text-primary">Financial Policy</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tuition fees must be paid within 15 days of the invoice date. Late payments may result in administrative restrictions.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6 m-0 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Academic Documents
                    </h3>
                    {student.documents.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {student.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group border-l-4 border-l-primary"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold capitalize text-sm">{doc.document_type.replace("_", " ")}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                Uploaded {format(new Date(doc.uploaded_at), "PPP")}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-all"
                                    >
                                        View File
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </ScrollArea>
        </Tabs>
    );
}

