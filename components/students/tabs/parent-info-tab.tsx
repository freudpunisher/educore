"use client";

import { StudentDetail } from "@/types/student";
import { User, Phone, Briefcase, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ParentInfoTab({ student }: { student: StudentDetail }) {
    const hasFather = student.father_full_name;
    const hasMother = student.mother_full_name;
    const hasAddress = student.address_parent_quarter || student.address_parent_commune || student.address_parent_province;

    if (!hasFather && !hasMother) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    Parent Information
                </h3>
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                        <p className="text-muted-foreground">No parent information recorded.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasFather && (
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                Father
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 bg-primary/5 rounded-full">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{student.father_full_name}</span>
                            </div>
                            {student.father_phone_number && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/5 rounded-full">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{student.father_phone_number}</span>
                                </div>
                            )}
                            {student.father_job_name && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/5 rounded-full">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{student.father_job_name}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {hasMother && (
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-pink-500" />
                                Mother
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 bg-primary/5 rounded-full">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{student.mother_full_name}</span>
                            </div>
                            {student.mother_phone_number && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/5 rounded-full">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{student.mother_phone_number}</span>
                                </div>
                            )}
                            {student.mother_job_name && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/5 rounded-full">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{student.mother_job_name}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {hasAddress && (
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Parent Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="p-1.5 bg-primary/5 rounded-full">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <span>
                                {[student.address_parent_quarter, student.address_parent_commune, student.address_parent_province]
                                    .filter(Boolean)
                                    .join(", ") || "No address recorded"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
