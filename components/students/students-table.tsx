// src/components/students/students-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash2,
  School,
  Search,
  User,
  Filter,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { Student } from "@/types/student";
import { EnrollStudentDialog } from "./enroll-student-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const genderLabel = (g: number) => (g === 1 ? "Girl" : "Boy");

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  error: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  academicYear?: number;
  onAcademicYearChange: (id?: number) => void;
  classroom?: number;
  onClassroomChange: (id?: number) => void;
  years: any[];
  classes: any[];
}

export default function StudentsTable({
  students,
  isLoading,
  error,
  totalCount,
  currentPage,
  onPageChange,
  search,
  onSearchChange,
  academicYear,
  onAcademicYearChange,
  classroom,
  onClassroomChange,
  years,
  classes,
}: StudentsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.original.full_name || "?";
        const image = (row.original as any).image as string | null | undefined;
        const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div className="font-medium flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 border border-primary/20">
                {initials}
              </div>
            )}
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "enrollment_number",
      header: "Enrollment No.",
      cell: ({ row }) => (
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {row.getValue("enrollment_number")}
        </code>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <Badge variant={row.original.gender === 1 ? "secondary" : "default"}>
          {genderLabel(row.original.gender)}
        </Badge>
      ),
    },
    {
      accessorKey: "account_active",
      header: "Account",
      cell: ({ row }) => (
        <Badge variant={row.original.account_active ? "default" : "destructive"}>
          {row.original.account_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "enrollment_status",
      header: "Current Enrollment",
      cell: ({ row }) => {
        const info = row.original.enrollment_info;
        if (!info) {
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleSlash2 className="w-4 h-4" />
              <span className="text-sm">Not Enrolled</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-sm">{info.classroom}</p>
              <p className="text-xs text-muted-foreground">{info.academic_year}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const [openEnroll, setOpenEnroll] = useState(false);
        const student = row.original;
        const alreadyEnrolled = !!student.enrollment_info;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/students/${student.id}`)}
              className="h-8 gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>

            {student.is_validated && (
              <Button
                variant="outline"
                size="sm"
                disabled={alreadyEnrolled}
                onClick={() => setOpenEnroll(true)}
                className="h-8"
              >
                {alreadyEnrolled ? "Already Enrolled" : "Enroll"}
              </Button>
            )}

            <EnrollStudentDialog
              studentId={student.id}
              studentName={student.full_name}
              open={openEnroll && !alreadyEnrolled}
              onOpenChange={setOpenEnroll}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Global Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Academic Year Filter */}
        <Select
          value={academicYear ? String(academicYear) : "all"}
          onValueChange={(val) => onAcademicYearChange(val === "all" ? undefined : Number(val))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y.id} value={String(y.id)}>
                {y.start_year} - {y.end_year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Classroom Filter */}
        <Select
          value={classroom ? String(classroom) : "all"}
          onValueChange={(val) => onClassroomChange(val === "all" ? undefined : Number(val))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">
                  Could not load students.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {students.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
          {Math.min(currentPage * 10, totalCount)} of {totalCount} students
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage * 10 >= totalCount || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}