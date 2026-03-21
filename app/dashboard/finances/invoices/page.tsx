"use client";

import { useInvoices } from "@/hooks/use-finance";
import { useStudents } from "@/hooks/use-students";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import { InvoicesTable } from "@/components/finances/invoices-table";
import { Button } from "@/components/ui/button";
import { Download, Receipt, Check, ChevronsUpDown, X, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
    const [page, setPage] = useState(1);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [studentSearchUrl, setStudentSearchUrl] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
    const [selectedClassRoom, setSelectedClassRoom] = useState<string>("");
    const [selectedEntity, setSelectedEntity] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);

    // Fetch filter options
    const { data: studentsData } = useStudents({ search: studentSearchUrl, page_size: 20 });
    const students = studentsData?.results || [];
    const { data: academicYears = [] } = useAcademicYears();
    const { data: classRooms = [] } = useClassRooms();

    // Fetch invoices with applied filters
    const { data, isLoading } = useInvoices({
        page,
        student: selectedStudent || undefined,
        academic_year: selectedAcademicYear && selectedAcademicYear !== "all" ? selectedAcademicYear : undefined,
        classroom: selectedClassRoom && selectedClassRoom !== "all" ? selectedClassRoom : undefined,
        entity: selectedEntity && selectedEntity !== "all" ? selectedEntity : undefined,
        status: selectedStatus && selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchQuery || undefined,
    });

    const invoices = data?.results || [];
    const totalCount = data?.count || 0;

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStudent("");
        setSelectedAcademicYear("all");
        setSelectedClassRoom("all");
        setSelectedEntity("all");
        setSelectedStatus("all");
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const tableBody = invoices.map((inv: any) => `
            <tr>
                <td><strong>${inv.reference}</strong><br/><small style="color: #64748b;">${inv.fees_detail.code}</small></td>
                <td><strong>${inv.student_name || 'Institutional'}</strong><br/><small style="color: #64748b;">${inv.fees_detail.label}</small></td>
                <td>${inv.fees_detail.fee_category_name}</td>
                <td style="text-align: right;"><strong>${Number(inv.amount).toLocaleString('en-US')} FBU</strong><br/><small style="color: #64748b;">${inv.fees_detail.period_name}</small></td>
                <td>${inv.date}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${inv.status === 1 ? '#dcfce7' : '#fee2e2'}; color: ${inv.status === 1 ? '#166534' : '#991b1b'}; border: 1px solid ${inv.status === 1 ? '#bbf7d0' : '#fecaca'};">
                        ${inv.status_name}
                    </span>
                </td>
            </tr>
        `).join('');

        const totalAmount = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
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
                         <div class="logo">EduCore</div>
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
                             <th style="text-align: right;">Amount / Period</th>
                             <th>Date</th>
                             <th>Status</th>
                         </tr>
                     </thead>
                     <tbody>
                         ${tableBody}
                         ${invoices.length > 0 ? (
                '<tr class="total-row">' +
                '<td colspan="3" style="text-align: right; padding-top: 20px;">Total Amount:</td>' +
                '<td style="text-align: right; font-size: 18px; color: #2563eb; padding-top: 20px;">' + totalAmount.toLocaleString("en-US") + ' FBU</td>' +
                '<td colspan="2"></td>' +
                '</tr>'
            ) : '<tr><td colspan="6" style="text-align: center;">No invoices found</td></tr>'}
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
                    <Button variant="outline" className="shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
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
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                        <div className="space-y-2">
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
                                <PopoverContent className="w-full md:w-[250px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search student..."
                                            onValueChange={setStudentSearchUrl} // Optional: fetch from API
                                        />
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

                        <div className="space-y-2">
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

                        <div className="space-y-2">
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

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</label>
                            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Fees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Fees</SelectItem>
                                    <SelectItem value="1">Registration Fees</SelectItem>
                                    <SelectItem value="2">School Fees</SelectItem>
                                    <SelectItem value="3">Class Fees</SelectItem>
                                    <SelectItem value="4">Transport Fees</SelectItem>
                                    <SelectItem value="5">Food Fees</SelectItem>
                                    <SelectItem value="6">Catering Fees</SelectItem>
                                    <SelectItem value="7">Other Fees</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="0">Unpaid</SelectItem>
                                    <SelectItem value="1">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handlePrintList}
                                disabled={invoices.length === 0}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print List
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={resetFilters}
                                disabled={!selectedStudent && (!selectedAcademicYear || selectedAcademicYear === "all") && (!selectedClassRoom || selectedClassRoom === "all") && (!selectedEntity || selectedEntity === "all") && (!selectedStatus || selectedStatus === "all")}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <InvoicesTable invoices={invoices} isLoading={isLoading} />
            </div>
        </div>
    );
}
