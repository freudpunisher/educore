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
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  Package,
  Plus,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  mockStoreItems,
  mockStudentPurchases,
  mockStoreTransactions,
  mockSuppliers,
  mockStoreDashboardKPI,
} from "@/lib/mock/store";

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState("");
  const [purchasePaymentFilter, setPurchasePaymentFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    "all" | "sale" | "restock" | "adjustment" | "damage"
  >("all");
  const [supplierStatusFilter, setSupplierStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Filter inventory items
  const filteredInventory = useMemo(() => {
    return mockStoreItems
      .filter((item) => {
        if (categoryFilter !== "all" && item.category !== categoryFilter)
          return false;
        if (
          inventorySearchTerm &&
          !item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        minStockLevel: item.minStockLevel,
        supplier: item.supplier,
      }));
  }, [inventorySearchTerm, categoryFilter]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return mockStudentPurchases
      .filter((purchase) => {
        if (
          purchasePaymentFilter !== "all" &&
          purchase.paymentStatus !== purchasePaymentFilter
        )
          return false;
        if (
          purchaseSearchTerm &&
          !purchase.studentName
            .toLowerCase()
            .includes(purchaseSearchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((purchase) => ({
        id: purchase.id,
        studentName: purchase.studentName,
        class: purchase.class,
        itemName: purchase.itemName,
        quantity: purchase.quantity,
        totalPrice: purchase.totalPrice,
        purchaseDate: purchase.purchaseDate,
        paymentStatus: purchase.paymentStatus as "paid" | "pending",
      }));
  }, [purchaseSearchTerm, purchasePaymentFilter]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mockStoreTransactions.filter((transaction) => {
      if (transactionTypeFilter !== "all" && transaction.type !== transactionTypeFilter)
        return false;
      return true;
    });
  }, [transactionTypeFilter]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return mockSuppliers.filter((supplier) => {
      if (supplierStatusFilter !== "all" && supplier.status !== supplierStatusFilter)
        return false;
      return true;
    });
  }, [supplierStatusFilter]);

  const inventoryColumns = [
    {
      key: "name" as const,
      label: "Item Name",
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
      key: "quantity" as const,
      label: "Stock",
      sortable: true,
      render: (value: number, item: any) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
          {value < item.minStockLevel && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" />
              Low stock
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price" as const,
      label: "Price",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">${value.toFixed(2)}</span>
      ),
    },
    {
      key: "supplier" as const,
      label: "Supplier",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
  ];

  const purchaseColumns = [
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
      key: "itemName" as const,
      label: "Item",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "quantity" as const,
      label: "Qty",
      sortable: true,
      render: (value: number) => <span className="font-semibold text-slate-900 dark:text-white">{value}</span>,
    },
    {
      key: "totalPrice" as const,
      label: "Total",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900 dark:text-white">${value.toFixed(2)}</span>
      ),
    },
    {
      key: "paymentStatus" as const,
      label: "Payment",
      sortable: false,
      render: (value: "paid" | "pending") => <StatusBadge status={value === "paid" ? "active" : "inactive"} />,
    },
  ];

  const supplierColumns = [
    {
      key: "name" as const,
      label: "Supplier Name",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "category" as const,
      label: "Category",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "contactPerson" as const,
      label: "Contact",
      sortable: true,
      render: (value: string) => <span className="text-slate-600 dark:text-slate-300">{value}</span>,
    },
    {
      key: "email" as const,
      label: "Email",
      sortable: false,
      render: (value: string) => (
        <span className="text-slate-600 dark:text-slate-300 text-sm">{value}</span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: "active" | "inactive") => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="space-y-6 p-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            School Store
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage inventory, sales, suppliers, and student transactions
          </p>
        </div>

        {/* KPI Cards - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Items"
            value={mockStoreDashboardKPI.totalItems}
            subtitle={`${mockStoreDashboardKPI.outOfStockItems} out of stock`}
            icon={<Package className="w-6 h-6" />}
          />
          <KpiCard
            title="Low Stock Items"
            value={mockStoreDashboardKPI.lowStockItems}
            subtitle="Require restocking"
            icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
          />
          <KpiCard
            title="Total Revenue"
            value={`$${mockStoreDashboardKPI.totalRevenue}`}
            subtitle={`${mockStoreDashboardKPI.totalTransactions} transactions`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <KpiCard
            title="Suppliers"
            value={mockStoreDashboardKPI.supplierCount}
            subtitle="Active partnerships"
            icon={<ShoppingBag className="w-6 h-6" />}
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Sales
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-950">
              Suppliers
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Store items and stock levels
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Items</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredInventory.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {filteredInventory.filter((i) => i.quantity < i.minStockLevel).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${filteredInventory.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search items..."
                value={inventorySearchTerm}
                onChange={(e) => setInventorySearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="stationary">Stationary</SelectItem>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredInventory}
                columns={inventoryColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sales</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Student purchases and payment records
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {mockStudentPurchases.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {mockStudentPurchases.filter((p) => p.paymentStatus === "paid").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {mockStudentPurchases.filter((p) => p.paymentStatus === "pending").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${mockStudentPurchases.reduce((sum, p) => sum + p.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by student name..."
                value={purchaseSearchTerm}
                onChange={(e) => setPurchaseSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={purchasePaymentFilter}
                onValueChange={(value) =>
                  setPurchasePaymentFilter(value as "all" | "paid" | "pending")
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredPurchases}
                columns={purchaseColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Transactions
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  All store transactions and inventory movements
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Log Transaction
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {mockStoreTransactions.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Sales</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {mockStoreTransactions.filter((t) => t.type === "sale").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Restock</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {mockStoreTransactions.filter((t) => t.type === "restock").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  ${mockStoreTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select
                value={transactionTypeFilter}
                onValueChange={(value) =>
                  setTransactionTypeFilter(
                    value as "all" | "sale" | "restock" | "adjustment" | "damage"
                  )
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {transaction.itemName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {transaction.notes}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {transaction.type}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {transaction.transactionDate}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        Qty: {transaction.quantity}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        ${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suppliers</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Supplier information and contact details
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <div className="flex gap-4">
              <Select
                value={supplierStatusFilter}
                onValueChange={(value) =>
                  setSupplierStatusFilter(value as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredSuppliers.map((supplier) => ({
                  id: supplier.id,
                  name: supplier.name,
                  category: supplier.category,
                  contactPerson: supplier.contactPerson,
                  email: supplier.email,
                  status: supplier.status as "active" | "inactive",
                }))}
                columns={supplierColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
