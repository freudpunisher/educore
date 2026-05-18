"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Truck, Loader2, Calendar, MapPin, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function TransportTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentServices(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const subscriptions = data?.transport || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Transportation Services
            </h3>
            {subscriptions.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No active transportation subscription found for this student.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptions.map((s) => (
                        <Card key={s.id} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg leading-tight uppercase tracking-tight">
                                            {s.itinerary_detail?.fees_label || "Active Route"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{s.itinerary_detail?.registration_number || "Subscribed"}</span>
                                        </div>
                                    </div>
                                    <Badge variant={s.status === 'active' ? "default" : "secondary"} className={s.status === 'active' ? "bg-purple-500 hover:bg-purple-600" : ""}>
                                        {s.status || "Active"}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Enrollment Date</p>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                            {format(new Date(s.enrollment_date), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Route Fee</p>
                                        <div className="flex items-center justify-end gap-1.5 text-sm font-black text-purple-700">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            {s.itinerary_detail?.fees?.toLocaleString() || "0"} Fbu
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
