"use client";

import { 
    FileText, Download, PieChart, BarChart, Users, DollarSign, BookOpen, 
    Truck, Utensils, Home, Baby, Package, GraduationCap, Calendar 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAcademicYears } from "@/hooks/use-academic-data";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ReportsDashboard() {
    const { data: academicYears } = useAcademicYears();
    const [selectedYear, setSelectedYear] = useState<string>("current");

    const activeYearId = selectedYear === "current" 
        ? academicYears?.find(y => y.is_current)?.id 
        : parseInt(selectedYear);

    const reportCategories = [
        {
            title: "Academic Reports",
            description: "Grades, performance analysis, and report cards.",
            icon: GraduationCap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            reports: [
                { name: "Global Performance Index", format: "Excel/PDF" },
                { name: "Class Ranking Report", format: "PDF" },
                { name: "Subject Pass Rate Analysis", format: "Excel" },
            ]
        },
        {
            title: "Financial Reports",
            description: "Revenue, outstanding balances, and collections.",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            reports: [
                { name: "Monthly Revenue Summary", format: "Excel" },
                { name: "Unpaid Invoices List", format: "PDF" },
                { name: "Collection Efficiency Report", format: "Excel" },
            ]
        },
        {
            title: "Logistics & Services",
            description: "Transport, canteen, and boarding usage.",
            icon: Truck,
            color: "text-orange-600",
            bg: "bg-orange-50",
            reports: [
                { name: "Daily Transport Log", format: "PDF" },
                { name: "Canteen Consumption Report", format: "Excel" },
                { name: "Dormitory Occupancy List", format: "PDF" },
            ]
        },
        {
            title: "Inventory Reports",
            description: "Stock levels, distributions, and reconciliations.",
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50",
            reports: [
                { name: "Current Stock Inventory", format: "Excel" },
                { name: "Material Distribution History", format: "PDF" },
                { name: "Stock Movement Audit", format: "Excel" },
            ]
        }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Institutional Reports</h1>
                    <p className="text-muted-foreground">Centralized access to school reports and data exports.</p>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[240px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Scope Year Filter</p>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-white/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <SelectValue placeholder="Select Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="current" className="font-bold text-primary">Current Session (Default)</SelectItem>
                            {academicYears?.map((year) => (
                                <SelectItem key={year.id} value={year.id.toString()}>
                                    {year.start_year}-{year.end_year} {year.is_current ? "(Current)" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportCategories.map((category) => (
                    <Card key={category.title} className="overflow-hidden border-l-4 border-l-primary/10">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${category.bg} ${category.color}`}>
                                    <category.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{category.title}</CardTitle>
                                    <CardDescription>{category.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                {category.reports.map((report) => (
                                    <div key={report.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{report.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">{report.format}</Badge>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-primary-foreground rounded-full">
                            <PieChart className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Custom Report Builder</h3>
                            <p className="text-sm text-muted-foreground">Generate personalized reports based on your specific requirements.</p>
                        </div>
                    </div>
                    <Button className="gap-2">
                        <BarChart className="h-4 w-4" />
                        Start Custom Export
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
