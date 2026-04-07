"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ShieldAlert, FileText, UserCog, History } from "lucide-react";
import { DisciplineRecord } from "@/types/discipline";

interface BehaviorModalProps {
    record: DisciplineRecord | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BehaviorModal({ record, isOpen, onClose }: BehaviorModalProps) {
    if (!record) return null;

    const getStatusBadge = (status: DisciplineRecord["status"]) => {
        switch (status) {
            case "recorded":
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Recorded</Badge>;
            case "appealed":
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Appealed</Badge>;
            case "cancelled":
                return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-8 opacity-10">
                        <ShieldAlert className="w-32 h-32 rotate-12" />
                    </div>
                    <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8" />
                        Discipline Record Details
                    </DialogTitle>
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium">
                            <User className="w-4 h-4" />
                            {record.student_name || "Unknown Student"}
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium">
                            <History className="w-4 h-4" />
                            {getStatusBadge(record.status)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8 bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/5">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    <User className="w-4 h-4" /> Student Information
                                </h4>
                                <p className="text-lg font-bold">{record.student_name || "Unknown Student"}</p>
                                <p className="text-sm font-mono text-muted-foreground">ID: {record.student_enrollment}</p>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/5">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    <CalendarDays className="w-4 h-4" /> Date & Time
                                </h4>
                                <p className="text-lg font-bold">
                                    {format(new Date(record.date_incident), "EEEE dd MMMM yyyy", { locale: fr })}
                                </p>
                                <p className="text-sm text-muted-foreground">Recorded {format(new Date(record.date_incident), "HH:mm")}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-rose-700 uppercase tracking-wider mb-2">
                                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Disciplinary Action
                                </h4>
                                <p className="text-lg font-bold text-rose-900">{record.reason_name}</p>
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold uppercase tracking-tight">
                                    -{record.points_deducted} Points
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/5">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    <UserCog className="w-4 h-4" /> Authority
                                </h4>
                                <p className="text-lg font-bold">{record.recorded_by_name || "Administrator"}</p>
                                <p className="text-sm text-muted-foreground">Recorded By</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
                        <div className="bg-muted/20 p-6 rounded-2xl border border-muted-foreground/5">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                <FileText className="w-4 h-4" /> Incident Description
                            </h4>
                            <p className="text-foreground leading-relaxed italic">
                                "{record.description}"
                            </p>
                        </div>

                        {record.status === "appealed" && record.appeal_reason && (
                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 uppercase tracking-wider mb-3">
                                    <History className="w-4 h-4" /> Appeal Justification
                                </h4>
                                <p className="text-amber-900 leading-relaxed font-medium">
                                    {record.appeal_reason}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
