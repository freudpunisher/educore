"use client";

import { StudentDetail } from "@/types/student";
import { Users, Phone, Mail, Badge as BadgeIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ParentContactsTab({ student }: { student: StudentDetail }) {
    const contacts = student.parents_info || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Parent / Guardian Contacts
            </h3>
            {contacts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                        <p className="text-muted-foreground">No parent/guardian contacts recorded.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((p: any, index: number) => (
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
                                {p.address && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="p-1.5 bg-primary/5 rounded-full"><BadgeIcon className="h-4 w-4 text-primary" /></div>
                                        <span className="truncate">{p.address}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
