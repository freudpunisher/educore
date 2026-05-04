"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Coffee, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function DiningTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
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
        </div>
    );
}
