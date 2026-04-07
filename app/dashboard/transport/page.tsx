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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { mockDashboardKPI, mockSubscriptions, mockVehicles, mockDrivers, mockItineraries, mockVerificationChecks } from "@/lib/mock/transport";

export default function TransportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [searchSubscription, setSearchSubscription] = useState("");
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState("all");
  const [searchDriver, setSearchDriver] = useState("");
  const [filterDriverStatus, setFilterDriverStatus] = useState("all");
  const [searchVehicle, setSearchVehicle] = useState("");
  const [filterVehicleStatus, setFilterVehicleStatus] = useState("all");
  const [searchItinerary, setSearchItinerary] = useState("");
  const [expandedVerification, setExpandedVerification] = useState<string | null>(null);

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
  const filteredSubscriptions = mockSubscriptions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchSubscription.toLowerCase()) ||
                         sub.route.toLowerCase().includes(searchSubscription.toLowerCase());
    const matchesStatus = filterSubscriptionStatus === "all" || sub.status === filterSubscriptionStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredDrivers = mockDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchDriver.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchDriver.toLowerCase());
    const matchesStatus = filterDriverStatus === "all" || driver.status === filterDriverStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchVehicle.toLowerCase()) ||
                         vehicle.type.toLowerCase().includes(searchVehicle.toLowerCase());
    const matchesStatus = filterVehicleStatus === "all" || vehicle.status === filterVehicleStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredItineraries = mockItineraries.filter(route =>
    route.routeName.toLowerCase().includes(searchItinerary.toLowerCase())
  );

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
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Subscriptions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredSubscriptions.length} subscriptions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder="Search by student or route..."
                  value={searchSubscription}
                  onChange={(e) => setSearchSubscription(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <option value="pending">Pending</option>
              </select>
            </div>

            <DataTable
              columns={[
                { key: "studentName", label: "Student", sortable: true },
                { key: "class", label: "Class", sortable: true },
                { key: "route", label: "Route", sortable: true },
                { key: "status", label: "Status", render: (status) => <StatusBadge status={status as any} /> },
                { key: "startDate", label: "Start Date", sortable: true },
                { key: "monthlyFee", label: "Monthly Fee", render: (fee) => `$${fee}` },
              ]}
              data={filteredSubscriptions}
              itemsPerPage={10}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockDashboardKPI.subscriptionsTotal}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{mockDashboardKPI.subscriptionsActive}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${mockDashboardKPI.subscriptionsActive * 50}/mo</p>
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
                {filteredItineraries.length} routes configured
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItineraries.map((route) => (
                <div key={route.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{route.routeName}</h4>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {route.stops.length} stops
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Driver: {route.assignedDriver}</p>
                  <p className="text-sm text-muted-foreground">Vehicle: {route.assignedVehicle}</p>
                  <p className="text-sm text-muted-foreground">Departs: {route.departureTime}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockDashboardKPI.itinerariesTotal}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockSubscriptions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Stops/Route</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(mockItineraries.reduce((sum, r) => sum + r.stops.length, 0) / mockItineraries.length).toFixed(1)}
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

            <DataTable
              columns={[
                { key: "name", label: "Name", sortable: true },
                { key: "licenseNumber", label: "License", sortable: true },
                { key: "assignedVehicle", label: "Assigned Vehicle", sortable: true },
                { key: "status", label: "Status", render: (status) => <StatusBadge status={status as any} /> },
                { key: "phone", label: "Contact", sortable: true },
              ]}
              data={filteredDrivers}
              itemsPerPage={10}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockDashboardKPI.driversTotal}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{mockDashboardKPI.driversActive}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{mockDashboardKPI.driversTotal - mockDashboardKPI.driversActive}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((mockDashboardKPI.driversActive / mockDashboardKPI.driversTotal) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Fleet Vehicles
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredVehicles.length} vehicles
              </p>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <DataTable
              columns={[
                { key: "plateNumber", label: "License Plate", sortable: true },
                { key: "type", label: "Type", sortable: true },
                { key: "capacity", label: "Capacity", sortable: true },
                { key: "status", label: "Status", render: (status) => <StatusBadge status={status as any} /> },
                { key: "lastServiceDate", label: "Last Service", sortable: true },
              ]}
              data={filteredVehicles}
              itemsPerPage={10}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockDashboardKPI.vehiclesTotal}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{mockDashboardKPI.vehiclesActive}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Capacity</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(mockVehicles.reduce((sum, v) => sum + v.capacity, 0) / mockVehicles.length)} seats
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
