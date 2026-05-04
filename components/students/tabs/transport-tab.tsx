"use client";

import { Truck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TransportTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    // Integration logic here when backend is ready
    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Transportation Services
            </h3>
            <Card className="border-dashed bg-muted/20">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No active transportation subscription found for this student.
                </CardContent>
            </Card>
        </div>
    );
}
