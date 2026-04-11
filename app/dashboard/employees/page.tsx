"use client";

import EmployeesTable from "@/components/employees/employees-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useState } from "react";

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const { data: employeesResponse, isLoading, error } = useEmployees({
    page,
    search: search || undefined,
    role: roleFilter,
  });

  const employees = employeesResponse?.results || [];
  const totalCount = employeesResponse?.count || 0;

  return (
    <div className="mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Employee List</CardTitle>
          </div>
          {/* Add CreateEmployeeDialog here in the future */}
        </CardHeader>

        <CardContent>
          <EmployeesTable
            employees={employees}
            isLoading={isLoading}
            error={!!error}
            totalCount={totalCount}
            currentPage={page}
            onPageChange={setPage}
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
