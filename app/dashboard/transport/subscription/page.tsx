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
import { mockSubscriptions } from "@/lib/mock/transport";

interface Subscription {
  id: number;
  studentName: string;
  route: string;
  status: "active" | "inactive";
  startDate: string;
  renewalDate: string;
  monthlyFee: number;
}

export default function SubscriptionPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return mockSubscriptions
      .filter((sub) => {
        if (statusFilter !== "all" && sub.status !== statusFilter) return false;
        if (
          searchTerm &&
          !sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !sub.route.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((sub) => ({
        id: sub.id,
        studentName: sub.studentName,
        route: sub.route,
        status: sub.status as "active" | "inactive",
        startDate: sub.startDate,
        renewalDate: sub.renewalDate,
        monthlyFee: sub.monthlyFee,
      }));
  }, [statusFilter, searchTerm]);

  const columns = [
    {
      key: "studentName" as const,
      label: "Student Name",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "route" as const,
      label: "Route",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "active" | "inactive") => <StatusBadge status={value} />,
    },
    {
      key: "startDate" as const,
      label: "Start Date",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "renewalDate" as const,
      label: "Renewal Date",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "monthlyFee" as const,
      label: "Monthly Fee",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">BIF {value}</span>
      ),
    },
  ];

  const totalRevenue = filteredData.reduce((sum, sub) => sum + sub.monthlyFee, 0);

  return (
    <TransportLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Subscriptions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage student transport subscriptions and renewal dates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Subscription
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {filteredData.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredData.filter((s) => s.status === "active").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Inactive</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {filteredData.filter((s) => s.status === "inactive").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Monthly Revenue</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              BIF {totalRevenue}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by student name or route..."
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
          <DataTable<Subscription>
            data={filteredData}
            columns={columns}
            itemsPerPage={10}
            onRowClick={(subscription) => console.log("Selected:", subscription)}
          />
        </div>
      </div>
    </TransportLayout>
  );
}
