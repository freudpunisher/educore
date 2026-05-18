"use client";

import { useStudentServices } from "@/hooks/use-students";
import { Home, Coffee, Baby, Loader2, Calendar, Truck, MapPin, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ServicesTab({ studentId }: { studentId: number }) {
    const { data, isLoading } = useStudentServices(studentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 pb-40">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Services...</p>
                </div>
            </div>
        );
    }

    const hasServices = (data?.housing?.length ?? 0) > 0 ||
        (data?.meals?.length ?? 0) > 0 ||
        (data?.daycare?.length ?? 0) > 0 ||
        (data?.transport?.length ?? 0) > 0;

    if (!hasServices) {
        return (
            <div className="p-6 pb-40 animate-in fade-in duration-500">
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-20 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Truck className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold">No Active Services</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                This student is not currently subscribed to any additional school services.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 pb-40">
            {/* Housing Section */}
            {data?.housing && data.housing.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                            <Home className="h-5 w-5 text-blue-500" />
                            Housing & Dormitory
                        </h3>
                        <Badge variant="outline" className="font-bold border-blue-500/20 text-blue-600 bg-blue-500/5">
                            {data.housing.length} Active
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.housing.map((h) => (
                            <Card key={h.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-all group">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">{h.room_name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-widest mt-1">
                                                {h.room_type} Room • Bed {h.bed_number}
                                            </p>
                                        </div>
                                        <Badge variant={h.is_active ? "default" : "secondary"} className={h.is_active ? "bg-blue-500 hover:bg-blue-600" : ""}>
                                            {h.is_active ? "Active" : "Past"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-xs pt-3 border-t">
                                        <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                            Depuis {format(new Date(h.start_date), "MMM dd, yyyy")}
                                        </div>
                                        {/* <div className="font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                            {h.fees} Fbu
                                        </div> */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Meal Plans */}
            {data?.meals && data.meals.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                            <Coffee className="h-5 w-5 text-orange-500" />
                            Meal Subscriptions
                        </h3>
                        <Badge variant="outline" className="font-bold border-orange-500/20 text-orange-600 bg-orange-500/5">
                            {data.meals.length} Plans
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {data.meals.map((m) => (
                            <Card key={m.id} className="overflow-hidden border-l-4 border-l-orange-500 hover:shadow-md transition-all group">
                                <CardContent className="p-4 flex flex-col md:flex-row gap-8 md:items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="font-bold text-xl leading-tight uppercase tracking-tighter group-hover:text-orange-600 transition-colors">
                                            {m.meal_plan_detail.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-[10px] uppercase font-black px-2 py-0 border-orange-200">
                                                Mensuel: {m.meal_plan_detail.monthly_cost} Fbu
                                            </Badge>
                                            <Badge variant={m.is_paid ? "default" : "destructive"} className="text-[10px] uppercase font-bold px-2 py-0">
                                                {m.is_paid ? "Reglé" : "Paiement En Attente"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1.5 p-3 bg-muted/30 rounded-2xl min-w-[200px]">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Solde Restant</p>
                                        <p className="text-2xl font-black text-orange-600 font-mono tracking-tighter leading-none">{m.amount_remaining} Fbu</p>
                                        <p className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            Target: {format(new Date(m.start_date), "PPP")}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Daycare Section */}
            {data?.daycare && data.daycare.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                            <Baby className="h-5 w-5 text-pink-500" />
                            Daycare Services
                        </h3>
                        <Badge variant="outline" className="font-bold border-pink-500/20 text-pink-600 bg-pink-500/5">
                            {data.daycare.length} Subscribed
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.daycare.map((d) => (
                            <Card key={d.id} className="overflow-hidden border-l-4 border-l-pink-500 hover:shadow-md transition-all group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg tracking-tight group-hover:text-pink-600 transition-colors uppercase leading-none">{d.daycare_name}</p>
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-pink-500" />
                                            Inscrit le {format(new Date(d.start_date), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                    <Badge variant={d.is_active ? "default" : "secondary"} className={d.is_active ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}>
                                        {d.is_active ? "Actif" : "Inactif"}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Optional Transport Section (if exists) */}
            {data?.transport && data.transport.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                            <Truck className="h-5 w-5 text-purple-500" />
                            Transportation
                        </h3>
                        <Badge variant="outline" className="font-bold border-purple-500/20 text-purple-600 bg-purple-500/5">
                            {data.transport.length} Routes
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.transport.map((t) => (
                            <Card key={t.id} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-all group">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                                                {t.itinerary_detail?.fees_label || "Active Route"}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                <MapPin className="h-3 w-3 text-purple-500" />
                                                <span>{t.itinerary_detail?.registration_number || "Subscribed"}</span>
                                            </div>
                                        </div>
                                        <Badge variant={t.status === 'active' ? "default" : "secondary"} className={t.status === 'active' ? "bg-purple-500 hover:bg-purple-600" : ""}>
                                            {t.status || "Active"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 pt-3 border-t">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                            {format(new Date(t.enrollment_date), "MMM dd, yyyy")}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-black text-purple-700 bg-purple-500/5 px-2 py-1 rounded-lg">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            {t.itinerary_detail?.fees?.toLocaleString() || "0"} Fbu
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
