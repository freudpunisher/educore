"use client";

import { useStudentTransactions } from "@/hooks/use-students";
import { Box, Loader2, Calendar, ClipboardCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function InventoryTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentTransactions(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const distributions = data?.distributions || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            {/* ── Tab Header ── */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-muted-foreground" />
                Material Distributions & Resource Allocation
            </h3>

            {/* ── Grid List ── */}
            {distributions.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-16 text-center text-sm text-muted-foreground">
                        <Box className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        No materials or equipment distributions recorded for this student in the selected period.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {distributions.map((item) => (
                        <Card key={item.id} className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/60">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-sm uppercase tracking-tight text-slate-800 dark:text-slate-100">
                                            {item.product_name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Distributed on {format(new Date(item.distribution_date), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                    <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-bold px-2 py-0.5 text-xs">
                                        Qty: {item.quantity || 1}
                                    </Badge>
                                </div>

                                {/* ── Status and Timings ── */}
                                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    {item.status && (
                                        <Badge 
                                            variant="outline" 
                                            className={`capitalize text-[9px] font-bold px-2 py-0.5 tracking-wider ${
                                                item.status === 'active' 
                                                    ? 'bg-green-500/10 text-green-600 border-green-200/50' 
                                                    : item.status === 'returned'
                                                    ? 'bg-blue-500/10 text-blue-600 border-blue-200/50'
                                                    : 'bg-orange-500/10 text-orange-600 border-orange-200/50'
                                            }`}
                                        >
                                            {item.status}
                                        </Badge>
                                    )}

                                    {/* Expected Return Date */}
                                    {item.expected_return_date && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                            <ClipboardCheck className="h-3.5 w-3.5" />
                                            <span>Return Limit: {format(new Date(item.expected_return_date), "MMM dd, yyyy")}</span>
                                        </div>
                                    )}

                                    {/* Returned Date */}
                                    {item.returned_date && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            <span>Returned on {format(new Date(item.returned_date), "MMM dd, yyyy")}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Notes/Remarks ── */}
                                {item.notes && (
                                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border text-xs text-muted-foreground italic">
                                        {item.notes}
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
