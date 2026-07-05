"use client";

import EmployeesTable from "@/components/employees/employees-table";
import AddEmployeeDialog from "@/components/employees/add-employee-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

const PAGE_SIZE = 10;

const ADMIN_ROLES = ["system_admin", "director", "global_control"];

export default function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [showDeleted, setShowDeleted] = useState(false);

  const handleRoleFilterChange = (role?: string) => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data: employeesResponse, isLoading, error } = useEmployees({
    page_size: 1000,
    search: search || undefined,
    role: roleFilter,
    include_deleted: showDeleted || undefined,
  });

  const allEmployees = employeesResponse?.results || [];

  const EXCLUDED_ROLES = ["system_admin", "student", "student_parent"];

  const filtered = useMemo(() => {
    let result = [...allEmployees]
      .filter((e) => !EXCLUDED_ROLES.includes(e.role))
      .sort((a, b) => b.id - a.id);

    if (roleFilter) {
      result = result.filter((e) => e.role === roleFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.user.last_name?.toLowerCase().includes(q) ||
          e.user.first_name?.toLowerCase().includes(q) ||
          e.user.username?.toLowerCase().includes(q) ||
          e.phone_number?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allEmployees, roleFilter, search]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedEmployees = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleEmployeeCreated = () => {
    setPage(1);
  };

  return (
    <div className="mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Accounts</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-deleted"
                  checked={showDeleted}
                  onCheckedChange={(checked) => {
                    setShowDeleted(checked);
                    setPage(1);
                  }}
                />
                <Label htmlFor="show-deleted" className="text-sm cursor-pointer">
                  Show deleted
                </Label>
              </div>
            )}
            <AddEmployeeDialog onEmployeeCreated={handleEmployeeCreated} />
          </div>
        </CardHeader>


        <CardContent>
          <EmployeesTable
            employees={paginatedEmployees}
            isLoading={isLoading}
            error={!!error}
            totalCount={totalCount}
            currentPage={safePage}
            onPageChange={setPage}
            search={search}
            onSearchChange={handleSearchChange}
            roleFilter={roleFilter}
            onRoleFilterChange={handleRoleFilterChange}
            showDeleted={showDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
}
