"use client";

import { useState, useMemo, useEffect } from "react";
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
import { api } from "@/lib/api";
import { CreateMealPlanDialog } from "@/components/canteen/create-meal-plan-dialog";
import { CreateFoodItemDialog } from "@/components/canteen/create-food-item-dialog";
import { CreateSubscriptionDialog } from "@/components/canteen/create-subscription-dialog";
import { CreatePreferenceDialog } from "@/components/canteen/create-preference-dialog";
import { CreateStaffAttendanceDialog } from "@/components/canteen/create-staff-attendance-dialog";
import { toast } from "sonner";

type CanteenDashboardKPI = {
  subscriptions: {
    total: number;
    active: number;
    pending: number;
    expired: number;
  };
  meals_today: number;
  meals_served_today: number;
  available_meals: number;
  total_revenue: number | string;
  peak_meal_time: string;
  vegetarian_percentage: number;
  meal_items_available: number;
  average_order_value: number | string;
};

type MealPlan = {
  id: number;
  name: string;
  description: string;
  meals_per_week: number;
  monthly_cost: number | string;
  includes_breakfast: boolean;
  includes_lunch: boolean;
  includes_dinner: boolean;
  meals_composition: string[];
  is_active: boolean;
};

type FoodItem = {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  cost: number;
  is_available: boolean;
};

type Subscription = {
  id: number;
  student_name: string;
  student_enrollment: string;
  meal_plan_detail: { name: string };
  status: string;
  start_date: string;
  total_amount_due: number;
  amount_paid: number;
  is_paid: boolean;
};

type StudentPreference = {
  id: number;
  student_name: string;
  student_class: string;
  dietary_restriction: string;
  meal_plan_name: string;
  allergies: string;
};

type MealType = {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
};

type Meal = {
  id: number;
  date: string;
  description: string;
  quantity_available: number;
  quantity_served: number;
  fees: number | null;
  meal_type_detail: { name: string; start_time: string; end_time: string } | null;
  availability_status: { available: number; total: number; served: number };
};

type Attendance = {
  id: number;
  student_name: string;
  student_enrollment: string;
  staff_name: string | null;
  meal_info: { date: string; meal_type: string; description: string };
  subscription_info: { plan: string; status: string } | null;
  status: string;
  checked_in_at: string;
  notes: string;
};

