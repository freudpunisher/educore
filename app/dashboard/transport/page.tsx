"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import {
  mockDashboardKPI,
  mockSubscriptions,
  mockVehicles,
  mockDrivers,
  mockItineraries,
  mockVerificationChecks
} from "@/lib/mock/transport";
import { useVehicles, useDrivers, useItineraries, useTransportSubscriptions, useCreateTransportSubscription } from "@/hooks/use-transport";
import { useStudents } from "@/hooks/use-students";
import { VehicleSimpleStatusEnum, TransportSubscriptionCreate, TransportStatusEnum } from "@/types/transport";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { VehicleDialog } from "@/components/transport/vehicle-dialog";
import { VehicleSimple } from "@/types/transport";
import { useUpdateVehicle } from "@/hooks/use-transport";
import toast from "react-hot-toast";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";

export default function TransportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [searchSubscription, setSearchSubscription] = useState("");
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState("all");
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [searchDriver, setSearchDriver] = useState("");
  const [filterDriverStatus, setFilterDriverStatus] = useState("all");
  const [driverPage, setDriverPage] = useState(1);
  const [searchVehicle, setSearchVehicle] = useState("");
  const [filterVehicleStatus, setFilterVehicleStatus] = useState("all");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [searchItinerary, setSearchItinerary] = useState("");
  const [itineraryPage, setItineraryPage] = useState(1);
  const [expandedVerification, setExpandedVerification] = useState<string | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);

  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSimple | null>(null);

  const debouncedVehicleSearch = useDebounce(searchVehicle, 500);
  const debouncedDriverSearch = useDebounce(searchDriver, 500);
  const debouncedSubscriptionSearch = useDebounce(searchSubscription, 500);

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
    status: filterSubscriptionStatus === "all" ? undefined : filterSubscriptionStatus
  });

  const createSubscriptionMutation = useCreateTransportSubscription();
  const updateVehicleMutation = useUpdateVehicle();

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
      toast.error(error.message || "Failed to add enrollment", { id: loadingToast });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Vehicle status data for donut chart
  const vehicleChartData = [
    { name: "Active", value: mockDashboardKPI.vehiclesActive, color: "#10b981" },
    { name: "Inactive", value: mockDashboardKPI.vehiclesInactive, color: "#ef4444" },
    { name: "Maintenance", value: mockDashboardKPI.vehiclesMaintenance, color: "#f97316" },
  ];

  // Filter functions
  const filteredDrivers = driverData?.results || [];

  const filteredItineraries = itineraryData?.results || [];

  const filteredVehicles = vehicleData?.results || [];

  const filteredSubscriptions = subscriptionData?.results || [];

  if (isLoading) {
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
          value={mockDashboardKPI.subscriptionsTotal}
          trend={mockDashboardKPI.subscriptionsTrend}
          subtitle={`${mockDashboardKPI.subscriptionsActive} active`}
          icon={<Users className="w-6 h-6" />}
        />
        <KpiCard
          title="Vehicles"
          value={mockDashboardKPI.vehiclesTotal}
          subtitle={`${mockDashboardKPI.vehiclesActive} operational`}
          icon={<Truck className="w-6 h-6" />}
        />
        <KpiCard
          title="Drivers"
          value={mockDashboardKPI.driversTotal}
          subtitle={`${mockDashboardKPI.driversActive} active`}
          icon={<Users className="w-6 h-6" />}
        />
        <KpiCard
          title="Routes"
          value={mockDashboardKPI.itinerariesTotal}
          subtitle="Active routes"
          icon={<Route className="w-6 h-6" />}
        />
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="itineraries">Routes</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Status Donut Chart */}
            <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Vehicle Status
                </h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                  Fleet composition
                </p>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={vehicleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vehicleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {vehicleChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription & Driver Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscriptions Status */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Subscription Status
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                    Student enrollment overview
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Total
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {mockDashboardKPI.subscriptionsTotal}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Active
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {mockDashboardKPI.subscriptionsActive}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Inactive
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {mockDashboardKPI.subscriptionsInactive}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">
                    Monthly Fee
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${mockDashboardKPI.subscriptionsActive * 50}
                    <span className="text-sm text-muted-foreground ml-2">
                      total monthly revenue
                    </span>
                  </p>
                </div>
              </div>

              {/* Driver Status */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Driver Status
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                    Fleet personnel overview
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Total Drivers
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {mockDashboardKPI.driversTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Active
                    </span>
                    <StatusBadge status="active" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Inactive
                    </span>
                    <StatusBadge status="inactive" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400">
                  <Activity className="w-4 h-4" />
                  All drivers are licensed and verified
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

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
              <Button
                onClick={() => setIsSubscriptionDialogOpen(true)}
                className="rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Enrollment
              </Button>
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
                      key: "status" as any,
                      label: "Status",
                      render: (status) => <StatusBadge status={status as any} />
                    },
                    {
                      key: "enrollment_date" as any,
                      label: "Date",
                      render: (date) => new Date(date).toLocaleDateString()
                    },
                    {
                      key: "period" as any,
                      label: "Period",
                      render: (p) => `${p} months`
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              <div>
                <p className="text-sm text-muted-foreground">Monthly Forecast</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${subscriptionData?.results.reduce((sum: number, s: any) => sum + (s.itinerary_detail?.fees || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="itineraries" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Transport Routes
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {itineraryData?.count || 0} routes configured
              </p>
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
                      render: (v) => v?.model || "N/A"
                    },
                    { key: "fees_label", label: "Fees Period", sortable: true },
                    {
                      key: "fees",
                      label: "Cost",
                      render: (f) => `${f}$`
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {itineraryData?.results.filter((r: any) => r.state).length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue Est.</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {itineraryData?.results.reduce((sum: number, r: any) => sum + r.fees, 0) || 0}$
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


        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Transport Drivers
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredDrivers.length} drivers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search by name or license..."
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterDriverStatus}
                onChange={(e) => setFilterDriverStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                    { key: "licenseNumber" as any, label: "License", sortable: true },
                    { key: "vehicle_name" as any, label: "Assigned Vehicle", sortable: true },
                    { key: "status" as any, label: "Status", render: (status) => <StatusBadge status={status as any} /> },
                    { key: "phone" as any, label: "Contact", sortable: true },
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{driverData?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {driverData?.results.filter(d => d.status === "active").length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {driverData?.results.filter(d => d.status === "inactive").length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {driverData?.count ? Math.round((driverData.results.filter(d => d.status === "active").length / driverData.results.length) * 100) : 0}%
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
              <Button
                onClick={() => {
                  setSelectedVehicle(null);
                  setIsVehicleDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Vehicle
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
      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onClose={() => setIsSubscriptionDialogOpen(false)}
        onSubmit={handleCreateSubscription}
      />
    </div>
  );
}

function SubscriptionDialog({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportSubscriptionCreate) => void;
}) {
  const { data: studentsData } = useStudents();
  const { data: itineraryData } = useItineraries();

  const [studentId, setStudentId] = useState<string>("");
  const [itineraryId, setItineraryId] = useState<string>("");
  const [period, setPeriod] = useState<string>("1");
  const [enrollmentDate, setEnrollmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<TransportStatusEnum>(TransportStatusEnum.Active);

  const students = studentsData?.results || [];
  const itineraries = itineraryData?.results || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      student: parseInt(studentId),
      itinerary: parseInt(itineraryId),
      period: parseInt(period),
      enrollment_date: enrollmentDate,
      status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Add Transport Enrollment
          </DialogTitle>
          <DialogDescription>
            Register a student for a transport route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Student
              </label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.enrollment_number})
                  </option>
                ))}
              </select>
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
                    {it.registration_number} - {it.vehicle_detail.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Period (Months)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            <Button
              type="submit"
              className="rounded-xl px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all"
            >
              Add Enrollment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
