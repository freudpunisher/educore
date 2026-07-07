"use client";

import { useState, useEffect, useCallback } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Truck,
  Route,
  Activity,
  Search,
  ChevronDown,
  Eye,
  Check,
  ShieldAlert,
  Plus,
  Pencil,
  History,
  ChevronsUpDown,
  CheckCircle,
  XCircle,
  Power,
  Printer,
  Download,
} from "lucide-react";

import {
  mockSubscriptions,
  mockVehicles,
  mockDrivers,
  mockItineraries,
  mockVerificationChecks
} from "@/lib/mock/transport";
import { useVehicles, useDrivers, useItineraries, useTransportSubscriptions, useCreateTransportSubscription, useUpdateTransportSubscription, useTransportDashboard, useTransportCheckIns } from "@/hooks/use-transport";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/lib/auth-context";
import { VehicleSimpleStatusEnum, TransportSubscriptionCreate, TransportStatusEnum, PeriodCategory, PeriodCategoryLabels } from "@/types/transport";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { VehicleDialog } from "@/components/transport/vehicle-dialog";
import { VehicleSimple } from "@/types/transport";
import { useUpdateVehicle } from "@/hooks/use-transport";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const getVehicleLabel = (driver: any) => {
  const vehicle = driver.vehicle_detail;
  if (!vehicle) return "Unassigned";

  return [vehicle.registration, vehicle.model].filter(Boolean).join(" - ") || `Vehicle #${driver.vehicle}`;
};

