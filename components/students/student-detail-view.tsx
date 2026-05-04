"use client";

import { StudentDetail } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Phone, Mail, Users, FileText, Calendar, GraduationCap, Wallet, Activity,
    Sparkles, ShoppingBag, Award, ClipboardList, Folder, BookOpen, CheckCircle, 
    DollarSign, ShieldAlert, Truck, UtensilsCrossed, Home, Baby, Package
} from "lucide-react";
import { useStudentFinance, useStudentLife, useValidateStudent } from "@/hooks/use-students";
import { useAcademicYears } from "@/hooks/use-academic-data";
import { Button } from "@/components/ui/button";
import { UploadStudentDocumentDialog } from "./upload-document-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { StudentPvcCardDialog } from "./student-pvc-card-dialog";
import { AcademicsTab } from "./tabs/academics-tab";
import { FinanceTab } from "./tabs/finance-tab";
import { BehaviorTab } from "./tabs/behavior-tab";
import { AttendanceTab } from "./tabs/attendance-tab";
import { TransportTab } from "./tabs/transport-tab";
import { DiningTab } from "./tabs/dining-tab";
import { BoardingTab } from "./tabs/boarding-tab";
import { DaycareTab } from "./tabs/daycare-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface StudentDetailViewProps {
    student: StudentDetail;
}

