"use client";

import { useState, useEffect, useMemo } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCcw,
  Boxes,
  Truck,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";

type Category = { id: number; name: string; type: string };
type Unit = { id: number; name: string; symbol: string };
type Product = { id: number; name: string; category_name: string; unit: number; minimum_stock: number; is_active: boolean };
type InventoryData = { id: number; product_name: string; quantity: number };
type StockEntry = { id: number; store_name: string; product: number; quantity: number; unit_price: string; supplier: string; batch_number: string; expiration_date: string; date: string };
type StockExit = { id: number; store_name: string; product: number; quantity: number; reason: string; reference: string; date: string };
type Distribution = { id: number; product_name: string; category_type: string; quantity: number; recipient_type: string; recipient_name: string; distribution_date: string; status: string };

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [exits, setExits] = useState<StockExit[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);

  // Search terms
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, unitRes, prodRes, invRes, entRes, exitRes, distRes] = await Promise.all([
        api.get<any>("store/categories/"),
        api.get<any>("store/units/"),
        api.get<any>("store/products/"),
        api.get<any>("store/inventory/"),
        api.get<any>("store/entries/"),
        api.get<any>("store/exits/"),
        api.get<any>("store/non-vivres/"),
      ]);

      setCategories(Array.isArray(catRes) ? catRes : catRes.results || []);
      setUnits(Array.isArray(unitRes) ? unitRes : unitRes.results || []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.results || []);
      setInventory(Array.isArray(invRes) ? invRes : invRes.results || []);
      setEntries(Array.isArray(entRes) ? entRes : entRes.results || []);
      setExits(Array.isArray(exitRes) ? exitRes : exitRes.results || []);
      setDistributions(Array.isArray(distRes) ? distRes : distRes.results || []);
    } catch (error) {
      console.error("Error fetching logistics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lowStockCount = useMemo(() => {
    return inventory.filter(inv => {
      const prod = products.find(p => p.name === inv.product_name);
      return prod ? inv.quantity <= prod.minimum_stock : false;
    }).length;
  }, [inventory, products]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
  const filteredInventory = inventory.filter(i => i.product_name.toLowerCase().includes(inventorySearchTerm.toLowerCase()));

  const productColumns = [
    { key: "name" as const, label: "Name", sortable: true, render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span> },
    { key: "category_name" as const, label: "Category", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "N/A"}</span> },
    { key: "minimum_stock" as const, label: "Min Stock", sortable: true, render: (v: number) => <span className="text-slate-600 dark:text-slate-300">{v}</span> },
    { key: "is_active" as const, label: "Active", sortable: true, render: (v: boolean) => <StatusBadge status={v ? "active" : "inactive"} /> },
  ];

  const inventoryColumns = [
    { key: "product_name" as const, label: "Product", sortable: true, render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span> },
    { key: "quantity" as const, label: "Current Quantity", sortable: true, render: (v: number) => <span className="text-slate-600 dark:text-slate-300">{v}</span> },
    { key: "status" as const, label: "Status", sortable: true, render: (v: string) => <StatusBadge status={v as any} /> }
  ];

  const entryColumns = [
    { key: "productName" as const, label: "Product", sortable: true, render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "N/A"}</span> },
    { key: "quantity" as const, label: "Qty Added", sortable: true, render: (v: number) => <span className="text-green-600 font-semibold">+{v}</span> },
    { key: "supplier" as const, label: "Supplier", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "N/A"}</span> },
    { key: "date" as const, label: "Date", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{new Date(v).toLocaleDateString()}</span> },
  ];

  const exitColumns = [
    { key: "productName" as const, label: "Product", sortable: true, render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "N/A"}</span> },
    { key: "quantity" as const, label: "Qty Removed", sortable: true, render: (v: number) => <span className="text-red-600 font-semibold">-{v}</span> },
    { key: "reason" as const, label: "Reason", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300 capitalize">{v}</span> },
    { key: "date" as const, label: "Date", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{new Date(v).toLocaleDateString()}</span> },
  ];

  const distributionColumns = [
    { key: "product_name" as const, label: "Product", sortable: true, render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span> },
    { key: "quantity" as const, label: "Qty Form", sortable: true, render: (v: number) => <span className="text-slate-600 dark:text-slate-300">{v}</span> },
    { key: "recipient_name" as const, label: "Recipient", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v}</span> },
    { key: "recipient_type" as const, label: "Type", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300 capitalize">{v}</span> },
    { key: "status" as const, label: "Status", sortable: true, render: (v: string) => <StatusBadge status={v === "returned" ? "inactive" : v === "damaged" ? "maintenance" : "active"} /> },
    { key: "distribution_date" as const, label: "Date", sortable: true, render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{new Date(v).toLocaleDateString()}</span> },
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
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 rounded-xl shadow-lg">
              <Boxes className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            School Store & Logistics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage inventory, stock movements, and distributions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Products" value={products.length} subtitle="Registered catalog" icon={<Package className="w-6 h-6" />} />
          <KpiCard title="Items in Stock" value={inventory.length} subtitle="Current inventory lines" icon={<Boxes className="w-6 h-6" />} />
          <KpiCard title="Low Stock Alerts" value={lowStockCount} subtitle="Requires attention" icon={<AlertTriangle className={`w-6 h-6 ${lowStockCount > 0 ? "text-red-500" : ""}`} />} />
          <KpiCard title="Recent Movements" value={entries.length + exits.length} subtitle="Total entries and exits" icon={<RefreshCcw className="w-6 h-6" />} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="articles" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-950">
              Articles
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-950">
              État Stock
            </TabsTrigger>
            <TabsTrigger value="movements" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-950">
              Mouvements
            </TabsTrigger>
            <TabsTrigger value="distribution" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-950">
              Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Articles Directory</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage catalog: Categories, Units, and Products</p>
              </div>
              <Button variant="default" className="gap-2">
                <Plus className="w-4 h-4" /> Add Article
              </Button>
            </div>
            <div className="flex gap-4">
              <Input placeholder="Search article..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredProducts} columns={productColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">État Stock</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Current inventory levels and stock status</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Input placeholder="Search inventory..." value={inventorySearchTerm} onChange={e => setInventorySearchTerm(e.target.value)} className="max-w-sm" />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable
                data={filteredInventory.map(inv => {
                  const prod = products.find(p => p.name === inv.product_name);
                  const isLow = prod ? inv.quantity <= prod.minimum_stock : false;
                  return {
                    ...inv,
                    status: isLow ? "maintenance" : "active"
                  };
                })}
                columns={inventoryColumns}
                itemsPerPage={10}
              />
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mouvements Stock</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Stock entries and exits history</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 text-green-600"><ArrowDownToLine className="w-4 h-4" /> Add Entry</Button>
                <Button variant="outline" className="gap-2 text-red-600"><ArrowUpFromLine className="w-4 h-4" /> Add Exit</Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Entries (Entrées)</h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <DataTable
                    data={entries.map(e => ({
                      ...e,
                      productName: products.find(p => p.id === e.product)?.name || e.product
                    }))}
                    columns={entryColumns}
                    itemsPerPage={5}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Exits (Sorties)</h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <DataTable
                    data={exits.map(e => ({
                      ...e,
                      productName: products.find(p => p.id === e.product)?.name || e.product
                    }))}
                    columns={exitColumns}
                    itemsPerPage={5}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Non-Vivre Distribution</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Equipment distributed to staff and students</p>
              </div>
              <Button variant="default" className="gap-2">
                <Plus className="w-4 h-4" /> New Distribution
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={distributions} columns={distributionColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
