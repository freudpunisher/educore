"use client";

import { StudentDetail } from "@/types/student";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users, FileText, Calendar, GraduationCap, Wallet, Activity,
    Sparkles, Award, ClipboardList, Folder, BookOpen, CheckCircle,
    DollarSign, ShieldAlert, LayoutGrid, Package, Trash2,
    Phone,
    Mail
} from "lucide-react";
import { useStudentFinance, useStudentLife, useValidateStudent } from "@/hooks/use-students";
import { useAcademicYears } from "@/hooks/use-academic-data";
import { useDeleteStudent } from "@/hooks/use-delete-student";
import { Button } from "@/components/ui/button";
import { UploadStudentDocumentDialog } from "./upload-document-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { StudentPvcCardDialog } from "./student-pvc-card-dialog";
import { AcademicsTab } from "./tabs/academics-tab";
import { FinanceTab } from "./tabs/finance-tab";
import { BehaviorTab } from "./tabs/behavior-tab";
import { AttendanceTab } from "./tabs/attendance-tab";
import { ServicesTab } from "./tabs/services-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { ParentInfoTab } from "./tabs/parent-info-tab";
import { ParentContactsTab } from "./tabs/parent-contacts-tab";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const ROLE_TABS: Record<string, string[]> = {
    accountant: ["invoicing"],
};

const TAB_ICONS: Record<string, React.ReactNode> = {
    academics: <GraduationCap className="h-4 w-4" />,
    invoicing: <DollarSign className="h-4 w-4" />,
    behavior: <ShieldAlert className="h-4 w-4" />,
    attendance: <Activity className="h-4 w-4" />,
    services: <LayoutGrid className="h-4 w-4" />,
    inventory: <Package className="h-4 w-4" />,
    "parent-info": <Users className="h-4 w-4" />,
    "parent-contacts": <Users className="h-4 w-4" />,
    documents: <FileText className="h-4 w-4" />,
};

const TAB_LABELS: Record<string, string> = {
    academics: "Academics",
    invoicing: "Invoicing",
    behavior: "Behavior",
    attendance: "Attendance",
    services: "Services",
    inventory: "Distribution",
    "parent-info": "Parent Information",
    "parent-contacts": "Parent / Guardian Contacts",
    documents: "Documents",
};

const ALL_TABS = ["academics", "invoicing", "behavior", "attendance", "services", "inventory", "parent-info", "parent-contacts", "documents"];

function getAllowedTabs(role: string | undefined): string[] {
    if (!role) return ALL_TABS;
    return ROLE_TABS[role] || ALL_TABS;
}

