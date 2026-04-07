"use client";

import { useState, useMemo } from "react";
import { TransportLayout } from "@/components/transport/transport-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import { mockDrivers } from "@/lib/mock/transport";

interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  assignedVehicle: string;
  status: "active" | "inactive";
  phone: string;
}

export default function DriverPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return mockDrivers
      .filter((driver) => {
        if (statusFilter !== "all" && driver.status !== statusFilter) return false;
        if (
          searchTerm &&
          !driver.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((driver) => ({
        id: driver.id,
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        assignedVehicle: driver.assignedVehicle,
        status: driver.status as "active" | "inactive",
        phone: driver.phone,
      }));
  }, [statusFilter, searchTerm]);

  const columns = [
    {
      key: "name" as const,
      label: "Name",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "licenseNumber" as const,
      label: "License Number",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "assignedVehicle" as const,
      label: "Assigned Vehicle",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "active" | "inactive") => <StatusBadge status={value} />,
    },
    {
      key: "phone" as const,
      label: "Contact",
      sortable: false,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
  ];

  return (
    <TransportLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Drivers
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage transport fleet drivers and their assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Total Drivers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {filteredData.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredData.filter((d) => d.status === "active").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Inactive</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {filteredData.filter((d) => d.status === "inactive").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Utilization</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {((filteredData.filter((d) => d.status === "active").length / filteredData.length) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by name or license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <DataTable<Driver>
            data={filteredData}
            columns={columns}
            itemsPerPage={10}
            onRowClick={(driver) => console.log("Selected:", driver)}
          />
        </div>
      </div>
    </TransportLayout>
  );
}
