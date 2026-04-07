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
  UtensilsCrossed,
  Leaf,
  TrendingUp,
  Clock,
  ShoppingCart,
  Plus,
  Download,
} from "lucide-react";
import {
  mockMealPlans,
  mockMealItems,
  mockStudentPreferences,
  mockMealOrders,
  mockCanteenDashboardKPI,
} from "@/lib/mock/canteen";

export default function CanteenPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "served" | "cancelled"
  >("all");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [mealSearchTerm, setMealSearchTerm] = useState("");
  const [preferenceSearchTerm, setPreferenceSearchTerm] = useState("");

  // Filter meal orders
  const filteredOrders = useMemo(() => {
    return mockMealOrders
      .filter((order) => {
        if (orderStatusFilter !== "all" && order.status !== orderStatusFilter)
          return false;
        if (
          orderSearchTerm &&
          !order.studentName.toLowerCase().includes(orderSearchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((order) => ({
        id: order.id,
        studentName: order.studentName,
        class: order.class,
        mealPlan: order.mealPlan,
        servingDate: order.servingDate,
        totalPrice: order.totalPrice,
        status: order.status as "pending" | "confirmed" | "served" | "cancelled",
        paymentStatus: order.paymentStatus as "pending" | "paid" | "refunded",
      }));
  }, [orderStatusFilter, orderSearchTerm]);

  // Filter meal items
  const filteredMealItems = useMemo(() => {
    return mockMealItems.filter((item) =>
      item.name.toLowerCase().includes(mealSearchTerm.toLowerCase())
    );
  }, [mealSearchTerm]);

  // Filter preferences
  const filteredPreferences = useMemo(() => {
    return mockStudentPreferences.filter((pref) =>
      pref.studentName.toLowerCase().includes(preferenceSearchTerm.toLowerCase())
    );
  }, [preferenceSearchTerm]);

  const orderColumns = [
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
      key: "mealPlan" as const,
      label: "Meal Plan",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "servingDate" as const,
      label: "Serving Date",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "pending" | "confirmed" | "served" | "cancelled") => {
        const statusMap = {
          pending: "inactive",
          confirmed: "active",
          served: "active",
          cancelled: "inactive",
        } as const;
        return <StatusBadge status={statusMap[value]} />;
      },
    },
    {
      key: "totalPrice" as const,
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">${value.toFixed(2)}</span>
      ),
    },
  ];

  const mealColumns = [
    {
      key: "name" as const,
      label: "Meal Item",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "category" as const,
      label: "Category",
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-600 dark:text-slate-300 capitalize">{value}</span>
      ),
    },
    {
      key: "calories" as const,
      label: "Calories",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "protein" as const,
      label: "Protein (g)",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "cost" as const,
      label: "Cost",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">${value.toFixed(2)}</span>
      ),
    },
    {
      key: "availableToday" as const,
      label: "Available",
      sortable: false,
      render: (value: boolean) => (
        <StatusBadge status={value ? "active" : "inactive"} />
      ),
    },
  ];

  const preferenceColumns = [
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
      key: "dietaryRestriction" as const,
      label: "Diet",
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-600 dark:text-slate-300 capitalize">{value}</span>
      ),
    },
    {
      key: "preferredMealPlan" as const,
      label: "Preferred Plan",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "allergies" as const,
      label: "Allergies",
      sortable: false,
      render: (value: string[]) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {value.length > 0 ? value.join(", ") : "None"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="space-y-6 p-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl shadow-lg">
              <UtensilsCrossed className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            Canteen Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage meals, preferences, dietary restrictions, and student orders
          </p>
        </div>

        {/* KPI Cards - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Meals Served"
            value={mockCanteenDashboardKPI.mealsServedToday}
            subtitle={`Today - Avg ${mockCanteenDashboardKPI.averageOrderValue.toFixed(2)}/order`}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <KpiCard
            title="Items Available"
            value={mockCanteenDashboardKPI.mealItemsAvailable}
            subtitle={`Out of 12 items`}
            icon={<UtensilsCrossed className="w-6 h-6" />}
          />
          <KpiCard
            title="Total Revenue"
            value={`$${mockCanteenDashboardKPI.totalRevenue}`}
            subtitle={`${mockCanteenDashboardKPI.totalOrders} orders`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <KpiCard
            title="Peak Time"
            value={mockCanteenDashboardKPI.peakMealTime}
            subtitle={`${mockCanteenDashboardKPI.vegetarianPercentage}% vegetarian`}
            icon={<Clock className="w-6 h-6" />}
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meal Plans
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meal Items
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Orders
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Meal Plans Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Plans</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Available meal plans for different dietary needs
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {plan.description}
                      </p>
                    </div>
                    <StatusBadge status={plan.active ? "active" : "inactive"} />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Price
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${plan.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Meals Available
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.mealCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Type
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {plan.dietaryType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Grade
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.gradeLevel}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Meal Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Items</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Available food items with nutritional information
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search meal items..."
                value={mealSearchTerm}
                onChange={(e) => setMealSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredMealItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  calories: item.calories,
                  protein: item.protein,
                  cost: item.cost,
                  availableToday: item.availableToday,
                }))}
                columns={mealColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Meal Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Orders</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Student meal orders and payment status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {mockMealOrders.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {mockMealOrders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Served</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {mockMealOrders.filter((o) => o.status === "served").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${mockMealOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by student name..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={orderStatusFilter}
                onValueChange={(value) =>
                  setOrderStatusFilter(
                    value as "all" | "pending" | "confirmed" | "served" | "cancelled"
                  )
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredOrders}
                columns={orderColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Student Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Student Preferences
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Dietary restrictions and meal preferences
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Preference
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Students</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {mockStudentPreferences.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Dietary Restrictions
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {
                    new Set(
                      mockStudentPreferences
                        .filter((p) => p.dietaryRestriction !== "none")
                        .map((p) => p.dietaryRestriction)
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">With Allergies</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {mockStudentPreferences.filter((p) => p.allergies.length > 0).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Vegetarian</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {
                    mockStudentPreferences.filter(
                      (p) =>
                        p.dietaryRestriction === "vegetarian" ||
                        p.dietaryRestriction === "vegan"
                    ).length
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by student name..."
                value={preferenceSearchTerm}
                onChange={(e) => setPreferenceSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredPreferences.map((pref) => ({
                  id: pref.id,
                  studentName: pref.studentName,
                  class: pref.class,
                  dietaryRestriction: pref.dietaryRestriction,
                  preferredMealPlan: pref.preferredMealPlan,
                  allergies: pref.allergies,
                }))}
                columns={preferenceColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
