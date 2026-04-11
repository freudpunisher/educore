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
        <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-6 border-b bg-card">
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
                        value="documents"
                        className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 py-3 text-base"
                    >
                        Documents
                    </TabsTrigger>
                </TabsList>
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
                                        <span className="font-medium">{getEnrollmentDisplay(student.enrollment_info)}</span>
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
                                        <span className="font-medium capitalize">{getAccountDisplay(student.account_info)}</span>
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
                    {student.parents_info?.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No family information recorded.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.parents_info?.map((p, index) => (
                                <Card key={index} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                                    {p.is_primary_contact && (
                                        <div className="absolute top-0 right-0">
                                            <Badge className="rounded-tr-none rounded-bl-lg text-[10px] uppercase font-bold" variant="default">Primary</Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <p className="font-bold text-lg">
                                            {p.first_name} {p.last_name}
                                        </p>
                                        <Badge variant="outline" className="w-fit capitalize text-xs bg-muted/50">
                                            {p.relationship}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-1.5 bg-primary/5 rounded-full"><Phone className="h-4 w-4 text-primary" /></div>
                                            <span>{p.phone_number || "No phone recorded"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-1.5 bg-primary/5 rounded-full"><Mail className="h-4 w-4 text-primary" /></div>
                                            <span className="truncate">{p.email || "No email recorded"}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="p-6 m-0 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Academic Documents
                    </h3>
                    {student.documents?.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {student.documents?.map((doc) => (
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

