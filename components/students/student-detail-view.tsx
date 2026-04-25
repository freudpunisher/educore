"use client";

import { StudentDetail } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Phone, Mail, Users, FileText, Calendar, GraduationCap, Wallet, Activity,
    Sparkles, ShoppingBag, Award, ClipboardList, Folder, BookOpen, CheckCircle
} from "lucide-react";
import { useValidateStudent } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { UploadStudentDocumentDialog } from "./upload-document-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { StudentPvcCardDialog } from "./student-pvc-card-dialog";
import { AcademicsTab } from "./tabs/academics-tab";
import { FinanceTab } from "./tabs/finance-tab";
import { LifeTab } from "./tabs/life-tab";
import { ServicesTab } from "./tabs/services-tab";
import { TransactionsTab } from "./tabs/transactions-tab";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentDetailViewProps {
    student: StudentDetail;
}

export function StudentDetailView({ student }: StudentDetailViewProps) {
    const validateMutation = useValidateStudent();

    const getEnrollmentDisplay = (info: any) => {
        if (!info) return "N/A";
        if (typeof info === "string") return info;
        if (typeof info === "object") {
            return info.classroom || info.class_level || "Linked";
        }
        return "N/A";
    };

    const getAccountDisplay = (info: any) => {
        if (!info) return "Inactive";
        if (typeof info === "string") return info;
        if (typeof info === "object") {
            return info.active ? "Active" : "Inactive";
        }
        return "Inactive";
    };

    return (
        <div className="h-full flex flex-col">
            {/* Persistent Overview Section at Top */}
            <div className="p-6 border-b bg-muted/5">
                {/* Student Identity Header */}
                <div className="flex items-center gap-5 mb-5">
                    {(() => {
                        const imgSrc = (student as any).image as string | null | undefined;
                        const initials = student.full_name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
                        return imgSrc ? (
                            <img
                                src={imgSrc}
                                alt={student.full_name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20 shadow-md flex-shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0 border-4 border-primary/20 shadow-md">
                                {initials}
                            </div>
                        );
                    })()}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold tracking-tight">{student.full_name}</h2>
                        <p className="text-muted-foreground text-sm mt-0.5">{student.enrollment_number}</p>
                    </div>
                    <StudentPvcCardDialog student={student as any} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Academic Info */}
                    <Card className="bg-background/50 backdrop-blur-sm border-primary/10">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold flex items-center gap-2 text-primary">
                                    <GraduationCap className="h-4 w-4" /> Academic Snapshot
                                </h4>
                                {!student.is_enrolled && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-2 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700 font-semibold"
                                        onClick={() => validateMutation.mutate(student.id)}
                                        disabled={validateMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        {validateMutation.isPending ? "Validation..." : "Valider l'élève"}
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-y-2">
                                <span className="text-muted-foreground">Enrollment No:</span>
                                <code className="font-mono bg-muted px-2 py-0.5 rounded text-[11px] w-fit">{student.enrollment_number}</code>

                                <span className="text-muted-foreground">Class/Level:</span>
                                <span className="font-medium">{getEnrollmentDisplay(student.enrollment_info)}</span>

                                <span className="text-muted-foreground">Enrollment Date:</span>
                                <span className="font-medium">{format(new Date(student.enrollment_date), "MMM dd, yyyy")}</span>

                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={student.is_enrolled ? "default" : "secondary"} className="w-fit scale-90 origin-left">
                                    {student.is_enrolled ? "Currently Enrolled" : "Not Enrolled"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Stats */}
                    <Card className="bg-background/50 backdrop-blur-sm border-primary/10">
                        <CardContent className="p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-primary">
                                <Calendar className="h-4 w-4" /> Personal Details
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2">
                                <span className="text-muted-foreground">Gender:</span>
                                <Badge variant="outline" className="w-fit scale-90 origin-left capitalize">{student.gender === 1 ? "Girl" : "Boy"}</Badge>

                                <span className="text-muted-foreground">Birthday:</span>
                                <span className="font-medium">
                                    {student.date_of_birth ? format(new Date(student.date_of_birth), "PPP") : "N/A"}
                                </span>

                                <span className="text-muted-foreground">Account Status:</span>
                                <span className="font-medium capitalize flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${(student.account_info && typeof student.account_info === 'object' && 'active' in student.account_info && student.account_info.active) ? 'bg-green-500' : 'bg-destructive'}`} />
                                    {getAccountDisplay(student.account_info)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="academics" className="flex-1 flex flex-col">
                <div className="px-6 border-b bg-card">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger
                            value="academics"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Academics
                        </TabsTrigger>
                        <TabsTrigger
                            value="finance"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Finance
                        </TabsTrigger>
                        <TabsTrigger
                            value="family"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Family
                        </TabsTrigger>
                        <TabsTrigger
                            value="life"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Student Life
                        </TabsTrigger>
                        <TabsTrigger
                            value="services"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Services
                        </TabsTrigger>
                        <TabsTrigger
                            value="inventory"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Transactions
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-sm"
                        >
                            Documents
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">

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

                    <TabsContent value="academics" className="p-6 m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <AcademicsTab studentId={student.id} />
                    </TabsContent>

                    <TabsContent value="finance" className="p-6 m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FinanceTab studentId={student.id} />
                    </TabsContent>

                    <TabsContent value="life" className="p-6 m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <LifeTab studentId={student.id} />
                    </TabsContent>

                    <TabsContent value="services" className="p-6 m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <ServicesTab studentId={student.id} />
                    </TabsContent>

                    <TabsContent value="inventory" className="p-6 m-0 animate-in fade-in slide-in-from-left-4 duration-300">
                        <TransactionsTab studentId={student.id} />
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}
