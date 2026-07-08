"use client";

import { StudentDetail, StudentParent } from "@/types/student";
import {
    Users, Phone, Mail, Star, UserCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ParentContactsTabProps {
    student: StudentDetail;
}

function ParentCard({ parent }: { parent: StudentParent }) {
    return (
        <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border ${parent.is_primary ? "border-amber-400/30 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-900/10" : "hover:border-primary/20"}`}>
            {parent.is_primary && (
                <div className="absolute top-0 right-0">
                    <div className="bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl rounded-tr-[calc(var(--radius)-1px)] flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        Primary
                    </div>
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner transition-transform group-hover:scale-105 duration-300 ${parent.is_primary ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"}`}>
                        <UserCircle2 className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <p className="font-black text-lg text-foreground leading-tight">{parent.full_name || "—"}</p>
                        <Badge
                            variant="outline"
                            className="capitalize text-[10px] font-bold mt-1.5 mb-4 px-2 py-0.5"
                        >
                            {parent.relationship || "Guardian"}
                        </Badge>

                        <div className="space-y-2.5">
                            {parent.phone ? (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/8 rounded-lg flex-shrink-0">
                                        <Phone className="h-3.5 w-3.5 text-primary/70" />
                                    </div>
                                    <a
                                        href={`tel:${parent.phone}`}
                                        className="font-medium hover:text-primary transition-colors truncate"
                                    >
                                        {parent.phone}
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground/50">
                                    <div className="p-1.5 bg-muted/50 rounded-lg flex-shrink-0">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="italic text-xs">No phone recorded</span>
                                </div>
                            )}

                            {parent.email ? (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-primary/8 rounded-lg flex-shrink-0">
                                        <Mail className="h-3.5 w-3.5 text-primary/70" />
                                    </div>
                                    <a
                                        href={`mailto:${parent.email}`}
                                        className="font-medium hover:text-primary transition-colors truncate"
                                    >
                                        {parent.email as string}
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ParentContactsTab({ student }: ParentContactsTabProps) {
    const parents: StudentParent[] = student.parents_info ?? [];

    // Sort: primary first
    const sorted = [...parents].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Parent / Guardian Contacts
                </h3>
                <Badge variant="secondary" className="font-bold text-xs">
                    {parents.length} contact{parents.length !== 1 ? "s" : ""}
                </Badge>
            </div>

            {sorted.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                        <p className="font-semibold text-muted-foreground">No guardian contacts recorded.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Parent/guardian information will appear here once added.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sorted.map((parent, index) => (
                        <ParentCard key={index} parent={parent} />
                    ))}
                </div>
            )}
        </div>
    );
}
