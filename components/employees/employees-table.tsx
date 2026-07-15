"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
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
  Search,
  User,
  Phone,
  MapPin,
  Mail,
  Pencil,
  Trash2,
  Hash,
  RotateCcw,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Employee } from "@/types/employee";
import { Loader2 } from "lucide-react";
import { useDeleteEmployee, useRestoreEmployee, useToggleEmployeeActive } from "@/hooks/use-employees";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EmployeesTableProps {
  employees: Employee[];
  isLoading: boolean;
  error: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  roleFilter?: string;
  onRoleFilterChange: (role?: string) => void;
  showDeleted?: boolean;
}

const roleLabels: Record<string, string> = {
  system_admin: "System Admin",
  student: "Student",
  student_parent: "Student Parent",
  global_control: "Global Control",
  body_control: "Body Control (Audit)",
  director: "Director",
  academic_principal: "Academic Manager",
  discipline_principal: "Discipline Manager",
  receptionist: "Receptionist",
  accountant: "Accountant",
  hr: "HR Manager",
  transporter: "Transporter Supervisor (Driver)",
  driver: "Driver",
  teacher: "Teacher",
  boarding: "Boarding Supervisor",
  daycare: "Daycare Supervisor",
  restaurant: "Restaurant Supervisor",
  storage: "Inventory & Logistics Officer",
};

function ActionsCell({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useDeleteEmployee();
  const restoreMutation = useRestoreEmployee();
  const toggleActiveMutation = useToggleEmployeeActive();

  const handleDelete = () => {
    deleteMutation.mutate(employee.id);
    setOpen(false);
  };

  const handleRestore = () => {
    restoreMutation.mutate(employee.id);
  };

  const handleToggleActive = () => {
    toggleActiveMutation.mutate(employee.id);
  };

  if (employee.is_deleted) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={restoreMutation.isPending}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restore
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2 items-center">
      <div className="flex items-center gap-2 mr-2">
        <Switch
          checked={employee.active}
          onCheckedChange={handleToggleActive}
          disabled={toggleActiveMutation.isPending}
        />
        <span className="text-xs text-muted-foreground w-14">
          {employee.active ? "Active" : "Inactive"}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user and mark the account as deleted.
              The data will be preserved and can be restored by an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EmployeesTable({
  employees,
  isLoading,
  error,
  totalCount,
  currentPage,
  onPageChange,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  showDeleted,
}: EmployeesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm font-mono">
          <Hash className="w-3 h-3 text-muted-foreground" />
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "user.last_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            {user.last_name} {user.first_name}
            <span className="text-xs text-muted-foreground">(@{user.username})</span>
          </div>
        );
      },
    },
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-muted-foreground" />
            {user.email || "---"}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {roleLabels[row.original.role] || row.original.role.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-3 h-3 text-muted-foreground" />
          {row.original.phone_number || "---"}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm truncate max-w-[200px]">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          {row.original.address}
        </div>
      ),
    },
    {
      accessorKey: "is_deleted",
      header: "Status",
      cell: ({ row }) => {
        if (row.original.is_deleted) {
          return <Badge variant="destructive">Deleted</Badge>;
        }
        return (
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => <ActionsCell employee={row.original} />,
    },
  ];

  const table = useReactTable({
    data: employees,
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search account..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={roleFilter || "all"}
          onValueChange={(val) => onRoleFilterChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                  Could not load employees.
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
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {employees.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
          {Math.min(currentPage * 10, totalCount)} of {totalCount} accounts
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