export function StudentDetailView({ student }: StudentDetailViewProps) {
    const validateMutation = useValidateStudent();
    const { data: academicYears } = useAcademicYears();
    const [selectedYear, setSelectedYear] = useState<string>("current");

    const activeYearId = selectedYear === "current" 
        ? academicYears?.find(y => y.is_current)?.id 
        : parseInt(selectedYear);

    const { data: finance } = useStudentFinance(student.id, activeYearId);
    const { data: life } = useStudentLife(student.id, activeYearId);

    const getEnrollmentDisplay = (info: any) => {
        // Use pre-computed current_class if available from StudentBaseSerializer
        const currentClass = student.current_class;
        if (currentClass) {
            return `${currentClass.class_name} (${currentClass.academic_year})`;
        }
        
        if (!info) return "N/A";
        if (typeof info === "string") return info;
        if (typeof info === "object") {
            return (info as any).classroom || (info as any).class_level || "Linked";
        }
        return "Linked";
    };

    const attendanceRate = life?.attendance_stats 
        ? Math.round((life.attendance_stats.present_count / life.attendance_stats.total_count) * 100) 
        : 0;

    const hasArrears = finance ? parseFloat(finance.outstanding_balance) > 0 : false;

    return (
        <div className="flex flex-col h-full bg-muted/30 overflow-hidden">
            {/* Header / Overview */}
            <div className="p-6 pb-0 space-y-6 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                                {student.image ? (
                                    <img src={student.image} alt={student.full_name} className="h-full w-full object-cover" />
                                ) : (
                                    <Users className="h-10 w-10" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 border-4 border-white rounded-full shadow-lg" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{student.full_name}</h1>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-xs font-bold">
                                    ID: {student.enrollment_number || `STU-${student.id}`}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-white/50 px-3 py-1 rounded-full border border-white/50 shadow-sm">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <span>{getEnrollmentDisplay(student.enrollment_info)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-white/50 px-3 py-1 rounded-full border border-white/50 shadow-sm">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    <span>Né le {student.date_of_birth ? format(new Date(student.date_of_birth), "PPP") : "Inconnu"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-white/50 px-3 py-1 rounded-full border border-white/50 shadow-sm">
                                    <Activity className="h-4 w-4 text-green-500" />
                                    <span className="capitalize">{student.gender === 1 ? "Girl" : "Boy"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Academic Year Filter</p>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-white/50 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Select Year" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="current" className="font-bold text-primary">Current Session (Default)</SelectItem>
                                    {academicYears?.map((year) => (
                                        <SelectItem key={year.id} value={year.id.toString()}>
                                            {year.start_year}-{year.end_year} {year.is_current ? "(Current)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <StudentPvcCardDialog student={student as any} />
                        {!student.validated_at && (
                            <Button
                                onClick={() => validateMutation.mutate(student.id)}
                                disabled={validateMutation.isPending}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 px-6 shadow-lg shadow-orange-500/20 gap-2 font-bold"
                            >
                                <Sparkles className="h-4 w-4" />
                                Valider Dossier
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6">
                    <Card className="bg-white/40 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Enrollment</p>
                                <p className="text-lg font-bold truncate">{student.current_class?.class_name || "Enrolled"}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/40 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${hasArrears ? 'bg-orange-500/10 text-orange-600' : 'bg-green-500/10 text-green-600'}`}>
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Financial Status</p>
                                <p className="text-lg font-bold">{hasArrears ? "Arrears" : "Good Standing"}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/40 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attendance Rate</p>
                                <p className="text-lg font-bold">{attendanceRate}% Average</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/40 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Discipline</p>
                                <p className="text-lg font-bold">{life?.discipline_score || "10.0"}/10.0</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="academics" className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar flex-shrink-0">
                    <TabsList className="w-max justify-start h-auto p-0 bg-transparent gap-4">
                        <TabsTrigger
                            value="academics"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Academics
                        </TabsTrigger>
                        <TabsTrigger
                            value="invoicing"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <DollarSign className="h-4 w-4" />
                            Invoicing
                        </TabsTrigger>
                        <TabsTrigger
                            value="behavior"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            Behavior
                        </TabsTrigger>
                        <TabsTrigger
                            value="attendance"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Activity className="h-4 w-4" />
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger
                            value="transport"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Truck className="h-4 w-4" />
                            Transport
                        </TabsTrigger>
                        <TabsTrigger
                            value="dining"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <UtensilsCrossed className="h-4 w-4" />
                            Dining
                        </TabsTrigger>
                        <TabsTrigger
                            value="boarding"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Home className="h-4 w-4" />
                            Boarding
                        </TabsTrigger>
                        <TabsTrigger
                            value="daycare"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Baby className="h-4 w-4" />
                            Daycare
                        </TabsTrigger>
                        <TabsTrigger
                            value="inventory"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Package className="h-4 w-4" />
                            Inventory
                        </TabsTrigger>
                        <TabsTrigger
                            value="family"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Users className="h-4 w-4" />
                            Family
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <FileText className="h-4 w-4" />
                            Documents
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <TabsContent value="academics" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <AcademicsTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="invoicing" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FinanceTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="behavior" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <BehaviorTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="attendance" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <AttendanceTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="transport" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <TransportTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="dining" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <DiningTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="boarding" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <BoardingTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="daycare" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <DaycareTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="inventory" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <InventoryTab studentId={student.id} academicYearId={activeYearId} />
                    </TabsContent>

                    <TabsContent value="family" className="p-6 m-0 space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Parent / Guardian Contacts
                        </h3>
                        {student.parents_info?.length === 0 ? (
                            <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No family information recorded.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.parents_info?.map((p, index) => (
                                    <Card key={index} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                                        {p.is_primary && (
                                            <div className="absolute top-0 right-0">
                                                <Badge className="rounded-tr-none rounded-bl-lg text-[10px] uppercase font-bold" variant="default">Primary</Badge>
                                            </div>
                                        )}
                                        <CardHeader className="pb-2">
                                            <p className="font-bold text-lg">
                                                {p.full_name}
                                            </p>
                                            <Badge variant="outline" className="w-fit capitalize text-xs bg-muted/50">
                                                {p.relationship}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <div className="p-1.5 bg-primary/5 rounded-full"><Phone className="h-4 w-4 text-primary" /></div>
                                                <span>{p.phone || "No phone recorded"}</span>
                                            </div>
                                            {p.email && (
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <div className="p-1.5 bg-primary/5 rounded-full"><Mail className="h-4 w-4 text-primary" /></div>
                                                    <span className="truncate">{p.email}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="documents" className="p-6 m-0 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Academic Documents
                            </h3>
                            <UploadStudentDocumentDialog studentId={student.id} />
                        </div>
                        {student.documents?.length === 0 ? (
                            <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No documents uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {student.documents?.map((doc, idx) => {
                                    const getIcon = (type: string) => {
                                        switch (type) {
                                            case "bulletin": return <ClipboardList className="h-6 w-6" />;
                                            case "certificate": return <Award className="h-6 w-6" />;
                                            case "enrollment": return <Folder className="h-6 w-6" />;
                                            case "exam_copy": return <BookOpen className="h-6 w-6" />;
                                            case "medical": return <Activity className="h-6 w-6" />;
                                            default: return <FileText className="h-6 w-6" />;
                                        }
                                    };

                                    return (
                                        <div
                                            key={doc.id || `doc-${idx}`}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-card hover:bg-accent/30 transition-all group border-l-4 border-l-primary shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner">
                                                    {getIcon(doc.document_type || "")}
                                                </div>
                                                <div>
                                                    <p className="font-bold capitalize text-base tracking-tight">{(doc.document_type || "Document").replace("_", " ")}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {doc.uploaded_at ? `Mis en ligne le ${format(new Date(doc.uploaded_at), "PPP")}` : "Date inconnue"}
                                                        </p>
                                                        {doc.uploaded_by_user && (
                                                            <p className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-bold uppercase tracking-wider">
                                                                Par {doc.uploaded_by_user}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                                {doc.file_url && (
                                                    <DocumentPreviewDialog
                                                        fileUrl={doc.file_url}
                                                        documentType={doc.document_type || "Document"}
                                                        fileName={doc.file_url.split('/').pop()}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}