export function StudentDetailView({ student }: StudentDetailViewProps) {
    const { user } = useAuth();
    const role = user?.role;
    const allowedTabs = getAllowedTabs(role);
    const defaultTab = allowedTabs.includes("invoicing") && role === "accountant" ? "invoicing" : allowedTabs[0];

    const validateMutation = useValidateStudent();
    const deleteMutation = useDeleteStudent();
    const { data: academicYears } = useAcademicYears();
    const [selectedYear, setSelectedYear] = useState<string>("current");

    const activeYearId = selectedYear === "current"
        ? academicYears?.find(y => y.is_current)?.id
        : parseInt(selectedYear);

    const { data: finance } = useStudentFinance(activeYearId ? student.id : null, activeYearId);
    const { data: life } = useStudentLife(activeYearId ? student.id : null, activeYearId);

    const getEnrollmentDisplay = (info: any) => {
        const currentClass = student.current_class;
        if (currentClass) {
            return `${currentClass.class_name} (${currentClass.academic_year})`;
        }
        if (!info) return "N/A";
        return info.classroom || "Linked";
    };

    const totalCount = life?.attendance_stats?.total_count || 0;
    const attendanceRate = totalCount > 0
        ? Math.round(((life?.attendance_stats?.present_count || 0) / totalCount) * 100)
        : 0;

    const hasArrears = finance ? parseFloat(finance.outstanding_balance) > 0 : false;

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header / Overview */}
            <div className="p-8 pb-0 space-y-8 flex-shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="h-28 w-28 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary overflow-hidden border-4 border-background shadow-2xl transition-transform hover:scale-105 duration-500">
                                {student.image ? (
                                    <img src={student.image} alt={student.full_name} className="h-full w-full object-cover" />
                                ) : (
                                    <Users className="h-12 w-12 opacity-40 shadow-inner" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-9 w-9 bg-emerald-500 border-4 border-background rounded-full shadow-lg flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h1 className="text-4xl font-black tracking-tight text-foreground">{student.full_name}</h1>
                                <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-none font-black text-xs px-3 py-1 uppercase tracking-tighter">
                                    {student.enrollment_number || `STU-${student.id}`}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground/70 bg-card/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-border/50">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <span>{getEnrollmentDisplay(student.enrollment_info)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground/70 bg-card/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-border/50">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    <span>{student.date_of_birth ? format(new Date(student.date_of_birth), "dd MMM yyyy") : "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground/70 bg-card/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-border/50">
                                    <Activity className="h-4 w-4 text-emerald-500" />
                                    <span className="capitalize">{student.gender === 1 ? "Male" : "Female"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="h-12 w-[220px] rounded-2xl bg-card/80 border-none shadow-sm hover:shadow-md transition-all font-bold text-foreground/80">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Academic Year" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="current" className="font-bold text-primary">Current Session</SelectItem>
                                    {academicYears?.map((year) => (
                                        <SelectItem key={year.id} value={year.id.toString()}>
                                            {year.academic_year_display || `${year.start_year}-${year.end_year}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <StudentPvcCardDialog student={student as any} />
                        {!student.is_validate && role === "academic_principal" && (
                            <Button
                                onClick={() => validateMutation.mutate(student.id)}
                                disabled={validateMutation.isPending}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-12 px-8 shadow-xl shadow-orange-500/20 gap-2 font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95"
                            >
                                <Sparkles className="h-4 w-4" />
                                Validate
                            </Button>
                        )}
                        {role && ["system_admin"].includes(role) && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (confirm(`Delete student "${student.full_name}"? This action cannot be undone.`)) {
                                        deleteMutation.mutate(student.id);
                                    }
                                }}
                                disabled={deleteMutation.isPending}
                                className="rounded-2xl h-12 px-6 gap-2 text-xs"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                    {/* Enrollment Card */}
                    <div className="relative overflow-hidden group bg-card/40 backdrop-blur-xl rounded-[2rem] p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5 cursor-default border border-border/50">
                        <Users className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.2em]">Enrollment</p>
                                <p className="text-xl font-black text-foreground line-clamp-1">{student.current_class?.class_name || "Enrolled"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Status Card */}
                    <div className="relative overflow-hidden group bg-card/40 backdrop-blur-xl rounded-[2rem] p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5 cursor-default border border-border/50">
                        <Wallet className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl shadow-inner ${hasArrears ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-[0.2em]">Financial Status</p>
                                <p className={`text-xl font-black ${hasArrears ? 'text-orange-600' : 'text-emerald-700'}`}>{hasArrears ? "Arrears" : "Good Standing"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Card */}
                    <div className="relative overflow-hidden group bg-card/40 backdrop-blur-xl rounded-[2rem] p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5 cursor-default border border-border/50">
                        <CheckCircle className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl shadow-inner">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-purple-600/50 uppercase tracking-[0.2em]">Active Presence</p>
                                <p className="text-xl font-black text-foreground">{attendanceRate}% Ratio</p>
                            </div>
                        </div>
                    </div>

                    {/* Discipline Card */}
                    <div className="relative overflow-hidden group bg-card/40 backdrop-blur-xl rounded-[2rem] p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5 cursor-default border border-border/50">
                        <Award className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-600/50 uppercase tracking-[0.2em]">Merit Score</p>
                                <p className="text-xl font-black text-foreground">{life?.discipline_score || "10.0"}/10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar flex-shrink-0">
                    <TabsList className="w-max justify-start h-auto p-0 bg-transparent gap-4">
                        {allowedTabs.map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="group flex items-center gap-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                            >
                                {TAB_ICONS[tab]}
                                {TAB_LABELS[tab]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    {allowedTabs.includes("academics") && (
                        <TabsContent value="academics" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <AcademicsTab studentId={student.id} academicYearId={activeYearId} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("invoicing") && (
                        <TabsContent value="invoicing" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <FinanceTab studentId={student.id} academicYearId={activeYearId} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("behavior") && (
                        <TabsContent value="behavior" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <BehaviorTab studentId={student.id} academicYearId={activeYearId} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("attendance") && (
                        <TabsContent value="attendance" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <AttendanceTab studentId={student.id} academicYearId={activeYearId} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("services") && (
                        <TabsContent value="services" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300 overflow-visible">
                            <ServicesTab studentId={student.id} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("inventory") && (
                        <TabsContent value="inventory" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <InventoryTab studentId={student.id} academicYearId={activeYearId} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("parent-info") && (
                        <TabsContent value="parent-info" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <ParentInfoTab student={student} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("parent-contacts") && (
                        <TabsContent value="parent-contacts" className="m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <ParentContactsTab student={student} />
                        </TabsContent>
                    )}

                    {allowedTabs.includes("documents") && (
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
                                    {student.documents?.map((doc: any, idx: number) => {
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
                                                                {doc.uploaded_at ? `Uploaded on ${format(new Date(doc.uploaded_at), "PPP")}` : "Unknown date"}
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
                    )}
                </ScrollArea>
            </Tabs>
        </div>
    );
}
