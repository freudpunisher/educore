"use client";

import { useInvoices } from "@/hooks/use-finance";
import { useStudents } from "@/hooks/use-students";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import { InvoicesTable } from "@/components/finances/invoices-table";
import { Button } from "@/components/ui/button";
import { Download, Receipt, Check, ChevronsUpDown, X, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FEE_CATEGORIES, INVOICE_STATUS_OPTIONS } from "@/constants/finance";

export default function InvoicesPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [studentSearchInput, setStudentSearchInput] = useState("");
    const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
    const [selectedClassRoom, setSelectedClassRoom] = useState<string>("");
    const [selectedEntity, setSelectedEntity] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedStaff, setSelectedStaff] = useState<string>("");
    const [staffSearchInput, setStaffSearchInput] = useState("");
    const [debouncedStaffSearch, setDebouncedStaffSearch] = useState("");
    const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);

    // Debounce student search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedStudentSearch(studentSearchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [studentSearchInput]);

    // Debounce staff search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedStaffSearch(staffSearchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [staffSearchInput]);

    // Fetch filter options
    const { data: studentsData } = useStudents({ search: debouncedStudentSearch || undefined, page_size: 20 });
    const students = studentsData?.results || [];
    const { data: academicYears = [] } = useAcademicYears();
    const { data: classRooms = [] } = useClassRooms();

    // Fetch invoices with applied filters
    const { data, isLoading } = useInvoices({
        page,
        page_size: pageSize,
        student: selectedStudent || undefined,
        academic_year: selectedAcademicYear && selectedAcademicYear !== "all" ? selectedAcademicYear : undefined,
        classroom: selectedClassRoom && selectedClassRoom !== "all" ? selectedClassRoom : undefined,
        entity: selectedEntity && selectedEntity !== "all" ? selectedEntity : undefined,
        status: selectedStatus && selectedStatus !== "all" ? selectedStatus : undefined,
        staff: selectedStaff === "true" ? "true" : selectedStaff === "false" ? "false" : undefined,
        staff_search: debouncedStaffSearch || undefined,
        search: searchQuery || undefined,
    });

    const invoices = [...(data?.results || [])].sort((a, b) => b.id - a.id);
    const totalCount = data?.count || 0;

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStudent("");
        setStudentSearchInput("");
        setDebouncedStudentSearch("");
        setSelectedAcademicYear("all");
        setSelectedClassRoom("all");
        setSelectedEntity("all");
        setSelectedStatus("all");
        setSelectedStaff("all");
        setStaffSearchInput("");
        setDebouncedStaffSearch("");
    };

    const handleExportCSV = () => {
        const headers = ["Reference", "Code", "Student", "Description", "Category", "Period", "Total", "Paid", "Balance", "Date", "Status"];
        const rows = invoices.map((inv: any) => [
            inv.reference || "",
            inv.fees_detail?.code || "",
            inv.student_name || "Institutional",
            inv.fees_detail?.label || "",
            inv.fees_detail?.fee_category_name || "",
            inv.period_name || "",
            inv.amount || 0,
            inv.amount_paid || 0,
            inv.balance || 0,
            inv.date || "",
            inv.status_name || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const tableBody = invoices.map((inv: any) => `
            <tr>
                <td><strong>${inv.reference || "N/A"}</strong><br/><small style="color: #64748b;">${inv.fees_detail?.code || "N/A"}</small></td>
                <td><strong>${inv.student_name || 'Institutional'}</strong><br/><small style="color: #64748b;">${inv.fees_detail?.label || "General Fee"}</small></td>
                <td>${inv.fees_detail?.fee_category_name || "Uncategorized"}</td>
                <td>${inv.period_name || 'N/A'}</td>
                <td style="text-align: right;"><strong>${Number(inv.amount || 0).toLocaleString('en-US')}</strong></td>
                <td style="text-align: right; color: #166534;"><strong>${Number(inv.amount_paid || 0).toLocaleString('en-US')}</strong></td>
                <td style="text-align: right; color: #991b1b;"><strong>${Number(inv.balance || 0).toLocaleString('en-US')}</strong></td>
                <td>${inv.date || "N/A"}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${inv.status === 1 ? '#dcfce7' : '#fee2e2'}; color: ${inv.status === 1 ? '#166534' : '#991b1b'}; border: 1px solid ${inv.status === 1 ? '#bbf7d0' : '#fecaca'};">
                        ${inv.status_name}
                    </span>
                </td>
            </tr>
        `).join('');

        const totalBalance = invoices.reduce((sum: number, inv: any) => sum + Number(inv.balance || 0), 0);
        const printedDate = new Date().toLocaleString();

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoices Report</title>
              <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #333; }
                .container { max-width: 1000px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                .report-details { text-align: right; }
                .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                th { background: #f8fafc; font-weight: 600; color: #475569; }
                .total-row { font-weight: bold; font-size: 16px; }
                .total-row td { border-top: 2px solid #333; }
                @media print {
                    body { padding: 0; }
                    .container { max-width: 100%; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                 <div class="header">
                     <div>
                         <img src="/logo.png" style="height: 60px; margin-bottom: 10px;" alt="Institutional Logo" />
                         <div class="subtitle">123 Education Boulevard<br/>Bujumbura, Burundi</div>
                     </div>
                     <div class="report-details">
                         <h1 style="margin: 0; color: #1e293b; font-size: 24px;">INVOICES REPORT</h1>
                         <div class="subtitle">Generated: ${printedDate}</div>
                         <div class="subtitle">Total Records: ${invoices.length}</div>
                     </div>
                 </div>

                 <table>
                     <thead>
                          <tr>
                              <th>Reference / Code</th>
                              <th>Student / Description</th>
                              <th>Category</th>
                              <th>Period</th>
                              <th style="text-align: right;">Total</th>
                              <th style="text-align: right;">Paid</th>
                              <th style="text-align: right;">Balance</th>
                              <th>Date</th>
                              <th>Status</th>
                          </tr>
                     </thead>
                     <tbody>
                         ${tableBody}
                         ${invoices.length > 0 ? (
                '<tr class="total-row">' +
                '<td colspan="7" style="text-align: right; padding-top: 20px;">Total Outstanding Balance:</td>' +
                '<td style="text-align: right; font-size: 18px; color: #2563eb; padding-top: 20px;">' + totalBalance.toLocaleString("en-US") + ' FBU</td>' +
                '<td colspan="2"></td>' +
                '</tr>'
            ) : '<tr><td colspan="10" style="text-align: center;">No invoices found</td></tr>'}
                     </tbody>
                 </table>
              </div>
              <script>
                window.onload = function() { 
                    setTimeout(function() {
                        window.print(); 
                        window.close(); 
                    }, 250);
                }
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Institutional Invoices</h1>
                    <p className="text-muted-foreground mt-1">
                        Viewing and managing all official billing records and institutional fees.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="shadow-sm" onClick={handleExportCSV} disabled={invoices.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Total Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6 pt-4">
                <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6 flex flex-wrap gap-4 items-end overflow-auto">
                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</label>
                            <Popover open={studentComboboxOpen} onOpenChange={setStudentComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={studentComboboxOpen}
                                        className="w-full justify-between"
                                    >
                                        {selectedStudent
                                            ? students.find((student) => student.id.toString() === selectedStudent)?.full_name || "Selected Student"
                                            : "All Students"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full min-w-[250px] p-0">
                                    <Command>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="Search student..."
                                                className="pl-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                value={studentSearchInput}
                                                onChange={(e) => setStudentSearchInput(e.target.value)}
                                            />
                                        </div>
                                        <CommandList>
                                            <CommandEmpty>No student found.</CommandEmpty>
                                            <CommandGroup>
                                                {students.map((student) => (
                                                    <CommandItem
                                                        key={student.id}
                                                        value={student.id.toString()}
                                                        onSelect={(currentValue) => {
                                                            setSelectedStudent(currentValue === selectedStudent ? "" : currentValue);
                                                            setStudentComboboxOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedStudent === student.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {student.full_name} ({student.enrollment_number})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic Year</label>
                            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year.id} value={year.id.toString()}>
                                            {year.start_year}-{year.end_year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classroom</label>
                            <Select value={selectedClassRoom} onValueChange={setSelectedClassRoom}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Classrooms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classrooms</SelectItem>
                                    {classRooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</label>
                            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Fees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Fees</SelectItem>
                                    {FEE_CATEGORIES.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {INVOICE_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff/Student</label>
                            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="false">Students</SelectItem>
                                    <SelectItem value="true">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff Name</label>
                            <Input
                                placeholder="Search staff..."
                                value={staffSearchInput}
                                onChange={(e) => setStaffSearchInput(e.target.value)}
                                disabled={selectedStaff === "false"}
                            />
                        </div>

                        <div className="space-y-2 min-w-[160px] flex-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider invisible">Actions</label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handlePrintList}
                                    disabled={invoices.length === 0}
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={resetFilters}
                                    disabled={!selectedStudent && !staffSearchInput && (!selectedAcademicYear || selectedAcademicYear === "all") && (!selectedClassRoom || selectedClassRoom === "all") && (!selectedEntity || selectedEntity === "all") && (!selectedStatus || selectedStatus === "all") && (!selectedStaff || selectedStaff === "all")}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <InvoicesTable
                    invoices={invoices}
                    isLoading={isLoading}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
            </div>
        </div>
    );
}
