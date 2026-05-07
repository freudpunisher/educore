"use client";

import { useStudentTransactions } from "@/hooks/use-students";
import { Box, Loader2, Calendar } from "lucide-react";
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-muted-foreground" />
                Material Distributions & Resource Allocation
            </h3>
            {distributions.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No material distributions recorded.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {distributions.map((item) => (
                        <Card key={item.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm uppercase tracking-tight">{item.product_name}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase font-bold">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(item.distribution_date), "MMM dd, yyyy")}
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                            Qty: {item.quantity || 1}
                                        </Badge>
                                    </div>
                                </div>
                                {item.status && (
                                    <Badge variant="outline" className={`capitalize text-[9px] font-bold ${item.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-200/50' : 'bg-orange-500/10 text-orange-600 border-orange-200/50'}`}>
                                        {item.status}
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
