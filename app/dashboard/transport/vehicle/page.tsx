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
import { mockVehicles } from "@/lib/mock/transport";

interface Vehicle {
  id: number;
  plateNumber: string;
  type: string;
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  lastServiceDate: string;
}

export default function VehiclePage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return mockVehicles
      .filter((vehicle) => {
        if (statusFilter !== "all" && vehicle.status !== statusFilter) return false;
        if (
          searchTerm &&
          !(
            vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) {
          return false;
        }
        return true;
      })
      .map((vehicle) => ({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        type: vehicle.type,
        capacity: vehicle.capacity,
        status: vehicle.status as "active" | "inactive" | "maintenance",
        lastServiceDate: vehicle.lastServiceDate,
      }));
  }, [statusFilter, searchTerm]);

  const columns = [
    {
      key: "plateNumber" as const,
      label: "Plate Number",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "type" as const,
      label: "Vehicle Type",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "capacity" as const,
      label: "Capacity",
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-slate-900 dark:text-white">{value} seats</span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "active" | "inactive" | "maintenance") => <StatusBadge status={value} />,
    },
    {
      key: "lastServiceDate" as const,
      label: "Last Service",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
  ];

  const statusStats = {
    active: filteredData.filter((v) => v.status === "active").length,
    inactive: filteredData.filter((v) => v.status === "inactive").length,
    maintenance: filteredData.filter((v) => v.status === "maintenance").length,
  };

  return (
    <TransportLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Vehicles
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage transport fleet vehicles and maintenance schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Total Vehicles</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {filteredData.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {statusStats.active}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Inactive</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {statusStats.inactive}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Maintenance</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {statusStats.maintenance}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Avg Capacity</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {(filteredData.reduce((sum, v) => sum + v.capacity, 0) / filteredData.length).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by plate number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive" | "maintenance")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <DataTable<Vehicle>
            data={filteredData}
            columns={columns}
            itemsPerPage={10}
            onRowClick={(vehicle) => console.log("Selected:", vehicle)}
          />
        </div>
      </div>
    </TransportLayout>
  );
}
