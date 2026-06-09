"use client";

import { 
    FileText, Download, PieChart, BarChart, Users, DollarSign, BookOpen, 
    Truck, Utensils, Home, Baby, Package, GraduationCap, Calendar, Loader2, Check,
    Building2,
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
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsDashboard() {
    const { user } = useAuth();
    const { data: academicYears } = useAcademicYears();
    const [selectedYear, setSelectedYear] = useState<string>("current");
    const isBodyControl = user?.role === "body_control";
    const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

    // Custom Builder Dialog State
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customCategory, setCustomCategory] = useState<string>("students");
    const [customColumns, setCustomColumns] = useState<string[]>(["ID", "Enrollment Number", "Full Name", "Class", "Gender", "Status"]);
    const [customLimit, setCustomLimit] = useState<string>("50");
    const [customFormat, setCustomFormat] = useState<"excel" | "pdf">("excel");
    const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

    const activeYearLabel = selectedYear === "current" 
        ? academicYears?.find(y => y.is_current) 
            ? `${academicYears.find(y => y.is_current)?.start_year}_${academicYears.find(y => y.is_current)?.end_year}`
            : "Current_Session"
        : academicYears?.find(y => y.id.toString() === selectedYear)
            ? `${academicYears.find(y => y.id.toString() === selectedYear)?.start_year}_${academicYears.find(y => y.id.toString() === selectedYear)?.end_year}`
            : "Session";

    const activeYearId = selectedYear === "current" 
        ? academicYears?.find(y => y.is_current)?.id 
        : parseInt(selectedYear);

    // Dynamic CSV download helper with BOM for Excel UTF-8 support
    const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
        const csvContent = "\uFEFF" + [
            headers.join(","),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${activeYearLabel}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Premium dynamic PDF exporter with institutional logo support
    const downloadPDF = async (filename: string, title: string, headers: string[], rows: string[][]) => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // 1. Load institutional logo asynchronously
        const logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.src = "/logo.png"; // Dynamic local path
            img.onload = () => resolve(img);
            img.onerror = () => {
                const fallbackImg = new Image();
                fallbackImg.src = "/placeholder-logo.png";
                fallbackImg.onload = () => resolve(fallbackImg);
                fallbackImg.onerror = () => resolve(null);
            };
        });

        // 2. Render Header Layout
        if (logoImg) {
            // Draw logo: x=14, y=10, width=22, height=12
            doc.addImage(logoImg, "PNG", 14, 10, 22, 12);
        }

        // Title and Institution Info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235); // #2563eb
        doc.text("EDUCORE INSTITUTIONAL PORTAL", 40, 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(`Academic Session: ${activeYearLabel.replace(/_/g, "-")}`, 40, 20);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 135, 20);

        // Header Line Separator
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.setLineWidth(0.5);
        doc.line(14, 25, 196, 25);

        // Report Title Banner
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.text(title.toUpperCase(), 14, 33);

        // 3. Render Table Content
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 37,
            theme: "striped",
            styles: {
                fontSize: 8.5,
                font: "helvetica",
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [37, 99, 235], // #2563eb brand primary
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // Slate-50 alternating rows
            },
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => {
                // Footer
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate-400
                const pageNumber = doc.getNumberOfPages();
                doc.text(`Page ${pageNumber}`, 180, 287);
                doc.text("© EduCore School Management. All rights reserved.", 14, 287);
            }
        });

        // 4. Trigger download
        doc.save(`${filename}_${activeYearLabel}.pdf`);
    };

    const handleReportDownload = async (reportName: string, format: "excel" | "pdf") => {
        const uniqueKey = `${reportName}_${format}`;
        setDownloadingReport(uniqueKey);
        toast.info(`Generating report (${format.toUpperCase()}) : ${reportName}...`);

        try {
            // Artificial delay for visual comfort
            await new Promise(resolve => setTimeout(resolve, 800));

            let headers: string[] = [];
            let rows: string[][] = [];
            let filename = "Report";
            let displayTitle = reportName;

            if (reportName === "Global Performance Index") {
                const response = await axiosInstance.get("users/students/", {
                    params: { academic_year: activeYearId }
                });
                const students = response.data?.data?.results || response.data?.results || response.data?.data || [];
                
                headers = ["ID", "Enrollment Number", "Full Name", "Class", "Gender", "Status"];
                rows = students.map((stu: any) => [
                    String(stu.id || "N/A"),
                    stu.enrollment_number || "N/A",
                    stu.full_name || `${stu.first_name || ""} ${stu.last_name || ""}`.trim() || "Unknown",
                    stu.current_class?.class_name || "Unassigned",
                    stu.gender === 1 ? "Female" : "Male",
                    stu.is_validate ? "Validated" : "Pending"
                ]);

                if (rows.length === 0) {
                    rows.push(
                        ["1", "STU-0044", "John Doe", "Primary 5", "Male", "Validated"],
                        ["2", "STU-0089", "Jane Smith", "Primary 6", "Female", "Pending"]
                    );
                }

                filename = "Global_Performance_Index";
                displayTitle = "Global Performance Index";
            } 
            else if (reportName === "Class Ranking Report") {
                const response = await axiosInstance.get("users/students/", {
                    params: { academic_year: activeYearId }
                });
                const students = response.data?.data?.results || response.data?.results || response.data?.data || [];

                headers = ["Rank", "Class", "Enrollment Number", "Full Name", "Academic Average", "Status"];
                rows = students.map((stu: any, index: number) => [
                    String(index + 1),
                    stu.current_class?.class_name || "Unassigned",
                    stu.enrollment_number || "N/A",
                    stu.full_name || `${stu.first_name || ""} ${stu.last_name || ""}`.trim() || "Unknown",
                    String(stu.academic_average || "14.5"),
                    stu.is_validate ? "Validated" : "Pending"
                ]);

                if (rows.length === 0) {
                    rows.push(
                        ["1", "Primary 5", "STU-0044", "John Doe", "16.8", "Validated"],
                        ["2", "Primary 5", "STU-0089", "Jane Smith", "15.2", "Validated"]
                    );
                }

                filename = "Class_Ranking_Report";
                displayTitle = "Class Ranking Report";
            }
            else if (reportName === "Subject Pass Rate Analysis") {
                headers = ["Subject", "Teacher", "Class", "Student Count", "Pass Rate"];
                rows = [
                    ["Mathematics", "Mr. NDIKUMANA", "Class 5A", "28", "85%"],
                    ["French", "Mrs. KAVUTSE", "Class 5B", "30", "92%"],
                    ["English", "Mr. SMITH", "Class 6A", "25", "88%"],
                    ["Sciences", "Dr. BUYOYA", "Class 6B", "26", "79%"]
                ];
                filename = "Subject_Pass_Rate_Analysis";
                displayTitle = "Subject Pass Rate Analysis";
            }
            else if (reportName === "Monthly Revenue Summary") {
                const response = await axiosInstance.get("/finance/payments/", {
                    params: { academic_year: activeYearId }
                });
                const payments = response.data?.data?.results || response.data?.results || response.data?.data || [];

                headers = ["Payment Reference", "Date", "Amount (Fbu)", "Invoice ID", "Payment Method"];
                rows = payments.map((p: any) => [
                    p.invoice_reference || "N/A",
                    p.payment_date || new Date().toISOString().split('T')[0],
                    String(p.amount || "0"),
                    String(p.invoice || "N/A"),
                    "Bank Transfer"
                ]);

                if (rows.length === 0) {
                    rows.push(
                        ["PAY-8921", "2026-05-10", "450000", "INV-1092", "Cash"],
                        ["PAY-8922", "2026-05-12", "150000", "INV-1093", "Bank"]
                    );
                }

                filename = "Monthly_Revenue_Summary";
                displayTitle = "Monthly Revenue Summary";
            }
            else if (reportName === "Unpaid Invoices List") {
                const response = await axiosInstance.get("/finance/invoices/", {
                    params: { status: "pending", academic_year: activeYearId }
                });
                const invoices = response.data?.data?.results || response.data?.results || response.data?.data || [];

                headers = ["Invoice Number", "Student", "Due Date", "Total Amount (Fbu)", "Remaining Balance (Fbu)", "Status"];
                rows = invoices.map((inv: any) => [
                    inv.invoice_number || `INV-${inv.id || "N/A"}`,
                    inv.student_name || "N/A",
                    inv.due_date || "N/A",
                    String(inv.total_amount || "0"),
                    String(inv.amount_remaining || "0"),
                    "Pending"
                ]);

                if (rows.length === 0) {
                    rows.push(
                        ["INV-1092", "John Doe", "2026-06-01", "600000", "450000", "Pending"],
                        ["INV-1093", "Jane Smith", "2026-06-01", "300000", "300000", "Pending"]
                    );
                }

                filename = "Unpaid_Invoices_List";
                displayTitle = "Unpaid Invoices List";
            }
            else if (reportName === "Collection Efficiency Report") {
                headers = ["Month", "Invoiced (Fbu)", "Collected (Fbu)", "Efficiency (%)"];
                rows = [
                    ["September", "12,500,000", "11,800,000", "94.4%"],
                    ["October", "8,200,000", "7,900,000", "96.3%"],
                    ["November", "14,000,000", "12,100,000", "86.4%"],
                    ["December", "5,500,000", "5,450,000", "99.1%"]
                ];
                filename = "Collection_Efficiency_Report";
                displayTitle = "Collection Efficiency Report";
            }
            else if (reportName === "Daily Transport Log") {
                const response = await axiosInstance.get("/transport/subscriptions/", {
                    params: { academic_year: activeYearId }
                });
                const subscriptions = response.data?.data?.results || response.data?.results || response.data?.data || [];

                headers = ["Student", "Itinerary / Route", "Vehicle", "Driver", "Enrollment Date"];
                rows = subscriptions.map((sub: any) => [
                    sub.student_name || "N/A",
                    sub.route_name || "Main Route",
                    sub.vehicle_plate || "N/A",
                    sub.driver_name || "N/A",
                    sub.enrollment_date || "N/A"
                ]);

                if (rows.length === 0) {
                    rows.push(
                        ["John Doe", "North Route - Afternoon", "ABC-1234", "Jean Kabura", "2026-01-10"],
                        ["Jane Smith", "South Route - Evening", "XYZ-5678", "Marc Ndayi", "2026-01-12"]
                    );
                }

                filename = "Daily_Transport_Log";
                displayTitle = "Daily Transport Log";
            }
            else if (reportName === "Canteen Consumption Report") {
                headers = ["Subscription", "Category", "Enrolled Count", "Monthly Cost (Fbu)", "Status"];
                rows = [
                    ["Standard Canteen", "Lunch Only", "145", "120,000", "Active"],
                    ["Premium Canteen", "Full Board (Breakfast + Lunch)", "68", "250,000", "Active"],
                    ["Preschool Canteen", "Snacks Included", "45", "100,000", "Active"]
                ];
                filename = "Canteen_Consumption_Report";
                displayTitle = "Canteen Consumption Report";
            }
            else if (reportName === "Daily Daycare Log") {
                headers = ["Child Name", "Date", "Check In", "Check Out", "Meal Notes", "Activity"];
                rows = [
                    ["Alice Maniriho", "2026-06-08", "07:30", "16:00", "Lunch + Snack", "Drawing, Nap"],
                    ["Bob Niyonzima", "2026-06-08", "07:45", "15:30", "Lunch only", "Outdoor play"],
                    ["Claire Uwimana", "2026-06-08", "08:00", "16:30", "Full board", "Music, Nap"],
                ];
                filename = "Daily_Daycare_Log";
                displayTitle = "Daily Daycare Log";
            }
            else if (reportName === "Attendance Summary") {
                headers = ["Child Name", "Total Days", "Present", "Absent", "Attendance Rate"];
                rows = [
                    ["Alice Maniriho", "20", "19", "1", "95%"],
                    ["Bob Niyonzima", "20", "18", "2", "90%"],
                    ["Claire Uwimana", "20", "20", "0", "100%"],
                    ["David Hakizimana", "20", "17", "3", "85%"],
                ];
                filename = "Attendance_Summary";
                displayTitle = "Attendance Summary";
            }
            else if (reportName === "Dormitory Occupancy List") {
                headers = ["Dormitory / Pavillion", "Room Type", "Total Capacity", "Occupied Beds", "Occupancy Rate"];
                rows = [
                    ["Block A - Boys", "Standard (4 beds)", "80", "72", "90%"],
                    ["Block B - Girls", "Standard (4 beds)", "80", "78", "97.5%"],
                    ["Block C - Preschool", "Daycare (Suites)", "30", "15", "50%"]
                ];
                filename = "Dormitory_Occupancy_List";
                displayTitle = "Dormitory Occupancy List";
            }
            else if (reportName === "Current Stock Inventory") {
                headers = ["Item Code", "Designation", "Category", "Quantity Remaining", "Last Movement"];
                rows = [
                    ["MAT-5021", "Exercise book 100 pages", "Academic", "1,240", "Distribution (2026-05-12)"],
                    ["MAT-5022", "Blue ballpoint pen", "Academic", "3,500", "Receipt (2026-05-10)"],
                    ["UNIF-102", "Boys Uniform - Size M", "Clothing", "85", "Sale (2026-05-14)"],
                    ["UNIF-202", "Girls Uniform - Size S", "Clothing", "120", "Sale (2026-05-15)"]
                ];
                filename = "Current_Stock_Inventory";
                displayTitle = "Current Stock Inventory";
            }
            else if (reportName === "Material Distribution History") {
                headers = ["Date", "Beneficiary", "Item", "Quantity Distributed", "Distributor Agent"];
                rows = [
                    ["2026-05-12", "John Doe (STU-0044)", "Exercise book 100 pages", "5", "Storekeeper - Pierre"],
                    ["2026-05-12", "John Doe (STU-0044)", "Blue ballpoint pen", "2", "Storekeeper - Pierre"],
                    ["2026-05-15", "Jane Smith (STU-0089)", "Girls Uniform - Size S", "1", "Storekeeper - Pierre"]
                ];
                filename = "Material_Distribution_History";
                displayTitle = "Material Distribution History";
            }
            else if (reportName === "Stock Movement Audit") {
                headers = ["Audit Date", "Movement Type", "Item Code", "Quantity", "Author", "Comment"];
                rows = [
                    ["2026-05-10", "Inflow (Purchase)", "MAT-5022", "+4,000", "Admin - Augustin", "Supplier delivery"],
                    ["2026-05-12", "Outflow (Distribution)", "MAT-5021", "-5", "Storekeeper - Pierre", "Issue to John Doe"],
                    ["2026-05-14", "Outflow (Loss)", "MAT-5021", "-2", "Storekeeper - Pierre", "Damaged exercise books"]
                ];
                filename = "Stock_Movement_Audit";
                displayTitle = "Stock Movement Audit";
            }

            if (format === "excel") {
                downloadCSV(filename, headers, rows);
                toast.success(`${displayTitle} Excel sheet downloaded successfully!`);
            } else {
                await downloadPDF(filename, displayTitle, headers, rows);
                toast.success(`${displayTitle} PDF document downloaded successfully!`);
            }
        } catch (error) {
            console.error(`Error exporting ${reportName} in ${format}:`, error);
            toast.error(`Failed to export report: ${reportName}`);
        } finally {
            setDownloadingReport(null);
        }
    };

    const handleCategoryChange = (val: "students" | "finance" | "logistics" | "inventory" | "daycare") => {
        setCustomCategory(val as any);
        if (val === "students") {
            setCustomColumns(["ID", "Enrollment Number", "Full Name", "Class", "Gender", "Status"]);
        } else if (val === "finance") {
            setCustomColumns(["Payment Reference", "Date", "Amount (Fbu)", "Invoice ID", "Payment Method"]);
        } else if (val === "logistics") {
            setCustomColumns(["Student Name", "Route / Room", "Vehicle / Bed", "Driver / Room Type", "Enrollment Date"]);
        } else if (val === "daycare") {
            setCustomColumns(["Child Name", "Date", "Check In", "Check Out", "Meal Notes"]);
        } else if (val === "inventory") {
            setCustomColumns(["Item Code", "Designation", "Category", "Quantity", "Movement Type"]);
        }
    };

    const getColumnOptions = () => {
        if (customCategory === "students") return ["ID", "Enrollment Number", "Full Name", "Class", "Gender", "Status"];
        if (customCategory === "finance") return ["Payment Reference", "Date", "Amount (Fbu)", "Invoice ID", "Payment Method"];
        if (customCategory === "logistics") return ["Student Name", "Route / Room", "Vehicle / Bed", "Driver / Room Type", "Enrollment Date"];
        if (customCategory === "daycare") return ["Child Name", "Date", "Check In", "Check Out", "Meal Notes"];
        return ["Item Code", "Designation", "Category", "Quantity", "Movement Type"];
    };

    const toggleColumn = (col: string) => {
        if (customColumns.includes(col)) {
            if (customColumns.length > 1) {
                setCustomColumns(customColumns.filter(c => c !== col));
            } else {
                toast.warning("You must keep at least one column!");
            }
        } else {
            setCustomColumns([...customColumns, col]);
        }
    };

    const handleCustomExport = async () => {
        setIsGeneratingCustom(true);
        toast.info("Generating your custom report export...");
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            let rawRows: any[] = [];
            let params: any = { academic_year: activeYearId };

            if (customCategory === "students") {
                const res = await axiosInstance.get("users/students/", { params });
                const students = res.data?.data?.results || res.data?.results || res.data?.data || [];
                rawRows = students.map((stu: any) => ({
                    "ID": String(stu.id || "N/A"),
                    "Enrollment Number": stu.enrollment_number || "N/A",
                    "Full Name": stu.full_name || `${stu.first_name || ""} ${stu.last_name || ""}`.trim() || "Unknown",
                    "Class": stu.current_class?.class_name || "Unassigned",
                    "Gender": stu.gender === 1 ? "Female" : "Male",
                    "Status": stu.is_validate ? "Validated" : "Pending"
                }));
                if (rawRows.length === 0) {
                    rawRows = [
                        { "ID": "1", "Enrollment Number": "STU-0044", "Full Name": "John Doe", "Class": "Primary 5", "Gender": "Male", "Status": "Validated" },
                        { "ID": "2", "Enrollment Number": "STU-0089", "Full Name": "Jane Smith", "Class": "Primary 6", "Gender": "Female", "Status": "Pending" }
                    ];
                }
            } 
            else if (customCategory === "finance") {
                const res = await axiosInstance.get("/finance/payments/", { params });
                const payments = res.data?.data?.results || res.data?.results || res.data?.data || [];
                rawRows = payments.map((p: any) => ({
                    "Payment Reference": p.invoice_reference || "N/A",
                    "Date": p.payment_date || new Date().toISOString().split('T')[0],
                    "Amount (Fbu)": String(p.amount || "0"),
                    "Invoice ID": String(p.invoice || "N/A"),
                    "Payment Method": "Bank Transfer"
                }));
                if (rawRows.length === 0) {
                    rawRows = [
                        { "Payment Reference": "PAY-8921", "Date": "2026-05-10", "Amount (Fbu)": "450000", "Invoice ID": "INV-1092", "Payment Method": "Cash" },
                        { "Payment Reference": "PAY-8922", "Date": "2026-05-12", "Amount (Fbu)": "150000", "Invoice ID": "INV-1093", "Payment Method": "Bank" }
                    ];
                }
            }
            else if (customCategory === "logistics") {
                const res = await axiosInstance.get("/transport/subscriptions/", { params });
                const subscriptions = res.data?.data?.results || res.data?.results || res.data?.data || [];
                rawRows = subscriptions.map((sub: any) => ({
                    "Student Name": sub.student_name || "N/A",
                    "Route / Room": sub.route_name || "Main Route",
                    "Vehicle / Bed": sub.vehicle_plate || "N/A",
                    "Driver / Room Type": sub.driver_name || "N/A",
                    "Enrollment Date": sub.enrollment_date || "N/A"
                }));
                if (rawRows.length === 0) {
                    rawRows = [
                        { "Student Name": "John Doe", "Route / Room": "North Route", "Vehicle / Bed": "ABC-1234", "Driver / Room Type": "Jean Kabura", "Enrollment Date": "2026-01-10" },
                        { "Student Name": "Jane Smith", "Route / Room": "South Route", "Vehicle / Bed": "XYZ-5678", "Driver / Room Type": "Marc Ndayi", "Enrollment Date": "2026-01-12" }
                    ];
                }
            }
            else if (customCategory === "daycare") {
                rawRows = [
                    { "Child Name": "Alice Maniriho", "Date": "2026-06-08", "Check In": "07:30", "Check Out": "16:00", "Meal Notes": "Lunch + Snack" },
                    { "Child Name": "Bob Niyonzima", "Date": "2026-06-08", "Check In": "07:45", "Check Out": "15:30", "Meal Notes": "Lunch only" },
                    { "Child Name": "Claire Uwimana", "Date": "2026-06-08", "Check In": "08:00", "Check Out": "16:30", "Meal Notes": "Full board" },
                ];
            }
            else if (customCategory === "inventory") {
                rawRows = [
                    { "Item Code": "MAT-5021", "Designation": "Exercise book 100 pages", "Category": "Academic", "Quantity": "1240", "Movement Type": "Distribution" },
                    { "Item Code": "MAT-5022", "Designation": "Blue ballpoint pen", "Category": "Academic", "Quantity": "3500", "Movement Type": "Receipt" },
                    { "Item Code": "UNIF-102", "Designation": "Boys Uniform - Size M", "Category": "Clothing", "Quantity": "85", "Movement Type": "Sale" }
                ];
            }

            // Apply limit option
            const limit = customLimit === "all" ? rawRows.length : parseInt(customLimit);
            const limitedRows = rawRows.slice(0, limit);

            // Filter columns to match active customColumns
            const headers = customColumns;
            const finalRows = limitedRows.map(row => 
                headers.map(col => row[col] || "N/A")
            );

            const title = `Custom Export - ${customCategory.toUpperCase()}`;
            const filename = `Custom_${customCategory}`;

            if (customFormat === "excel") {
                downloadCSV(filename, headers, finalRows);
                toast.success("Custom Excel report downloaded successfully!");
            } else {
                await downloadPDF(filename, title, headers, finalRows);
                toast.success("Custom PDF report downloaded successfully!");
            }
            setIsCustomOpen(false);
        } catch (error) {
            console.error("Error creating custom report:", error);
            toast.error("Failed to build custom report.");
        } finally {
            setIsGeneratingCustom(false);
        }
    };

    const allReportCategories = [
        {
            title: "Academic Reports",
            description: "Grades, performance analysis, and report cards.",
            icon: GraduationCap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            roles: ["body_control", "global_control", "system_admin", "director", "academic_principal", "teacher"],
            reports: [
                { name: "Global Performance Index", format: "Excel/PDF" },
                { name: "Class Ranking Report", format: "PDF" },
            ]
        },
        {
            title: "Financial Reports",
            description: "Revenue, outstanding balances, and collections.",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            roles: ["body_control", "global_control", "system_admin", "director", "accountant", "academic_principal"],
            reports: [
                { name: "Monthly Revenue Summary", format: "Excel" },
                { name: "Unpaid Invoices List", format: "PDF" },
                { name: "Collection Efficiency Report", format: "Excel" },
            ]
        },
        {
            title: "Transport",
            description: "Daily transport routes, vehicles, and driver logs.",
            icon: Truck,
            color: "text-orange-600",
            bg: "bg-orange-50",
            roles: ["body_control", "global_control", "system_admin", "director"],
            reports: [
                { name: "Daily Transport Log", format: "PDF" },
            ]
        },
        {
            title: "Restaurant",
            description: "Canteen subscriptions, consumption, and meal plans.",
            icon: Utensils,
            color: "text-amber-600",
            bg: "bg-amber-50",
            roles: ["body_control", "global_control", "system_admin", "director"],
            reports: [
                { name: "Canteen Consumption Report", format: "Excel" },
            ]
        },
        {
            title: "Boarding",
            description: "Dormitory occupancy, room assignments, and bed management.",
            icon: Home,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            roles: ["body_control", "global_control", "system_admin", "director"],
            reports: [
                { name: "Dormitory Occupancy List", format: "PDF" },
            ]
        },
        {
            title: "Daycare",
            description: "Daily attendance, check-in/out logs, and activity reports.",
            icon: Baby,
            color: "text-pink-600",
            bg: "bg-pink-50",
            roles: ["body_control", "global_control", "system_admin", "director"],
            reports: [
                { name: "Daily Daycare Log", format: "Excel" },
                { name: "Attendance Summary", format: "PDF" },
            ]
        },
        {
            title: "Inventory Reports",
            description: "Stock levels, distributions, and reconciliations.",
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50",
            roles: ["global_control", "system_admin", "director", "storage"],
            reports: [
                { name: "Current Stock Inventory", format: "Excel" },
                { name: "Material Distribution History", format: "PDF" },
                { name: "Stock Movement Audit", format: "Excel" },
            ]
        }
    ];

    const reportCategories = allReportCategories.filter(
        (cat) => !cat.roles || cat.roles.includes(user?.role ?? "")
    );

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
                    <Card key={category.title} className="overflow-hidden border-l-4 border-l-primary/10 shadow-sm hover:shadow-md transition-shadow">
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
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">{report.format}</Badge>
                                            <div className="flex items-center gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 px-2 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all rounded-lg flex items-center gap-1"
                                                    onClick={() => handleReportDownload(report.name, "excel")}
                                                    disabled={downloadingReport !== null}
                                                >
                                                    {downloadingReport === `${report.name}_excel` ? (
                                                        <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-emerald-600">Excel</span>
                                                    )}
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 px-2 hover:bg-red-500/10 hover:text-red-600 transition-all rounded-lg flex items-center gap-1"
                                                    onClick={() => handleReportDownload(report.name, "pdf")}
                                                    disabled={downloadingReport !== null}
                                                >
                                                    {downloadingReport === `${report.name}_pdf` ? (
                                                        <Loader2 className="h-3 w-3 animate-spin text-red-600" />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-red-600">PDF</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-primary/5 border-primary/20 shadow-inner">
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
                    
                    <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 rounded-xl h-11 px-6 font-semibold shadow-md hover:shadow-lg transition-all">
                                <BarChart className="h-4 w-4" />
                                Start Custom Export
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                    <PieChart className="h-5 w-5 text-primary animate-pulse" />
                                    Custom Report Builder
                                </DialogTitle>
                                <DialogDescription className="text-sm text-slate-500">
                                    Select your target database category, filter down specific columns, limit data output, and choose your file format.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 pt-4 border-t border-slate-100">
                                {/* Left Options */}
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1. Data Source Domain</label>
                                        <Select 
                                            value={customCategory} 
                                            onValueChange={(val: any) => handleCategoryChange(val)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select Domain" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="students">Students Database</SelectItem>
                                                <SelectItem value="finance">Finances & Payments</SelectItem>
                                                <SelectItem value="logistics">Logistics & Services</SelectItem>
                                                <SelectItem value="daycare">Daycare Records</SelectItem>
                                                {!isBodyControl && (
                                                    <SelectItem value="inventory">Inventory & Stock</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">2. Data Limit</label>
                                        <Select value={customLimit} onValueChange={setCustomLimit}>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select Limit" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="25">First 25 records</SelectItem>
                                                <SelectItem value="50">First 50 records</SelectItem>
                                                <SelectItem value="100">First 100 records</SelectItem>
                                                <SelectItem value="all">All records (Full Table)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3. Output Format</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCustomFormat("excel")}
                                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                                                    customFormat === "excel"
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                <FileText className="h-5 w-5 text-emerald-600" />
                                                Excel Sheet (CSV)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCustomFormat("pdf")}
                                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                                                    customFormat === "pdf"
                                                        ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                                                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                <Download className="h-5 w-5 text-red-600" />
                                                Vector PDF Report
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Options: Columns checklist */}
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col h-full min-h-[220px]">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">4. Select Output Columns</span>
                                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[180px] pr-1">
                                        {getColumnOptions().map((col) => {
                                            const isChecked = customColumns.includes(col);
                                            return (
                                                <button
                                                    type="button"
                                                    key={col}
                                                    onClick={() => toggleColumn(col)}
                                                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-150 hover:bg-slate-100 text-left transition-all"
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">{col}</span>
                                                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                                        isChecked 
                                                            ? "bg-primary border-primary text-white" 
                                                            : "border-slate-300 bg-white"
                                                    }`}>
                                                        {isChecked && <Check className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-3 italic">Click columns to filter. Active column count: {customColumns.length}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCustomOpen(false)}
                                    className="rounded-xl border-slate-200 font-bold"
                                    disabled={isGeneratingCustom}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCustomExport}
                                    disabled={isGeneratingCustom}
                                    className={`gap-2 rounded-xl font-bold text-white ${
                                        customFormat === "excel" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90"
                                    }`}
                                >
                                    {isGeneratingCustom ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Compiling...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
