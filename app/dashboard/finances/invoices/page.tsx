"use client";

import { useInvoices } from "@/hooks/use-finance";
import { useStudents } from "@/hooks/use-students";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import { InvoicesTable } from "@/components/finances/invoices-table";
import { Button } from "@/components/ui/button";
import { Download, Receipt, Check, ChevronsUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming it might not exist, but let's see. If not, I will just use standard input value directly for now. Actually, let's just use local search without debounce, or standard state.

export default function InvoicesPage() {
    const [page, setPage] = useState(1);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [studentSearchUrl, setStudentSearchUrl] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
    const [selectedClassRoom, setSelectedClassRoom] = useState<string>("");
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
        search: searchQuery || undefined,
    });

    const invoices = data?.results || [];
    const totalCount = data?.count || 0;

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStudent("");
        setSelectedAcademicYear("all");
        setSelectedClassRoom("all");
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
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="w-full flex-1"
                                onClick={resetFilters}
                                disabled={!selectedStudent && !selectedAcademicYear && !selectedClassRoom}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <InvoicesTable invoices={invoices} isLoading={isLoading} />
            </div>
        </div>
    );
}
