"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Home, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function BoardingTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentServices(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-muted-foreground" />
                Housing & Dormitory
            </h3>
            {(data?.housing?.length === 0) ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No active housing subscription.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.housing.map((h) => (
                        <Card key={h.id} className="overflow-hidden border-l-4 border-l-blue-500">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{h.room_name}</p>
                                        <p className="text-xs text-muted-foreground">{h.room_type} Room • Bed {h.bed_number}</p>
                                    </div>
                                    <Badge variant={h.is_active ? "default" : "secondary"} className={h.is_active ? "bg-blue-500 hover:bg-blue-600" : ""}>
                                        {h.is_active ? "Active" : "Past"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        From {format(new Date(h.start_date), "PPP")}
                                    </div>
                                    <div className="font-bold text-primary">{h.fees} Fbu</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
