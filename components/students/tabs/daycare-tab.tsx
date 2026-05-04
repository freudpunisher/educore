"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Baby, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function DaycareTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
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
                <Baby className="h-5 w-5 text-muted-foreground" />
                Daycare Services
            </h3>
            {(data?.daycare?.length === 0) ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No daycare subscriptions.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.daycare.map((d) => (
                        <Card key={d.id} className="overflow-hidden border-l-4 border-l-pink-500">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{d.daycare_name}</p>
                                    <p className="text-xs text-muted-foreground">Joined {format(new Date(d.start_date), "PPP")}</p>
                                </div>
                                <Badge variant={d.is_active ? "default" : "secondary"} className={d.is_active ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}>
                                    {d.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
