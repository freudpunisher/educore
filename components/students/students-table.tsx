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
} from "lucide-react";
import { useState } from "react";
import { Student } from "@/types/student";
import { EnrollStudentDialog } from "./enroll-student-dialog";

const genderLabel = (g: number) => (g === 1 ? "Fille" : "Garçon");

export default function StudentsTable({ students }: { students: Student[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Extract unique values for filters
  const academicYears = Array.from(
    new Set(
      students
        .filter((s) => s.enrollment_info?.academic_year)
        .map((s) => s.enrollment_info!.academic_year)
    )
  ).sort();

  const classrooms = Array.from(
    new Set(
      students
        .filter((s) => s.enrollment_info?.classroom)
        .map((s) => s.enrollment_info!.classroom)
    )
  ).sort();

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom complet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          {row.original.full_name}
        </div>
      ),
    },
    {
      accessorKey: "enrollment_number",
      header: "Matricule",
      cell: ({ row }) => (
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {row.getValue("enrollment_number")}
        </code>
      ),
    },
    {
      accessorKey: "gender",
      header: "Genre",
      cell: ({ row }) => (
        <Badge variant={row.original.gender === 1 ? "secondary" : "default"}>
          {genderLabel(row.original.gender)}
        </Badge>
      ),
    },
    {
      accessorKey: "account_active",
      header: "Compte",
      cell: ({ row }) => (
        <Badge variant={row.original.account_active ? "default" : "destructive"}>
          {row.original.account_active ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      id: "enrollment_status",
      header: "Inscription actuelle",
      cell: ({ row }) => {
        const info = row.original.enrollment_info;
        if (!info) {
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CircleSlash2 className="w-4 h-4" />
              <span className="text-sm">Non inscrit</span>
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
        const [open, setOpen] = useState(false);
        const student = row.original;
        const alreadyEnrolled = !!student.enrollment_info;

        return (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={alreadyEnrolled}
              onClick={() => setOpen(true)}
              className="h-8"
            >
              {alreadyEnrolled ? "Déjà inscrit" : "Inscrire"}
            </Button>

            <EnrollStudentDialog
              studentId={student.id}
              studentName={student.full_name}
              open={open && !alreadyEnrolled}
              onOpenChange={setOpen}
            />
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Global Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un élève..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Academic Year Filter */}
        <Select
          value={(table.getColumn("enrollment_status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) =>
            table.getColumn("enrollment_status")?.setFilterValue(value || undefined)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les années" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les années</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Classroom Filter */}
        <Select
          value={(table.getColumn("enrollment_status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) =>
            table.getColumn("enrollment_status")?.setFilterValue(value || undefined)
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classrooms.map((room) => (
              <SelectItem key={room} value={room}>
                {room}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
            {table.getRowModel().rows?.length ? (
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
                  Aucun élève trouvé avec ces filtres.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {table.getFilteredRowModel().rows.length} élève{table.getFilteredRowModel().rows.length > 1 ? "s" : ""} affiché{table.getFilteredRowModel().rows.length < students.length ? ` sur ${students.length}` : ""}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}