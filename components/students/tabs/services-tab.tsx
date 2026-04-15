"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Home, Coffee, Baby, Loader2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ServicesTab({ studentId }: { studentId: number }) {
    const { data, isLoading } = useStudentServices(studentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Housing Section */}
            <section className="space-y-4">
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
            </section>

            {/* Meal Plans */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-muted-foreground" />
                    Meal Subscriptions
                </h3>
                {(data?.meals?.length === 0) ? (
                    <Card className="border-dashed bg-muted/20">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            No active meal plan subscription.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {data?.meals.map((m) => (
                            <Card key={m.id} className="overflow-hidden border-l-4 border-l-orange-500">
                                <CardContent className="p-4 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg">{m.meal_plan_detail.name}</p>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold">Monthly: {m.meal_plan_detail.monthly_cost} Fbu</Badge>
                                            <Badge variant={m.is_paid ? "default" : "destructive"} className="text-[10px] uppercase font-bold">
                                                {m.is_paid ? "Fully Paid" : "Payment Pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Remaining Balance</p>
                                        <p className="text-xl font-black text-orange-600 font-mono">{m.amount_remaining} Fbu</p>
                                        <p className="text-[10px] text-muted-foreground italic">Target: {format(new Date(m.start_date), "PPP")}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Daycare Section */}
            <section className="space-y-4">
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
            </section>
        </div>
    );
}