const isLicenseExpiringSoon = (expirationDate?: string | null) => {
  if (!expirationDate) return false;

  const expiresAt = new Date(expirationDate).getTime();
  if (Number.isNaN(expiresAt)) return false;

  const daysUntilExpiration = (expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiration >= 0 && daysUntilExpiration <= 30;
};

const TABS = [
  { value: "subscriptions", label: "Subscriptions" },
  { value: "checkins", label: "Check-ins" },
  { value: "itineraries", label: "Routes" },
  { value: "drivers", label: "Drivers" },
  { value: "vehicles", label: "Vehicles" },
] as const;

const ROLE_TABS: Record<string, string[]> = {
  receptionist: ["subscriptions"],
  driver: ["subscriptions", "checkins", "itineraries", "vehicles"],
};

export default function TransportDashboard() {
  const { user } = useAuth();
  const allowedTabs = (user?.role && ROLE_TABS[user.role]) || TABS.map((t) => t.value);
  const [activeTab, setActiveTab] = useState("subscriptions");

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "subscriptions");
    }
  }, [allowedTabs, activeTab]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSubscription, setSearchSubscription] = useState("");
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState("all");
  const [filterSubscriptionStudent, setFilterSubscriptionStudent] = useState("all");
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [checkInPage, setCheckInPage] = useState(1);
  const [searchDriver, setSearchDriver] = useState("");
  const [driverPage, setDriverPage] = useState(1);
  const [searchVehicle, setSearchVehicle] = useState("");
  const [filterVehicleStatus, setFilterVehicleStatus] = useState("all");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [searchItinerary, setSearchItinerary] = useState("");
  const [itineraryPage, setItineraryPage] = useState(1);
  const [expandedVerification, setExpandedVerification] = useState<string | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSimple | null>(null);

  const [isChangeVehicleModalOpen, setIsChangeVehicleModalOpen] = useState(false);
  const [selectedItineraryForChange, setSelectedItineraryForChange] = useState<any>(null);
  const [newVehicleId, setNewVehicleId] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItineraryForHistory, setSelectedItineraryForHistory] = useState<any>(null);

  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [newRouteVehicle, setNewRouteVehicle] = useState("");
  const [newRouteFees, setNewRouteFees] = useState("");
  const [newRouteState, setNewRouteState] = useState(true);

  const [filterPlate, setFilterPlate] = useState("");
  const [filterDriver, setFilterDriver] = useState("all");
  const [filterItinerary, setFilterItinerary] = useState("all");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");

  const debouncedVehicleSearch = useDebounce(searchVehicle, 500);
  const debouncedDriverSearch = useDebounce(searchDriver, 500);
  const debouncedSubscriptionSearch = useDebounce(searchSubscription, 500);
  const debouncedCheckInSearch = useDebounce(searchCheckIn, 500);
  const debouncedPlateSearch = useDebounce(filterPlate, 500);

  const queryClient = useQueryClient();

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await axiosInstance.get("/academics/years/");
      return (res.data?.results || []) as Array<{ id: number; start_year: number; end_year: number; is_current: boolean; name?: string }>;
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: allVehiclesData } = useQuery({
    queryKey: ["all-vehicles"],
    queryFn: async () => {
      const res = await axiosInstance.get("/transport/vehicle/", { params: { page: 1 } });
      const results = res.data?.results || res.data || [];
      return Array.isArray(results) ? results : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: feesData } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const res = await axiosInstance.get("/finance/fees/");
      const results = res.data?.results || res.data || [];
      return Array.isArray(results) ? results : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: vehicleData,
    isLoading: isVehiclesLoading,
    isError: isVehiclesError
  } = useVehicles({
    page: vehiclePage,
    search: debouncedVehicleSearch,
    status: filterVehicleStatus === "all" ? undefined : filterVehicleStatus
  });

  const {
    data: driverData,
    isLoading: isDriversLoading,
    isError: isDriversError
  } = useDrivers({
    page: driverPage,
    search: debouncedDriverSearch,
  });

  const {
    data: itineraryData,
    isLoading: isItinerariesLoading,
    isError: isItinerariesError
  } = useItineraries({
    page: itineraryPage,
    search: searchItinerary, // Assuming basic search for now
  });

  const {
    data: subscriptionData,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError
  } = useTransportSubscriptions({
    page: subscriptionPage,
    search: debouncedSubscriptionSearch,
    status: filterSubscriptionStatus === "all" ? undefined : filterSubscriptionStatus,
    student: filterSubscriptionStudent === "all" ? undefined : filterSubscriptionStudent,
    plate: debouncedPlateSearch || undefined,
    driver: filterDriver === "all" ? undefined : filterDriver,
    itinerary: filterItinerary === "all" ? undefined : filterItinerary,
    academic_year: filterAcademicYear || undefined,
  });

  const {
    data: checkInData,
    isLoading: isCheckInsLoading,
    isError: isCheckInsError
  } = useTransportCheckIns({
    page: checkInPage,
    search: debouncedCheckInSearch,
  });

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError
  } = useTransportDashboard();

  const createSubscriptionMutation = useCreateTransportSubscription();
  const updateSubscriptionMutation = useUpdateTransportSubscription();
  const updateVehicleMutation = useUpdateVehicle();

  // Unified loading state
  const isGlobalLoading = isLoading || isDashboardLoading;

  const stats = dashboardData || {
    subscriptions: { active: 0, inactive: 0 },
    vehicles: { active: 0, maintenance: 0, inactive: 0 },
    drivers: { total: 0 },
    itineraries: 0,
    today_checkins: 0,
  };

  const { data: studentsData } = useStudents();
  const students = studentsData?.results || [];

  const handleEditVehicle = (vehicle: VehicleSimple) => {
    setSelectedVehicle(vehicle);
    setIsVehicleDialogOpen(true);
  };

  const handleQuickVehicleStatusChange = async (vehicle: VehicleSimple, newStatus: any) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicle.id,
        data: { status: newStatus }
      });
      toast.success("Status updated!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Failed to update status", { id: loadingToast });
    }
  };

  const handleCreateSubscription = async (data: TransportSubscriptionCreate) => {
    const loadingToast = toast.loading("Adding enrollment...");
    try {
      await createSubscriptionMutation.mutateAsync(data);
      toast.success("Student enrolled successfully!", { id: loadingToast });
      setIsSubscriptionDialogOpen(false);
    } catch (error: any) {
      console.error("Enrollment error:", error);
      const errorMessage = error.response?.data?.errors?.non_field_errors?.[0] || 
                           error.response?.data?.message || 
                           error.message || 
                           "Failed to add enrollment";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const handleUpdateSubscription = async (id: number, data: Partial<TransportSubscriptionCreate>) => {
    const loadingToast = toast.loading("Updating enrollment...");
    try {
      await updateSubscriptionMutation.mutateAsync({ id, data });
      toast.success("Enrollment updated successfully!", { id: loadingToast });
      setIsSubscriptionDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.errors?.non_field_errors?.[0] || 
                           error.response?.data?.message || 
                           error.message || 
                           "Failed to update enrollment";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const handleValidateSubscription = async () => {
    if (!selectedSubscription) return;
    await updateSubscriptionMutation.mutateAsync({
      id: selectedSubscription.id,
      data: { status: TransportStatusEnum.Active },
    });
  };

  const openEditSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionDialogOpen(true);
  };

  const handleToggleSubscriptionStatus = async (subscription: any) => {
    const newStatus = subscription.status === "active" ? "inactive" : "active";
    const loadingToast = toast.loading(newStatus === "active" ? "Validating enrollment..." : "Deactivating enrollment...");
    try {
      await updateSubscriptionMutation.mutateAsync({
        id: subscription.id,
        data: { status: newStatus }
      });
      toast.success(newStatus === "active" ? "Enrollment validated!" : "Enrollment deactivated!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Action failed", { id: loadingToast });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);


  // Filter functions
  const filteredDrivers = driverData?.results || [];

  const filteredItineraries = itineraryData?.results || [];

  const filteredVehicles = vehicleData?.results || [];

  const filteredSubscriptions = subscriptionData?.results || [];

  const filteredCheckIns = checkInData?.results || [];

  const downloadPDF = (title: string, headers: string[], rows: string[][], filename: string) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text(`EDUCORE - ${title}`, 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 250, 15);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 18, 282, 18);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 23,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    doc.save(`${filename}.pdf`);
  };

  const downloadSubscriptions = () => {
    const headers = ["Student", "Enrollment #", "Route", "Date", "Plate #", "Driver", "Period", "Payment", "Status"];
    const rows = filteredSubscriptions.map((s: any) => [
      s.student_name || "",
      s.student_enrollment || "",
      s.itinerary_detail?.registration_number || "N/A",
      s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : "",
      s.itinerary_detail?.vehicle_detail?.plate_number || s.itinerary_detail?.vehicle_detail?.registration || "—",
      s.itinerary_detail?.drivers?.map((d: any) => d.user_name).join(", ") || "—",
      PeriodCategoryLabels[s.period_category as PeriodCategory] || `${s.period_category} months`,
      s.payment_status ? "In Order" : "Not in Order",
      s.status || "",
    ]);
    downloadPDF("Transport Subscriptions", headers, rows, "transport-subscriptions");
  };

  const downloadItineraries = () => {
    const headers = ["Route ID", "Vehicle", "Fees Period", "Cost", "Status"];
    const rows = filteredItineraries.map((r: any) => [
      r.registration_number || "",
      r.vehicle_detail?.model || "N/A",
      r.fees_label || "",
      r.fees_amount ? `BIF ${Number(r.fees_amount).toLocaleString()}` : "—",
      r.state ? "Active" : "Inactive",
    ]);
    downloadPDF("Transport Routes", headers, rows, "transport-routes");
  };

  const downloadCheckIns = () => {
    const headers = ["Student", "Route", "Check-in Time", "Status"];
    const rows = filteredCheckIns.map((c: any) => [
      c.student_name || "",
      `Route ${c.itinerary || "N/A"}`,
      c.checked_at ? new Date(c.checked_at).toLocaleString() : "",
      c.status ? "Active" : "Inactive",
    ]);
    downloadPDF("Transport Check-ins", headers, rows, "transport-checkins");
  };

  const downloadDrivers = () => {
    const headers = ["Name", "Email", "Assigned Vehicle", "License Number", "License Expiration"];
    const rows = filteredDrivers.map((d: any) => [
      d.user_name || "",
      d.user_email || "Not set",
      getVehicleLabel(d),
      d.driving_license_number || "",
      d.driving_license_expiration_date ? new Date(d.driving_license_expiration_date).toLocaleDateString() : "Not set",
    ]);
    downloadPDF("Transport Drivers", headers, rows, "transport-drivers");
  };

  const downloadVehicles = () => {
    const headers = ["License Plate", "Model", "Capacity", "Status"];
    const rows = filteredVehicles.map((v: any) => [
      v.registration || "",
      v.model || "",
      v.capacity?.toString() || "",
      v.status || "",
    ]);
    downloadPDF("Fleet Vehicles", headers, rows, "transport-vehicles");
  };

  if (isGlobalLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-xl shadow-lg">
            <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          Transport Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
          Monitor vehicles, drivers, routes, and student subscriptions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Subscriptions"
          value={stats.subscriptions.active + stats.subscriptions.inactive}
          subtitle={`${stats.subscriptions.active} active`}
          icon={<Users className="w-6 h-6" />}
          trend={12}
        />
        <KpiCard
          title="Vehicles"
          value={stats.vehicles.active + stats.vehicles.maintenance + stats.vehicles.inactive}
          subtitle={`${stats.vehicles.active} operational`}
          icon={<Truck className="w-6 h-6" />}
        />
        <KpiCard
          title="Drivers"
          value={stats.drivers.total}
          subtitle="Registered drivers"
          icon={<Users className="w-6 h-6" />}
        />
        <KpiCard
          title="Routes"
          value={stats.itineraries}
          subtitle="Active itineraries"
          icon={<Route className="w-6 h-6" />}
        />
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))` }}>
          {TABS.filter((t) => allowedTabs.includes(t.value)).map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>



        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transport Subscriptions
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage student transport enrollment and status
                </p>
              </div>
              {user?.role === "transporter" && (
                <Button
                  onClick={() => {
                    setSelectedSubscription(null);
                    setIsSubscriptionDialogOpen(true);
                  }}
                  className="rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Enrollment
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search students..."
                  value={searchSubscription}
                  onChange={(e) => setSearchSubscription(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentSelect}
                    className="w-full sm:w-[250px] justify-between h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {filterSubscriptionStudent === "all"
                      ? "All Students"
                      : students.find(s => s.id.toString() === filterSubscriptionStudent)?.full_name || "All Students"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0 rounded-xl">
                  <Command>
                    <CommandInput placeholder="Search student..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilterSubscriptionStudent("all");
                            setOpenStudentSelect(false);
                          }}
                        >
                          All Students
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              filterSubscriptionStudent === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        {students.map((student) => (
                          <CommandItem
                            key={`filter-student-${student.id}`}
                            value={student.full_name}
                            onSelect={() => {
                              setFilterSubscriptionStudent(student.id.toString());
                              setOpenStudentSelect(false);
                            }}
                          >
                            {student.full_name}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                filterSubscriptionStudent === student.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <select
                value={filterSubscriptionStatus}
                onChange={(e) => setFilterSubscriptionStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                placeholder="Search plate number..."
                value={filterPlate}
                onChange={(e) => { setFilterPlate(e.target.value); setSubscriptionPage(1); }}
                className="w-full sm:w-48 pl-4 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <select
                value={filterDriver}
                onChange={(e) => { setFilterDriver(e.target.value); setSubscriptionPage(1); }}
                className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Drivers</option>
                {driverData?.results?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.user_name}</option>
                ))}
              </select>
              <select
                value={filterItinerary}
                onChange={(e) => { setFilterItinerary(e.target.value); setSubscriptionPage(1); }}
                className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Routes</option>
                {itineraryData?.results?.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.registration_number}</option>
                ))}
              </select>
              <select
                value={filterAcademicYear}
                onChange={(e) => { setFilterAcademicYear(e.target.value); setSubscriptionPage(1); }}
                className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {yearsData?.map((y: any) => (
                  <option key={y.id} value={y.id}>{y.name || `${y.start_year}/${y.end_year}`}{y.is_current ? " (Current)" : ""}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={downloadSubscriptions} className="gap-2 whitespace-nowrap">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>

            {isSubscriptionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading subscriptions...</p>
              </div>
            ) : isSubscriptionsError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-600">
                <ShieldAlert className="w-10 h-10" />
                <p className="font-medium">Failed to load subscriptions</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: "student_name" as any, label: "Student", sortable: true },
                    { key: "student_enrollment" as any, label: "Enrollment #", sortable: true },
                    {
                      key: "itinerary_detail" as any,
                      label: "Route",
                      render: (it) => it?.registration_number || "N/A"
                    },
                    {
                      key: "enrollment_date" as any,
                      label: "Date",
                      render: (date) => new Date(date).toLocaleDateString()
                    },
                    {
                      key: "vehicle_info" as any,
                      label: "Vehicle",
                      render: (_, sub: any) => {
                        const plate = sub?.itinerary_detail?.vehicle_detail?.plate_number;
                        const model = sub?.itinerary_detail?.vehicle_detail?.model;
                        return plate && model ? `${plate} - ${model}` : plate || model || "—";
                      }
                    },
                    {
                      key: "driver_name" as any,
                      label: "Driver",
                      render: (_, sub: any) => {
                        const drivers = sub?.itinerary_detail?.drivers;
                        if (!drivers || drivers.length === 0) return "—";
                        return drivers.map((d: any) => d.user_name).join(", ");
                      }
                    },
                    {
                      key: "period_category" as any,
                      label: "Period",
                      render: (p) => PeriodCategoryLabels[p as PeriodCategory] || `${p} months`
                    },
                    {
                      key: "payment_status" as any,
                      label: "Payment",
                      render: (payment_status) => {
                        const isInOrder = payment_status === "in_order";
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isInOrder
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isInOrder ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {isInOrder ? "In Order" : "Not in Order"}
                          </span>
                        );
                      }
                    },
                    {
                      key: "status" as any,
                      label: "Status",
                      render: (status) => <StatusBadge status={status as any} />
                    },
                    {
                      key: "id" as any,
                      label: "Actions",
                      render: (_, subscription: any) => {
                        const status = subscription.status?.toLowerCase();
                        const isActive = status === "active";
                        const isReceptionist = user?.role === "receptionist";
                        const isDriver = user?.role === "driver";

                        return (
                          <div className="flex items-center gap-1">
                            {!isActive && !isDriver && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditSubscription(subscription);
                                  }}
                                  className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSubscriptionStatus(subscription);
                                  }}
                                  className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                  title="Validate"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {isActive && !isReceptionist && !isDriver && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSubscriptionStatus(subscription);
                                }}
                                className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                title="Deactivate"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      }
                    },
                  ]}
                  data={filteredSubscriptions}
                  itemsPerPage={10}
                />

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredSubscriptions.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{subscriptionData?.count || 0}</span> subscriptions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubscriptionPage(p => Math.max(1, p - 1))}
                      disabled={subscriptionPage === 1}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                      {subscriptionPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubscriptionPage(p => p + 1)}
                      disabled={!subscriptionData?.next}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{subscriptionData?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {subscriptionData?.results.filter((s: any) => s.status === "active").length || 0}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="itineraries" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transport Routes
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {itineraryData?.count || 0} routes configured
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadItineraries} className="gap-2">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={() => { setNewRouteVehicle(""); setNewRouteFees(""); setNewRouteState(true); setIsCreateRouteModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Route
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                placeholder="Search routes..."
                value={searchItinerary}
                onChange={(e) => setSearchItinerary(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isItinerariesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading routes...</p>
              </div>
            ) : isItinerariesError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-600">
                <ShieldAlert className="w-10 h-10" />
                <p className="font-medium">Failed to load routes</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: "registration_number", label: "Route ID", sortable: true },
                    {
                      key: "vehicle_detail" as any,
                      label: "Vehicle",
                      render: (v) => {
                        const plate = v?.plate_number;
                        const model = v?.model;
                        return plate && model ? `${plate} - ${model}` : plate || model || "N/A";
                      }
                    },
                    { key: "fees_label", label: "Fees Period", sortable: true },
                    {
                      key: "fees_amount" as any,
                      label: "Cost",
                      render: (v) => v ? `BIF ${Number(v).toLocaleString()}` : "—"
                    },
                    {
                      key: "state" as any,
                      label: "Status",
                      render: (s) => (
                        <StatusBadge
                          status={s ? "active" : "inactive"}
                        />
                      )
                    },
                    {
                      key: "id" as any,
                      label: "Actions",
                      render: (_: any, item: any) => (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItineraryForChange(item);
                              setNewVehicleId(item.vehicule?.toString() || "");
                              setIsChangeVehicleModalOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Change Vehicle"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItineraryForHistory(item);
                              setIsHistoryModalOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="History"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    },
                  ]}
                  data={filteredItineraries}
                  itemsPerPage={10}
                />

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredItineraries.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{itineraryData?.count || 0}</span> routes
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setItineraryPage(p => Math.max(1, p - 1))}
                      disabled={itineraryPage === 1}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                      {itineraryPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setItineraryPage(p => p + 1)}
                      disabled={!itineraryData?.next}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {itineraryData?.results.filter((r: any) => r.state).length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fleet Coverage</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {itineraryData?.count ? Math.round((itineraryData.results.filter((r: any) => r.state).length / itineraryData.count) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transport Check-ins
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor daily student check-ins and vehicle boarding
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadCheckIns} className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search student or vehicle..."
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {isCheckInsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading check-ins...</p>
              </div>
            ) : isCheckInsError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-600">
                <ShieldAlert className="w-10 h-10" />
                <p className="font-medium">Failed to load check-ins</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: "student_name", label: "Student", sortable: true },
                    {
                      key: "itinerary" as any,
                      label: "Route",
                      render: (_, item: any) => `Route ${item.itinerary || 'N/A'}`
                    },
                    {
                      key: "checked_at" as any,
                      label: "Check-in Time",
                      render: (val) => new Date(val).toLocaleString()
                    },
                    {
                      key: "status" as any,
                      label: "Status",
                      render: (status) => (
                        <StatusBadge status={status ? "active" : "inactive"} />
                      )
                    },
                  ]}
                  data={filteredCheckIns}
                  itemsPerPage={10}
                />

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCheckIns.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{checkInData?.count || 0}</span> check-ins
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckInPage(p => Math.max(1, p - 1))}
                      disabled={checkInPage === 1}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                      {checkInPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckInPage(p => p + 1)}
                      disabled={!checkInData?.next}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{checkInData?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.today_checkins}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transport Drivers
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredDrivers.length} drivers
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadDrivers} className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search by name, email, license, or vehicle..."
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {isDriversLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading drivers...</p>
              </div>
            ) : isDriversError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-600">
                <ShieldAlert className="w-10 h-10" />
                <p className="font-medium">Failed to load drivers</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: "user_name", label: "Name", sortable: true },
                    { key: "user_email" as any, label: "Email", render: (email) => email || "Not set" },
                    {
                      key: "vehicle_detail" as any,
                      label: "Assigned Vehicle",
                      render: (_vehicle, driver) => getVehicleLabel(driver),
                    },
                    { key: "driving_license_number" as any, label: "License Number", sortable: true },
                    {
                      key: "driving_license_expiration_date" as any,
                      label: "License Expiration",
                      sortable: true,
                      render: (date) => (
                        <span className={isLicenseExpiringSoon(date) ? "font-semibold text-amber-600 dark:text-amber-400" : ""}>
                          {formatDate(date)}
                        </span>
                      ),
                    },
                  ]}
                  data={filteredDrivers}
                  itemsPerPage={10}
                />

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredDrivers.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{driverData?.count || 0}</span> drivers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDriverPage(p => Math.max(1, p - 1))}
                      disabled={driverPage === 1}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                      {driverPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDriverPage(p => p + 1)}
                      disabled={!driverData?.next}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{driverData?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Vehicle</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {driverData?.results.filter(d => Boolean(d.vehicle)).length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Licenses Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {driverData?.results.filter(d => isLicenseExpiringSoon(d.driving_license_expiration_date)).length || 0}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Fleet Vehicles
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {vehicleData?.count || 0} vehicles in total
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadVehicles} className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search by plate or type..."
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterVehicleStatus}
                onChange={(e) => setFilterVehicleStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value={VehicleSimpleStatusEnum.Active}>Active</option>
                <option value={VehicleSimpleStatusEnum.Inactive}>Inactive</option>
                <option value={VehicleSimpleStatusEnum.Maintenance}>Maintenance</option>
              </select>
            </div>

            {isVehiclesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading vehicles...</p>
              </div>
            ) : isVehiclesError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-600">
                <ShieldAlert className="w-10 h-10" />
                <p className="font-medium">Failed to load vehicles</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={[
                    { key: "registration", label: "License Plate", sortable: true },
                    { key: "model", label: "Model", sortable: true },
                    { key: "capacity", label: "Capacity", sortable: true },
                    {
                      key: "status",
                      label: "Status",
                      render: (status) => <StatusBadge status={status as any} />
                    },
                    {
                      key: "id" as any,
                      label: "Actions",
                      render: (_, vehicle: VehicleSimple) => (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVehicle(vehicle);
                            }}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleQuickVehicleStatusChange(vehicle, VehicleSimpleStatusEnum.Active)}
                                className="gap-2 focus:bg-green-50 dark:focus:bg-green-900/20"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuickVehicleStatusChange(vehicle, VehicleSimpleStatusEnum.Maintenance)}
                                className="gap-2 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                              >
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuickVehicleStatusChange(vehicle, VehicleSimpleStatusEnum.Inactive)}
                                className="gap-2 focus:bg-red-50 dark:focus:bg-red-900/20"
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                Inactive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    }
                  ]}
                  data={filteredVehicles}
                  itemsPerPage={10}
                />

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredVehicles.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{vehicleData?.count || 0}</span> vehicles
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVehiclePage(p => Math.max(1, p - 1))}
                      disabled={vehiclePage === 1}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                      {vehiclePage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVehiclePage(p => p + 1)}
                      disabled={!vehicleData?.next}
                      className="rounded-lg h-9 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{vehicleData?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vehicleData?.results.filter(v => v.status === VehicleSimpleStatusEnum.Active).length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Capacity</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {vehicleData?.results.length ? Math.round(vehicleData.results.reduce((sum, v) => sum + v.capacity, 0) / vehicleData.results.length) : 0} seats
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <VehicleDialog
          isOpen={isVehicleDialogOpen}
          onClose={() => setIsVehicleDialogOpen(false)}
          record={selectedVehicle}
        />
      </Tabs>

      {/* Change Vehicle Modal */}
      <Dialog open={isChangeVehicleModalOpen} onOpenChange={setIsChangeVehicleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Vehicle</DialogTitle>
            <DialogDescription>
              Assign a different vehicle to route <strong>{selectedItineraryForChange?.registration_number}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Vehicle</label>
              <p className="text-sm text-muted-foreground">
                {selectedItineraryForChange?.vehicle_detail?.model || selectedItineraryForChange?.vehicle_detail?.registration || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Vehicle</label>
              <select
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vehicle...</option>
                {(allVehiclesData || []).map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} - {v.model} ({v.plate_number || "N/A"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsChangeVehicleModalOpen(false)}>Cancel</Button>
            <Button
              disabled={!newVehicleId}
              onClick={async () => {
                try {
                  await axiosInstance.post(`/transport/itinerary/${selectedItineraryForChange.id}/change_vehicle/`, { vehicle_id: parseInt(newVehicleId) });
                  toast.success("Vehicle changed successfully");
                  queryClient.invalidateQueries({ queryKey: ["transport-itineraries"] });
                  setIsChangeVehicleModalOpen(false);
                } catch {
                  toast.error("Failed to change vehicle");
                }
              }}
            >
              Change Vehicle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Route Change History</DialogTitle>
            <DialogDescription>
              Vehicle change logs for route <strong>{selectedItineraryForHistory?.registration_number}</strong>
            </DialogDescription>
          </DialogHeader>
          <HistoryModalContent itineraryId={selectedItineraryForHistory?.id} />
        </DialogContent>
      </Dialog>

      {/* Create Route Modal */}
      <Dialog open={isCreateRouteModalOpen} onOpenChange={setIsCreateRouteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transport Route</DialogTitle>
            <DialogDescription>Create a new itinerary with a vehicle and fees.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle</label>
              <select
                value={newRouteVehicle}
                onChange={(e) => setNewRouteVehicle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vehicle...</option>
                {(allVehiclesData || []).map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} - {v.model} ({v.plate_number || "N/A"})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fees</label>
              <select
                value={newRouteFees}
                onChange={(e) => setNewRouteFees(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fees...</option>
                {(feesData || []).map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.label} — BIF {f.amount}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="route-state"
                checked={newRouteState}
                onChange={(e) => setNewRouteState(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="route-state" className="text-sm font-medium">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateRouteModalOpen(false)}>Cancel</Button>
            <Button
              disabled={!newRouteVehicle || !newRouteFees}
              onClick={async () => {
                try {
                  await axiosInstance.post("/transport/itinerary/", {
                    vehicule: parseInt(newRouteVehicle),
                    fees: parseInt(newRouteFees),
                    state: newRouteState,
                  });
                  toast.success("Route created successfully");
                  queryClient.invalidateQueries({ queryKey: ["transport-itineraries"] });
                  setIsCreateRouteModalOpen(false);
                } catch {
                  toast.error("Failed to create route");
                }
              }}
            >
              Create Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onClose={() => {
          setIsSubscriptionDialogOpen(false);
          setSelectedSubscription(null);
        }}
        onSubmit={(data) => {
          if (selectedSubscription) {
            handleUpdateSubscription(selectedSubscription.id, data);
          } else {
            handleCreateSubscription(data);
          }
        }}
        onValidate={handleValidateSubscription}
        record={selectedSubscription}
      />
    </div>
  );
}

function SubscriptionDialog({
  isOpen,
  onClose,
  onSubmit,
  onValidate,
  record,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportSubscriptionCreate | Partial<TransportSubscriptionCreate>) => void;
  onValidate?: () => void;
  record?: any | null;
}) {
  const { data: studentsData } = useStudents();
  const { data: itineraryData } = useItineraries();

  const [studentId, setStudentId] = useState<string>("");
  const [itineraryId, setItineraryId] = useState<string>("");
  const [periodCategory, setPeriodCategory] = useState<string>(PeriodCategory.ANNUALLY.toString());
  const [enrollmentDate, setEnrollmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<TransportStatusEnum>(TransportStatusEnum.Inactive);
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    if (record && isOpen) {
      setStudentId(record.student?.toString() || "");
      setItineraryId(record.itinerary?.toString() || "");
      setPeriodCategory(record.period_category?.toString() || PeriodCategory.ANNUALLY.toString());
      setEnrollmentDate(record.enrollment_date || new Date().toISOString().split("T")[0]);
      setStatus(record.status || TransportStatusEnum.Inactive);
    } else if (isOpen) {
      setStudentId("");
      setItineraryId("");
      setPeriodCategory(PeriodCategory.ANNUALLY.toString());
      setEnrollmentDate(new Date().toISOString().split("T")[0]);
      setStatus(TransportStatusEnum.Inactive);
    }
  }, [record, isOpen]);

  const students = studentsData?.results || [];
  const itineraries = itineraryData?.results || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !itineraryId) {
      toast.error("Please select a student and a route");
      return;
    }
    onSubmit({
      student: parseInt(studentId),
      itinerary: parseInt(itineraryId),
      period_category: parseInt(periodCategory),
      enrollment_date: enrollmentDate,
      status,
    });
  };

  const handleValidate = async () => {
    if (!onValidate || !record) return;
    const loadingToast = toast.loading("Validating subscription...");
    try {
      await onValidate();
      setIsValidated(true);
      toast.success("Subscription validated successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to validate subscription", { id: loadingToast });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {record ? "Edit Transport Enrollment" : "Add Transport Enrollment"}
          </DialogTitle>
          <DialogDescription>
            {record ? "Update student transport details." : "Register a student for a transport route."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Student
              </label>
              <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentSelect}
                    className="w-full justify-between h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {studentId
                      ? students.find((s) => s.id.toString() === studentId)?.full_name
                      : "Select Student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 rounded-xl" align="start">
                  <Command className="w-full">
                    <CommandInput placeholder="Search student by name or enrollment..." className="h-9" />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={`form-student-${student.id}`}
                            value={`${student.full_name} ${student.enrollment_number}`}
                            onSelect={() => {
                              setStudentId(student.id.toString());
                              setOpenStudentSelect(false);
                            }}
                          >
                            {student.full_name}
                            <span className="ml-2 text-xs text-muted-foreground">({student.enrollment_number})</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                studentId === student.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" required value={studentId} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Route
              </label>
              <select
                required
                value={itineraryId}
                onChange={(e) => setItineraryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Route</option>
                {itineraries.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.fees_label || `${it.registration_number} - ${it.vehicle_detail?.model || ""}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Period Category
                </label>
                <select
                  required
                  value={periodCategory}
                  onChange={(e) => setPeriodCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PeriodCategoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  required
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransportStatusEnum)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TransportStatusEnum.Active}>Active</option>
                <option value={TransportStatusEnum.Inactive}>Inactive</option>
                <option value={TransportStatusEnum.Suspended}>Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-6 h-11"
            >
              Cancel
            </Button>
            {record && record.status !== "active" && !isValidated && onValidate && (
              <Button
                type="button"
                onClick={handleValidate}
                className="rounded-xl px-6 h-11 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all"
              >
                Validate
              </Button>
            )}
            {record?.status !== "active" && !isValidated && (
              <Button
                type="submit"
                className="rounded-xl px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all"
              >
                {record ? "Save Changes" : "Add Enrollment"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HistoryModalContent({ itineraryId }: { itineraryId: number | undefined }) {
  const { data, isLoading } = useQuery({
    queryKey: ["itinerary-detail", itineraryId],
    queryFn: async () => {
      if (!itineraryId) return null;
      const res = await axiosInstance.get(`/transport/itinerary/${itineraryId}/`);
      return res.data;
    },
    enabled: !!itineraryId,
  });

  const logs = data?.change_logs || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
      {logs.length > 0 ? (
        logs.map((log: any) => (
          <div key={log.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
            <div>
              <p className="text-sm font-medium">
                {log.old_vehicle_label || "N/A"} → {log.new_vehicle_label || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {log.changed_by_name || "System"} — {new Date(log.changed_at).toLocaleString()}
              </p>
            </div>
            <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No vehicle changes recorded for this route.</p>
      )}
    </div>
  );
}