export default function CanteenPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [dashboardKPI, setDashboardKPI] = useState<CanteenDashboardKPI | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Subscription[]>([]);
  const [preferences, setPreferences] = useState<StudentPreference[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [mealSearchTerm, setMealSearchTerm] = useState("");
  const [preferenceSearchTerm, setPreferenceSearchTerm] = useState("");
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, plansRes, itemsRes, ordersRes, prefsRes, typesRes, mealsRes, attendanceRes] = await Promise.all([
        api.get<CanteenDashboardKPI>("food/dashboard-meal/"),
        api.get<any>("food/meal-plans/"),
        api.get<any>("food/food-items/"),
        api.get<any>("food/subscriptions/"),
        api.get<any>("food/student-preferences/"),
        api.get<any>("food/meal-types/"),
        api.get<any>("food/meals/"),
        api.get<any>("food/attendance/"),
      ]);

      setDashboardKPI(kpiRes);
      setMealPlans(Array.isArray(plansRes) ? plansRes : plansRes.results || []);
      setFoodItems(Array.isArray(itemsRes) ? itemsRes : itemsRes.results || []);
      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes.results || []);
      setPreferences(Array.isArray(prefsRes) ? prefsRes : prefsRes.results || []);
      setMealTypes(Array.isArray(typesRes) ? typesRes : typesRes.results || []);
      setMeals(Array.isArray(mealsRes) ? mealsRes : mealsRes.results || []);
      setAttendance(Array.isArray(attendanceRes) ? attendanceRes : attendanceRes.results || []);
    } catch (error) {
      console.error("Error fetching canteen data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter meal orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (orderStatusFilter !== "all" && order.status !== orderStatusFilter)
          return false;
        if (
          orderSearchTerm &&
          !order.student_name.toLowerCase().includes(orderSearchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((order) => ({
        id: order.id,
        studentName: order.student_name,
        class: order.student_enrollment,
        mealPlan: order.meal_plan_detail?.name || "N/A",
        servingDate: order.start_date,
        totalPrice: order.total_amount_due,
        status: order.status,
        paymentStatus: order.is_paid ? "paid" : "pending",
      }));
  }, [orders, orderStatusFilter, orderSearchTerm]);

  // Filter meal items
  const filteredMealItems = useMemo(() => {
    return foodItems.filter((item) =>
      item.name.toLowerCase().includes(mealSearchTerm.toLowerCase())
    );
  }, [foodItems, mealSearchTerm]);

  // Filter preferences
  const filteredPreferences = useMemo(() => {
    return preferences.filter((pref) =>
      pref.student_name.toLowerCase().includes(preferenceSearchTerm.toLowerCase())
    );
  }, [preferences, preferenceSearchTerm]);

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
      render: (value: string) => {
        const statusMap: Record<string, "active" | "inactive"> = {
          pending: "inactive",
          confirmed: "active",
          served: "active",
          cancelled: "inactive",
          active: "active",
          inactive: "inactive",
        };
        const status = statusMap[value?.toLowerCase()] || (value as any);
        return <StatusBadge status={status} />;
      },
    },
    {
      key: "totalPrice" as const,
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          ${Number(value || 0).toFixed(2)}
        </span>
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
        <span className="font-semibold text-slate-900 dark:text-white">
          ${Number(value || 0).toFixed(2)}
        </span>
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
      render: (value: string) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {value || "None"}
        </span>
      ),
    },
  ];

  const mealTypeColumns = [
    {
      key: "name" as const,
      label: "Name",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "start_time" as const,
      label: "Start Time",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "end_time" as const,
      label: "End Time",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
  ];

  const mealScheduleColumns = [
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
      render: (value: string) => <span className="font-medium text-slate-900 dark:text-white">{value}</span>,
    },
    {
      key: "mealTypeName" as const,
      label: "Meal Type",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value || "N/A"}</span>,
    },
    {
      key: "description" as const,
      label: "Description",
      sortable: false,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value || "—"}</span>,
    },
    {
      key: "available" as const,
      label: "Available",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "served" as const,
      label: "Served",
      sortable: true,
      render: (value: number) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
  ];

  const attendanceColumns = [
    {
      key: "studentName" as const,
      label: "Student",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value || "Staff"}</span>
      ),
    },
    {
      key: "enrollment" as const,
      label: "Enrollment",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value || "—"}</span>,
    },
    {
      key: "mealType" as const,
      label: "Meal Type",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "mealDate" as const,
      label: "Date",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusMap: Record<string, "active" | "inactive"> = {
          present: "active",
          absent: "inactive",
        };
        return <StatusBadge status={statusMap[value?.toLowerCase()] || (value as any)} />;
      },
    },
    {
      key: "checkedIn" as const,
      label: "Checked In At",
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-600 dark:text-slate-300">
          {value ? new Date(value).toLocaleTimeString() : "—"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            value={dashboardKPI?.meals_served_today || 0}
            subtitle={`Today - Avg ${Number(dashboardKPI?.average_order_value || 0).toFixed(2)}/order`}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <KpiCard
            title="Items Available"
            value={dashboardKPI?.meal_items_available || 0}
            subtitle={`Current Inventory`}
            icon={<UtensilsCrossed className="w-6 h-6" />}
          />
          <KpiCard
            title="Total Revenue"
            value={`BIF ${Number(dashboardKPI?.total_revenue || 0).toFixed(2)}`}
            subtitle={`${dashboardKPI?.subscriptions?.total || 0} subscriptions`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <KpiCard
            title="Peak Time"
            value={dashboardKPI?.peak_meal_time || "N/A"}
            subtitle={`${dashboardKPI?.vegetarian_percentage || 0}% vegetarian`}
            icon={<Clock className="w-6 h-6" />}
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meal Plans
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meal Items
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="meal-types" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meal Types
            </TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Meals
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Attendance
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
              <CreateMealPlanDialog onSuccess={fetchData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => (
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
                    <StatusBadge status={plan.is_active ? "active" : "inactive"} />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Price
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${Number(plan.monthly_cost || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Meals / Week
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.meals_per_week || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Includes
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {plan.meals_composition?.join(", ") || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground dark:text-slate-400">
                        Status
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.is_active ? "Active" : "Inactive"}
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
              <CreateFoodItemDialog onSuccess={fetchData} />
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
                  availableToday: item.is_available,
                }))}
                columns={mealColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscriptions</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage student meal plan enrollments and billing
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <CreateSubscriptionDialog mealPlans={mealPlans} onSuccess={fetchData} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Subscriptions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {orders.filter((o) => o.is_paid).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${orders.reduce((sum, o) => sum + Number(o.amount_paid || 0), 0).toFixed(2)}
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
              <CreatePreferenceDialog mealPlans={mealPlans} onSuccess={fetchData} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Students</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {preferences.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Dietary Restrictions
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {
                    new Set(
                      preferences
                        .filter((p) => p.dietary_restriction !== "none")
                        .map((p) => p.dietary_restriction)
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">With Allergies</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {preferences.filter((p) => p.allergies && p.allergies.length > 0).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Vegetarian</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {
                    preferences.filter(
                      (p) =>
                        p.dietary_restriction === "vegetarian" ||
                        p.dietary_restriction === "vegan"
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
                  studentName: pref.student_name,
                  class: pref.student_class,
                  dietaryRestriction: pref.dietary_restriction,
                  preferredMealPlan: pref.meal_plan_name,
                  allergies: pref.allergies,
                }))}
                columns={preferenceColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Meal Types Tab */}
          <TabsContent value="meal-types" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Types</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Breakfast, Lunch, Dinner schedules</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={mealTypes.map((t) => ({
                  id: t.id,
                  name: t.name,
                  start_time: t.start_time,
                  end_time: t.end_time,
                }))}
                columns={mealTypeColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meals Schedule</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Daily meal schedule and availability</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Meals</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{meals.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Served</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {meals.reduce((sum, m) => sum + (m.availability_status?.served || 0), 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Still Available</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {meals.reduce((sum, m) => sum + (m.availability_status?.available || 0), 0)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={meals.map((m) => ({
                  id: m.id,
                  date: m.date,
                  mealTypeName: m.meal_type_detail?.name || "N/A",
                  description: m.description,
                  available: m.availability_status?.available ?? 0,
                  served: m.availability_status?.served ?? 0,
                }))}
                columns={mealScheduleColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Attendance</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Student and staff check-in records</p>
              </div>
              <CreateStaffAttendanceDialog meals={meals} onSuccess={fetchData} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Check-ins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{attendance.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {attendance.filter((a) => a.status === "present").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {attendance.filter((a) => a.status === "absent").length}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Search by student name..."
                value={attendanceSearchTerm}
                onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={attendance
                  .filter((a) =>
                    !attendanceSearchTerm ||
                    (a.student_name || "").toLowerCase().includes(attendanceSearchTerm.toLowerCase())
                  )
                  .map((a) => ({
                    id: a.id,
                    studentName: a.student_name,
                    enrollment: a.student_enrollment,
                    mealType: a.meal_info?.meal_type || "N/A",
                    mealDate: a.meal_info?.date || "N/A",
                    status: a.status,
                    checkedIn: a.checked_in_at,
                  }))}
                columns={attendanceColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
