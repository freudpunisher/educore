"use client";

import { useState, useMemo } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
} from "lucide-react";
import {
  mockDormAssignments,
  mockDormRooms,
  mockBoardingFees,
  mockVisitorLogs,
  mockRoomConditions,
  mockBoardingDashboardKPI,
} from "@/lib/mock/boarding";

export default function BoardingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<
    "all" | "active" | "checkout-pending"
  >("all");
  const [feePaymentFilter, setFeePaymentFilter] = useState<
    "all" | "paid" | "partially-paid" | "pending" | "overdue"
  >("all");
  const [roomConditionFilter, setRoomConditionFilter] = useState<
    "all" | "excellent" | "good" | "fair" | "needs-repair"
  >("all");

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return mockDormAssignments
      .filter((assignment) => {
        if (
          assignmentStatusFilter !== "all" &&
          assignment.status !== assignmentStatusFilter
        )
          return false;
        if (
          assignmentSearchTerm &&
          !assignment.studentName
            .toLowerCase()
            .includes(assignmentSearchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((assignment) => ({
        id: assignment.id,
        studentName: assignment.studentName,
        class: assignment.class,
        roomNumber: assignment.roomNumber,
        dormBlock: assignment.dormBlock,
        checkInDate: assignment.checkInDate,
        status: assignment.status as "active" | "checkout-pending" | "archived",
      }));
  }, [assignmentSearchTerm, assignmentStatusFilter]);

  // Filter fees
  const filteredFees = useMemo(() => {
    return mockBoardingFees
      .filter((fee) => {
        if (feePaymentFilter !== "all" && fee.paymentStatus !== feePaymentFilter)
          return false;
        return true;
      })
      .map((fee) => ({
        id: fee.id,
        studentName: fee.studentName,
        class: fee.class,
        totalFee: fee.totalFee,
        amountPaid: fee.amountPaid,
        dueDate: fee.dueDate,
        paymentStatus: fee.paymentStatus as "paid" | "partially-paid" | "pending" | "overdue",
      }));
  }, [feePaymentFilter]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return mockDormRooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      dormBlock: room.dormBlock,
      capacity: room.capacity,
      occupancy: room.occupancy,
      condition: room.condition,
      costPerBed: room.costPerBed,
    }));
  }, []);

  // Filter room conditions
  const filteredConditions = useMemo(() => {
    return mockRoomConditions.filter((condition) => {
      if (roomConditionFilter !== "all" && condition.condition !== roomConditionFilter)
        return false;
      return true;
    });
  }, [roomConditionFilter]);

  const assignmentColumns = [
    {
      key: "studentName" as const,
      label: "Student",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "class" as const,
      label: "Class",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "dormBlock" as const,
      label: "Dorm Block",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "roomNumber" as const,
      label: "Room",
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "checkInDate" as const,
      label: "Check-In",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "active" | "checkout-pending" | "archived") => {
        const statusMap = {
          active: "active",
          "checkout-pending": "inactive",
          archived: "inactive",
        } as const;
        return <StatusBadge status={statusMap[value]} />;
      },
    },
  ];

  const feeColumns = [
    {
      key: "studentName" as const,
      label: "Student",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "class" as const,
      label: "Class",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "totalFee" as const,
      label: "Total Fee",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">${value}</span>
      ),
    },
    {
      key: "amountPaid" as const,
      label: "Paid",
      sortable: true,
      render: (value: number) => (
        <span className="text-slate-600 dark:text-slate-300">${value}</span>
      ),
    },
    {
      key: "dueDate" as const,
      label: "Due Date",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "paymentStatus" as const,
      label: "Status",
      sortable: true,
      render: (value: "paid" | "partially-paid" | "pending" | "overdue") => {
        const statusMap = {
          paid: "active",
          "partially-paid": "inactive",
          pending: "inactive",
          overdue: "inactive",
        } as const;
        return <StatusBadge status={statusMap[value]} />;
      },
    },
  ];

  const roomColumns = [
    {
      key: "roomNumber" as const,
      label: "Room",
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "dormBlock" as const,
      label: "Block",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "capacity" as const,
      label: "Capacity",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "occupancy" as const,
      label: "Occupied",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "condition" as const,
      label: "Condition",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
            value === "excellent"
              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
              : value === "good"
              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
              : value === "fair"
              ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "costPerBed" as const,
      label: "Cost/Bed",
      sortable: true,
      render: (value: number) => (
        <span className="text-slate-600 dark:text-slate-300">${value}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="space-y-6 p-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            Student Boarding
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage dorm assignments, rooms, fees, and visitor logs
          </p>
        </div>

        {/* KPI Cards - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Occupancy"
            value={`${mockBoardingDashboardKPI.occupancyRate}%`}
            subtitle={`${mockBoardingDashboardKPI.totalStudents}/${mockBoardingDashboardKPI.totalRooms * 2} beds`}
            icon={<Users className="w-6 h-6" />}
          />
          <KpiCard
            title="Total Revenue"
            value={`$${mockBoardingDashboardKPI.totalRevenue}`}
            subtitle="Current term"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <KpiCard
            title="Maintenance Issues"
            value={mockBoardingDashboardKPI.maintenanceIssues}
            subtitle="Requiring action"
            icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
          />
          <KpiCard
            title="Pending Payments"
            value={mockBoardingDashboardKPI.pendingPayments}
            subtitle="Outstanding fees"
            icon={<AlertCircle className="w-6 h-6" />}
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950 text-xs sm:text-sm">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950 text-xs sm:text-sm">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="fees" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950 text-xs sm:text-sm">
              Fees
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950 text-xs sm:text-sm">
              Visitors
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950 text-xs sm:text-sm">
              Maintenance
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dorm Assignments
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Student room allocations and check-in status
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredAssignments.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredAssignments.filter((a) => a.status === "active").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Checkout Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {filteredAssignments.filter((a) => a.status === "checkout-pending").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Occupancy</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredAssignments.filter((a) => a.status === "active").length}/16
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by student name..."
                value={assignmentSearchTerm}
                onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={assignmentStatusFilter}
                onValueChange={(value) =>
                  setAssignmentStatusFilter(value as "all" | "active" | "checkout-pending")
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="checkout-pending">Checkout Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredAssignments}
                columns={assignmentColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Dorm rooms and bed management
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Rooms</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredRooms.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Available Beds</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredRooms.reduce((sum, r) => sum + (r.capacity - r.occupancy), 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Occupied</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredRooms.reduce((sum, r) => sum + r.occupancy, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Monthly Cost</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  ${filteredRooms[0]?.costPerBed || 0}/bed
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredRooms}
                columns={roomColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Boarding Fees
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Student fee payments and status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Fees</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ${mockBoardingFees.reduce((sum, f) => sum + f.totalFee, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Collected</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ${mockBoardingFees.reduce((sum, f) => sum + f.amountPaid, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Paid</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {mockBoardingFees.filter((f) => f.paymentStatus === "paid").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Pending/Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {mockBoardingFees.filter((f) => f.paymentStatus !== "paid").length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select
                value={feePaymentFilter}
                onValueChange={(value) =>
                  setFeePaymentFilter(
                    value as "all" | "paid" | "partially-paid" | "pending" | "overdue"
                  )
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredFees}
                columns={feeColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Visitor Logs
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Student visit records and check-in history
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Log Visitor
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Visitors This Month
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {mockVisitorLogs.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Avg Visit Duration
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  2h 15m
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockVisitorLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {log.studentName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        <span className="font-medium">{log.visitorName}</span>
                        {" • "}
                        <span>{log.visitorRelation}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {log.visitDate}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        {log.checkInTime} - {log.checkOutTime}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {log.duration}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    Purpose: {log.purpose}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Maintenance & Conditions
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Room inspections and maintenance issues
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Inspection
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Inspections
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredConditions.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Excellent</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredConditions.filter((c) => c.condition === "excellent").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Fair/Needs Repair</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {filteredConditions.filter((c) => c.condition !== "excellent" && c.condition !== "good").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Action Required</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {filteredConditions.filter((c) => c.actionRequired).length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select
                value={roomConditionFilter}
                onValueChange={(value) =>
                  setRoomConditionFilter(
                    value as "all" | "excellent" | "good" | "fair" | "needs-repair"
                  )
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs-repair">Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredConditions.map((condition) => (
                <div
                  key={condition.id}
                  className={`rounded-lg border-2 p-4 ${
                    condition.actionRequired
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {condition.roomNumber} - {condition.dormBlock}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {condition.notes}
                      </p>
                      {condition.issues.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Issues:
                          </p>
                          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                            {condition.issues.map((issue, idx) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize inline-block ${
                          condition.condition === "excellent"
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                            : condition.condition === "good"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : condition.condition === "fair"
                            ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {condition.condition}
                      </span>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">
                        {condition.inspectionDate}
                      </p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {condition.inspectedBy}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
