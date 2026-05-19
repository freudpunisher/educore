"use client";

import { useStudentServices } from "@/hooks/use-students";
import { 
    Home, 
    Coffee, 
    Baby, 
    Loader2, 
    Calendar, 
    Truck, 
    MapPin, 
    CreditCard, 
    ShieldCheck, 
    CheckCircle2, 
    XCircle,
    UserCheck,
    BedDouble
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

    const transport = data?.transport || [];
    const meals = data?.meals || [];
    const housing = data?.housing || [];
    const daycare = data?.daycare || [];

    const transportCount = transport.length;
    const mealsCount = meals.length;
    const housingCount = housing.length;
    const daycareCount = daycare.length;

    return (
        <div className="animate-in fade-in duration-500">
            <Tabs defaultValue="transport" className="w-full">
                {/* ── Sub-tabs Navigation List ── */}
                <div className="px-6 py-3 border-b bg-muted/5">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4 flex-wrap">
                        <TabsTrigger 
                            value="transport"
                            className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Truck className="h-3.5 w-3.5" />
                            Transport
                            {transportCount > 0 && (
                                <Badge className="ml-1 bg-primary/20 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground font-black text-[9px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                                    {transportCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="restaurant"
                            className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Coffee className="h-3.5 w-3.5" />
                            Restaurant
                            {mealsCount > 0 && (
                                <Badge className="ml-1 bg-primary/20 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground font-black text-[9px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                                    {mealsCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="boarding"
                            className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Home className="h-3.5 w-3.5" />
                            Boarding
                            {housingCount > 0 && (
                                <Badge className="ml-1 bg-primary/20 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground font-black text-[9px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                                    {housingCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="daycare"
                            className="group flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/50"
                        >
                            <Baby className="h-3.5 w-3.5" />
                            Daycare
                            {daycareCount > 0 && (
                                <Badge className="ml-1 bg-primary/20 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground font-black text-[9px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                                    {daycareCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* ── Sub-tabs Content Panes ── */}
                <div className="p-6 pb-40">
                    
                    {/* ── Transport Tab ── */}
                    <TabsContent value="transport" className="m-0 space-y-4">
                        {transportCount === 0 ? (
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-16 text-center space-y-3">
                                    <Truck className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Active Transport Routes</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">This student is not subscribed to school bus routes or transit itineraries.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {transport.map((t) => (
                                    <Card key={t.id} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-all group">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-base leading-tight uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                                                        {t.itinerary_detail?.fees_label || "Active Route"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                        <MapPin className="h-3 w-3 text-purple-500" />
                                                        <span>{t.itinerary_detail?.registration_number || "Subscribed"}</span>
                                                    </div>
                                                </div>
                                                <Badge 
                                                    variant={t.status === 'active' ? "default" : "secondary"} 
                                                    className={`${t.status === 'active' ? "bg-purple-500 hover:bg-purple-600" : ""} uppercase font-bold text-[9px] tracking-wider`}
                                                >
                                                    {t.status || "Active"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 pt-3 border-t">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                                    Enrolled: {t.enrollment_date ? format(new Date(t.enrollment_date), "MMM dd, yyyy") : "N/A"}
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
                        )}
                    </TabsContent>

                    {/* ── Restaurant/Meals Tab ── */}
                    <TabsContent value="restaurant" className="m-0 space-y-4">
                        {mealsCount === 0 ? (
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-16 text-center space-y-3">
                                    <Coffee className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Meal Plan Subscribed</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">This student is not registered in any canteen or dining hall service plans.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {meals.map((m) => (
                                    <Card key={m.id} className="overflow-hidden border-l-4 border-l-orange-500 hover:shadow-md transition-all group">
                                        <CardContent className="p-5 flex flex-col md:flex-row gap-8 md:items-center justify-between">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-extrabold text-lg leading-tight uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                                                        {m.meal_plan_detail?.name || "Standard Meal Plan"}
                                                    </p>
                                                    {m.meal_plan_detail?.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 max-w-md">{m.meal_plan_detail.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-black px-2.5 py-0.5 border-orange-200 bg-orange-500/5 text-orange-600">
                                                        Monthly: {m.meal_plan_detail?.monthly_cost?.toLocaleString() || "0"} Fbu
                                                    </Badge>
                                                    <Badge 
                                                        variant={m.is_paid ? "default" : "destructive"} 
                                                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 tracking-wider ${m.is_paid ? "bg-green-500 hover:bg-green-600" : ""}`}
                                                    >
                                                        {m.is_paid ? "Paid" : "Pending Payment"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end gap-1.5 p-4 bg-muted/40 rounded-2xl min-w-[220px]">
                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-80">Remaining Balance</p>
                                                <p className="text-2xl font-black text-orange-600 font-mono tracking-tighter leading-none">{m.amount_remaining ? parseFloat(m.amount_remaining).toLocaleString() : "0"} Fbu</p>
                                                <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-1" />
                                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                                    Starts: {m.start_date ? format(new Date(m.start_date), "MMM dd, yyyy") : "N/A"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Boarding/Housing Tab ── */}
                    <TabsContent value="boarding" className="m-0 space-y-4">
                        {housingCount === 0 ? (
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-16 text-center space-y-3">
                                    <Home className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Dormitory or Boarding Detail</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">This student is not enrolled in any resident dormitories or boarding houses.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {housing.map((h) => (
                                    <Card key={h.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-all group">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-base leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                                        <BedDouble className="h-4 w-4 text-blue-500" />
                                                        {h.room_name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-75 tracking-widest mt-1">
                                                        {h.room_type} Room • Bed No.{h.bed_number}
                                                    </p>
                                                </div>
                                                <Badge 
                                                    variant={h.is_active ? "default" : "secondary"} 
                                                    className={`${h.is_active ? "bg-blue-500 hover:bg-blue-600" : ""} uppercase font-bold text-[9px] tracking-wider`}
                                                >
                                                    {h.is_active ? "Active" : "Past"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 text-xs pt-3 border-t">
                                                <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                    Since {h.start_date ? format(new Date(h.start_date), "MMM dd, yyyy") : "N/A"}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Daycare Tab ── */}
                    <TabsContent value="daycare" className="m-0 space-y-4">
                        {daycareCount === 0 ? (
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-16 text-center space-y-3">
                                    <Baby className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Daycare Service Subscription</p>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">This student is not enrolled in daycare or after-school care services.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {daycare.map((d) => (
                                    <Card key={d.id} className="overflow-hidden border-l-4 border-l-pink-500 hover:shadow-md transition-all group">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="font-bold text-base tracking-tight group-hover:text-pink-600 transition-colors uppercase leading-none">{d.daycare_name}</p>
                                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-pink-500" />
                                                    Registered: {d.start_date ? format(new Date(d.start_date), "MMM dd, yyyy") : "N/A"}
                                                </p>
                                            </div>
                                            <Badge 
                                                variant={d.is_active ? "default" : "secondary"} 
                                                className={`${d.is_active ? "bg-pink-500 hover:bg-pink-600 text-white" : ""} uppercase font-bold text-[9px] tracking-wider`}
                                            >
                                                {d.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
