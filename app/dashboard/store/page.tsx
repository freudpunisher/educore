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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  Package,
  Plus,
  AlertTriangle,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Printer,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreDashboard = {
  total_products: number;
  total_inventory_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_entries: number;
  total_exits: number;
  total_distributions: number;
  active_distributions: number;
  total_sales_count: number;
  total_sales_amount: number;
};

type Category = {
  id: number;
  name: string;
  type: "vivre" | "non_vivre";
};

type Unit = {
  id: number;
  name: string;
  symbol: string;
};

type Product = {
  id: number;
  name: string;
  category: number;
  category_name: string;
  category_type: string;
  unit: number;
  unit_name: string;
  unit_symbol: string;
  minimum_stock: number;
  is_active: boolean;
};

type Inventory = {
  id: number;
  product: number;
  product_name: string;
  category_name: string;
  category_type: string;
  unit_symbol: string;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
  is_low_stock: boolean;
};

type StockEntry = {
  id: number;
  product: number;
  product_name: string;
  product_unit: string;
  product_category: string;
  quantity: number;
  unit_price: string;
  supplier: string | null;
  batch_number: string | null;
  expiration_date: string | null;
  date: string;
  store_name: string;
};

type StockExit = {
  id: number;
  product: number;
  product_name: string;
  product_unit: string;
  product_category: string;
  quantity: number;
  reason: "consumption" | "affectation" | "loss";
  reference: string | null;
  date: string;
  store_name: string;
};

type Distribution = {
  id: number;
  product: number;
  product_name: string;
  unit_symbol: string;
  quantity: number;
  recipient_type: string;
  recipient_name: string;
  distribution_date: string;
  status: "active" | "returned" | "damaged";
  notes: string | null;
  expected_return_date: string | null;
  assigned_by_name: string | null;
};

type StoreProduct = {
  id: number;
  store_name: string;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
};

type StoreLocation = {
  id: number;
  name: string;
  is_active: boolean;
};

type ProductSale = {
  id: number;
  reference: string;
  is_paid: boolean;
  product: number;
  product_name: string;
  unit_symbol: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  buyer_name: string;
  buyer_type: "student" | "staff" | "other";
  date: string;
  notes: string | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [dashboard, setDashboard] = useState<StoreDashboard | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [exits, setExits] = useState<StockExit[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isStoreProductModalOpen, setIsStoreProductModalOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Edit states
  const [adjustingInventory, setAdjustingInventory] = useState<Inventory | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [editingDistribution, setEditingDistribution] = useState<Distribution | null>(null);

  // Filters
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");
  const [inventoryStockFilter, setInventoryStockFilter] = useState<"all" | "low" | "ok">("all");
  const [entrySearch, setEntrySearch] = useState("");
  const [exitSearch, setExitSearch] = useState("");
  const [exitReasonFilter, setExitReasonFilter] = useState<"all" | "consumption" | "affectation" | "loss">("all");
  const [distributionStatusFilter, setDistributionStatusFilter] = useState<"all" | "active" | "returned" | "damaged">("all");
  const [saleSearch, setSaleSearch] = useState("");
  const [saleBuyerTypeFilter, setSaleBuyerTypeFilter] = useState<"all" | "student" | "staff" | "other">("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, invRes, entriesRes, exitsRes, distRes, salesRes, storeProdRes, prodRes, catRes, unitRes, locRes] = await Promise.all([
        api.get<StoreDashboard>("store/stock/dashboard/"),
        api.get<any>("store/stock/inventory/"),
        api.get<any>("store/stock/entries/"),
        api.get<any>("store/stock/exits/"),
        api.get<any>("store/stock/non-vivres/"),
        api.get<any>("store/stock/sales/"),
        api.get<any>("store/stock/store-products/"),
        api.get<any>("store/stock/products/"),
        api.get<any>("store/stock/categories/"),
        api.get<any>("store/stock/units/"),
        api.get<any>("store/stock/locations/"),
      ]);

      setDashboard(dashRes);
      setInventory(Array.isArray(invRes) ? invRes : invRes.results || []);
      setEntries(Array.isArray(entriesRes) ? entriesRes : entriesRes.results || []);
      setExits(Array.isArray(exitsRes) ? exitsRes : exitsRes.results || []);
      setDistributions(Array.isArray(distRes) ? distRes : distRes.results || []);
      setSales(Array.isArray(salesRes) ? salesRes : salesRes.results || []);
      setStoreProducts(Array.isArray(storeProdRes) ? storeProdRes : storeProdRes.results || []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.results || []);
      setCategories(Array.isArray(catRes) ? catRes : catRes.results || []);
      setUnits(Array.isArray(unitRes) ? unitRes : unitRes.results || []);
      setLocations(Array.isArray(locRes) ? locRes : locRes.results || []);
    } catch (error) {
      console.error("Error loading store data:", error);
      toast.error("Failed to load store data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── CRUD Handlers ────────────────────────────────────────────────────────

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name"),
      category: parseInt(fd.get("category") as string),
      unit: parseInt(fd.get("unit") as string),
      minimum_stock: parseFloat(fd.get("minimum_stock") as string) || 0,
      is_active: fd.get("is_active") === "true",
    };
    try {
      if (editingProduct) {
        await api.put(`store/stock/products/${editingProduct.id}/`, data);
        toast.success("Product updated");
      } else {
        await api.post("store/stock/products/", data);
        toast.success("Product created");
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`store/stock/products/${id}/`);
      toast.success("Product deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      store_name: fd.get("store_name") || "Main Store",
      product: parseInt(fd.get("product") as string),
      quantity: parseFloat(fd.get("quantity") as string),
      unit_price: parseFloat(fd.get("unit_price") as string),
      supplier: fd.get("supplier") || null,
      batch_number: fd.get("batch_number") || null,
      expiration_date: fd.get("expiration_date") || null,
    };
    try {
      await api.post("store/stock/entries/", data);
      toast.success("Stock entry recorded — inventory updated");
      setIsEntryModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleExitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      store_name: fd.get("store_name") || "Main Store",
      product: parseInt(fd.get("product") as string),
      quantity: parseFloat(fd.get("quantity") as string),
      reason: fd.get("reason"),
      reference: fd.get("reference") || null,
    };
    try {
      await api.post("store/stock/exits/", data);
      toast.success("Stock exit recorded — inventory updated");
      setIsExitModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm("Are you sure? This will delete the sale and RESTORE inventory.")) return;
    try {
      await api.delete(`store/stock/sales/${id}/`);
      toast.success("Sale deleted — inventory restored");
      fetchData();
    } catch {
      toast.error("Deletion failed");
    }
  };

  const handleDistributionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      product: parseInt(fd.get("product") as string),
      quantity: parseInt(fd.get("quantity") as string),
      recipient_type: fd.get("recipient_type"),
      recipient_id: 1, // placeholder
      recipient_name: fd.get("recipient_name"),
      status: fd.get("status") || "active",
      notes: fd.get("notes") || null,
      expected_return_date: fd.get("expected_return_date") || null,
    };
    try {
      if (editingDistribution) {
        await api.patch(`store/stock/non-vivres/${editingDistribution.id}/`, { status: fd.get("status") });
        toast.success("Distribution updated");
      } else {
        await api.post("store/stock/non-vivres/", data);
        toast.success("Distribution recorded");
      }
      setIsDistributionModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleStoreProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      store_name: fd.get("store_name"),
      product: parseInt(fd.get("product") as string),
      quantity: parseFloat(fd.get("quantity") as string),
      unit_price: parseFloat(fd.get("unit_price") as string),
    };
    try {
      await api.post("store/stock/store-products/", data);
      toast.success("Store stock added successfully");
      setIsStoreProductModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      product: parseInt(fd.get("product") as string),
      quantity: parseInt(fd.get("quantity") as string),
      unit_price: parseFloat(fd.get("unit_price") as string),
      buyer_name: fd.get("buyer_name"),
      buyer_type: fd.get("buyer_type"),
      is_paid: fd.get("is_paid") === "true",
      notes: fd.get("notes") || null,
    };
    try {
      await api.post("store/stock/sales/", data);
      toast.success("Sale recorded — inventory updated");
      setIsSaleModalOpen(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handlePrintDocument = (sale: ProductSale, type: "invoice" | "receipt") => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${type === 'receipt' ? 'Receipt' : 'Invoice'} - ${sale.reference}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; margin: 0; color: #1e293b; max-width: 800px; margin: auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; color: ${type === 'receipt' ? '#16a34a' : '#0f172a'}; text-transform: uppercase; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .label { color: #64748b; font-weight: 500; font-size: 14px; }
            .value { font-weight: 600; font-size: 15px; text-transform: capitalize; }
            .divider { border-top: 1px solid #e2e8f0; margin: 20px 0; }
            .total { font-size: 18px; color: #0f172a; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { color: #64748b; font-size: 13px; text-transform: uppercase; }
            .footer { margin-top: 60px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${type === 'receipt' ? 'PAYMENT RECEIPT' : 'INVOICE'}</h1>
            <div style="color: #64748b; font-size: 14px;">Reference: ${sale.reference || '#' + sale.id}</div>
            <div style="color: #64748b; font-size: 14px;">Date: ${new Date(sale.date).toLocaleString('en-GB')}</div>
          </div>
          
          <div class="row">
            <span class="label">Billed To:</span>
            <span class="value">${sale.buyer_name} (${sale.buyer_type})</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="value" style="color: ${sale.is_paid ? '#16a34a' : '#ef4444'};">${sale.is_paid ? 'PAID' : 'UNPAID'}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${sale.product_name}</td>
                <td>${sale.quantity} ${sale.unit_symbol}</td>
                <td>${parseFloat(sale.unit_price).toLocaleString()} BIF</td>
                <td style="text-align: right; font-weight: 600;">${parseFloat(sale.total_price).toLocaleString()} BIF</td>
              </tr>
            </tbody>
          </table>

          <div class="divider"></div>
          
          <div class="row total">
            <span>Amount ${type === 'receipt' ? 'Paid' : 'Due'}:</span>
            <span>${parseFloat(sale.total_price).toLocaleString()} BIF</span>
          </div>

          <div class="footer">
            <p>EduCore Store & Logistics Management System</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAdjustSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustingInventory) return;
    const formData = new FormData(e.currentTarget);
    const quantity = parseFloat(formData.get("quantity") as string);
    
    try {
      await api.patch(`store/stock/inventory/${adjustingInventory.id}/`, { quantity });
      toast.success("Inventory adjusted successfully");
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to adjust inventory");
    }
  };

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (inventoryCategoryFilter !== "all" && item.category_name !== inventoryCategoryFilter) return false;
      if (inventoryStockFilter === "low" && !item.is_low_stock) return false;
      if (inventoryStockFilter === "ok" && item.is_low_stock) return false;
      if (inventorySearch && !item.product_name.toLowerCase().includes(inventorySearch.toLowerCase())) return false;
      return true;
    });
  }, [inventory, inventorySearch, inventoryCategoryFilter, inventoryStockFilter]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (entrySearch && !e.product_name?.toLowerCase().includes(entrySearch.toLowerCase())) return false;
      return true;
    });
  }, [entries, entrySearch]);

  const filteredExits = useMemo(() => {
    return exits.filter((e) => {
      if (exitReasonFilter !== "all" && e.reason !== exitReasonFilter) return false;
      if (exitSearch && !e.product_name?.toLowerCase().includes(exitSearch.toLowerCase())) return false;
      return true;
    });
  }, [exits, exitReasonFilter, exitSearch]);

  const filteredDistributions = useMemo(() => {
    return distributions.filter((d) => {
      if (distributionStatusFilter !== "all" && d.status !== distributionStatusFilter) return false;
      return true;
    });
  }, [distributions, distributionStatusFilter]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (saleBuyerTypeFilter !== "all" && s.buyer_type !== saleBuyerTypeFilter) return false;
      if (saleSearch && !(
        s.buyer_name.toLowerCase().includes(saleSearch.toLowerCase()) ||
        s.product_name.toLowerCase().includes(saleSearch.toLowerCase())
      )) return false;
      return true;
    });
  }, [sales, saleSearch, saleBuyerTypeFilter]);

  // ─── Columns ──────────────────────────────────────────────────────────────

  const inventoryColumns = [
    {
      key: "product_name" as const,
      label: "Product",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "category_name" as const,
      label: "Category",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300 capitalize">{v || "—"}</span>,
    },
    {
      key: "quantity" as const,
      label: "Stock",
      sortable: true,
      render: (v: number, item: Inventory) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">{v} {item.unit_symbol}</span>
          {item.is_low_stock && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" /> Low stock
            </div>
          )}
        </div>
      ),
    },
    {
      key: "minimum_stock" as const,
      label: "Min Stock",
      sortable: true,
      render: (v: number, item: Inventory) => <span className="text-slate-600 dark:text-slate-300">{v} {item.unit_symbol}</span>,
    },
    {
      key: "is_low_stock" as const,
      label: "Status",
      sortable: true,
      render: (v: boolean) => <StatusBadge status={v ? "inactive" : "active"} />,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Inventory) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setAdjustingInventory(item); setIsAdjustModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Adjust Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const productColumns = [
    {
      key: "name" as const,
      label: "Product Name",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "category_name" as const,
      label: "Category",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "category_type" as const,
      label: "Type",
      sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${v === "vivre"
          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
          : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
          }`}>
          {v === "vivre" ? "Food" : "Equipment"}
        </span>
      ),
    },
    {
      key: "unit_symbol" as const,
      label: "Unit",
      sortable: true,
      render: (v: string, item: Product) => (
        <span className="text-slate-600 dark:text-slate-300">{item.unit_name} ({v})</span>
      ),
    },
    {
      key: "minimum_stock" as const,
      label: "Min Stock",
      sortable: true,
      render: (v: number, item: Product) => <span className="text-slate-600 dark:text-slate-300">{v} {item.unit_symbol}</span>,
    },
    {
      key: "is_active" as const,
      label: "Status",
      sortable: true,
      render: (v: boolean) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingProduct(item); setIsProductModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const entryColumns = [
    {
      key: "product_name" as const,
      label: "Product",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "quantity" as const,
      label: "Quantity",
      sortable: true,
      render: (v: number, item: StockEntry) => <span className="font-semibold text-green-600 dark:text-green-400">+{v} {item.product_unit}</span>,
    },
    {
      key: "unit_price" as const,
      label: "Unit Price",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{parseFloat(v).toFixed(2)}</span>,
    },
    {
      key: "supplier" as const,
      label: "Supplier",
      sortable: false,
      render: (v: string | null) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v ? new Date(v).toLocaleDateString("en-GB") : "—"}</span>,
    },
  ];

  const exitColumns = [
    {
      key: "product_name" as const,
      label: "Product",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "quantity" as const,
      label: "Quantity",
      sortable: true,
      render: (v: number, item: StockExit) => <span className="font-semibold text-red-600 dark:text-red-400">-{v} {item.product_unit}</span>,
    },
    {
      key: "reason" as const,
      label: "Reason",
      sortable: true,
      render: (v: string) => {
        const colors: Record<string, string> = {
          consumption: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
          affectation: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
          loss: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${colors[v] || ""}`}>{v}</span>;
      },
    },
    {
      key: "reference" as const,
      label: "Reference",
      sortable: false,
      render: (v: string | null) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v ? new Date(v).toLocaleDateString("en-GB") : "—"}</span>,
    },
  ];

  const distributionColumns = [
    {
      key: "product_name" as const,
      label: "Item",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "recipient_name" as const,
      label: "Recipient",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v}</span>,
    },
    {
      key: "recipient_type" as const,
      label: "Type",
      sortable: true,
      render: (v: string) => <span className="capitalize text-slate-600 dark:text-slate-300">{v}</span>,
    },
    {
      key: "quantity" as const,
      label: "Qty",
      sortable: true,
      render: (v: number, item: Distribution) => <span className="font-semibold text-slate-900 dark:text-white">{v} {item.unit_symbol}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (v: string) => {
        const colors: Record<string, string> = {
          active: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
          returned: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
          damaged: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${colors[v] || ""}`}>{v}</span>;
      },
    },
    {
      key: "distribution_date" as const,
      label: "Date",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v ? new Date(v).toLocaleDateString("en-GB") : "—"}</span>,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Distribution) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingDistribution(item); setIsDistributionModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const storeProductColumns = [
    {
      key: "store_name" as const,
      label: "Location",
      sortable: true,
      render: (v: string) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>,
    },
    {
      key: "product_name" as const,
      label: "Product",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "quantity" as const,
      label: "Quantity",
      sortable: true,
      render: (v: number) => <span className="font-medium">{v}</span>,
    },
    {
      key: "unit_price" as const,
      label: "Unit Price",
      sortable: true,
      render: (v: string) => <span className="text-green-600 dark:text-green-400 font-medium">{parseFloat(v).toLocaleString()} BIF</span>,
    },
  ];

  const saleColumns = [
    {
      key: "reference" as const,
      label: "Reference",
      sortable: true,
      render: (v: string) => <span className="font-semibold text-slate-700 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "product_name" as const,
      label: "Product",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "buyer_name" as const,
      label: "Buyer",
      sortable: true,
      render: (v: string, item: ProductSale) => (
        <div>
          <span className="text-slate-900 dark:text-white">{v}</span>
          <div className="text-xs text-muted-foreground capitalize">{item.buyer_type}</div>
        </div>
      ),
    },
    {
      key: "quantity" as const,
      label: "Qty",
      sortable: true,
      render: (v: number, item: ProductSale) => <span className="font-medium">{v} {item.unit_symbol}</span>,
    },
    {
      key: "total_price" as const,
      label: "Total Amount",
      sortable: true,
      render: (v: string) => <span className="font-bold text-green-600 dark:text-green-400">{parseFloat(v).toLocaleString()} BIF</span>,
    },
    {
      key: "is_paid" as const,
      label: "Status",
      sortable: true,
      render: (v: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${v ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
          {v ? 'PAID' : 'UNPAID'}
        </span>
      ),
    },
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{new Date(v).toLocaleDateString("en-GB")}</span>,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: ProductSale) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePrintDocument(item, "invoice")}>
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
            </DropdownMenuItem>
            {item.is_paid && (
              <DropdownMenuItem onClick={() => handlePrintDocument(item, "receipt")}>
                <Printer className="w-4 h-4 mr-2 text-green-600" /> Print Receipt
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDeleteSale(item.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const categoryNames = [...new Set(inventory.map((i) => i.category_name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="space-y-6 p-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            Store & Logistics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage inventory, stock movements, equipment distributions and sales
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Products"
            value={dashboard?.total_products ?? 0}
            subtitle={`${dashboard?.total_inventory_items ?? 0} inventory items`}
            icon={<Package className="w-6 h-6" />}
          />
          <KpiCard
            title="Low Stock"
            value={dashboard?.low_stock_count ?? 0}
            subtitle={`${dashboard?.out_of_stock_count ?? 0} out of stock`}
            icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
          />
          <KpiCard
            title="Stock Movements"
            value={(dashboard?.total_entries ?? 0) + (dashboard?.total_exits ?? 0)}
            subtitle={`${dashboard?.total_entries ?? 0} entries / ${dashboard?.total_exits ?? 0} exits`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <KpiCard
            title="Distributions"
            value={dashboard?.total_distributions ?? 0}
            subtitle={`${dashboard?.active_distributions ?? 0} active`}
            icon={<ShoppingBag className="w-6 h-6" />}
          />
          <KpiCard
            title="Total Sales"
            value={`${(dashboard?.total_sales_amount ?? 0).toLocaleString()} BIF`}
            subtitle={`${dashboard?.total_sales_count ?? 0} transactions`}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 gap-1">
            <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Stock Entries
            </TabsTrigger>
            <TabsTrigger value="exits" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Stock Exits
            </TabsTrigger>
            <TabsTrigger value="distributions" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Distributions
            </TabsTrigger>
            <TabsTrigger value="store-products" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Liste des Stocks
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex-1 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-950 text-xs sm:text-sm min-w-[120px]">
              Sales
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ── */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">All products with their category and unit of measure</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Product
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{products.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Food (Vivre)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{products.filter(p => p.category_type === "vivre").length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Equipment (Non-Vivre)</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{products.filter(p => p.category_type === "non_vivre").length}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={products} columns={productColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Inventory Tab ── */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Current stock levels for all products</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Product
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Items</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredInventory.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {filteredInventory.filter((i) => i.is_low_stock).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">OK Stock</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredInventory.filter((i) => !i.is_low_stock).length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search products..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="flex-1"
              />
              <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryNames.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={inventoryStockFilter} onValueChange={(v) => setInventoryStockFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredInventory} columns={inventoryColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Liste des Stocks Tab ── */}
          <TabsContent value="store-products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock List (By Location)</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage local stock by sales points or storage depots</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsStoreProductModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Location Stock
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={storeProducts} columns={storeProductColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Stock Entries Tab ── */}
          <TabsContent value="entries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Entries</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Restocking and supply records</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }}>
                <ArrowUp className="w-4 h-4 mr-2" /> New Entry
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Entries</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredEntries.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Units In</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredEntries.reduce((s, e) => s + e.quantity, 0).toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredEntries.reduce((s, e) => s + (e.quantity * parseFloat(e.unit_price)), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by product..."
                value={entrySearch}
                onChange={(e) => setEntrySearch(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredEntries} columns={entryColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Stock Exits Tab ── */}
          <TabsContent value="exits" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Exits</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Consumption, assignment and loss records</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsExitModalOpen(true)}>
                <ArrowDown className="w-4 h-4 mr-2" /> Log Exit
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Exits</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredExits.length}</p>
              </div>
              {(["consumption", "affectation", "loss"] as const).map((r) => (
                <div key={r} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <p className="text-sm text-muted-foreground dark:text-slate-400 capitalize">{r}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {filteredExits.filter((e) => e.reason === r).length}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by product..."
                value={exitSearch}
                onChange={(e) => setExitSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={exitReasonFilter} onValueChange={(v) => setExitReasonFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="consumption">Consumption</SelectItem>
                  <SelectItem value="affectation">Assignment</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredExits} columns={exitColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Distributions Tab ── */}
          <TabsContent value="distributions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Distributions</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Equipment and supplies assigned to staff, students and departments</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingDistribution(null); setIsDistributionModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Distribution
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredDistributions.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredDistributions.filter((d) => d.status === "active").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Returned</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredDistributions.filter((d) => d.status === "returned").length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={distributionStatusFilter} onValueChange={(v) => setDistributionStatusFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredDistributions} columns={distributionColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Sales Tab ── */}
          <TabsContent value="sales" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Sales</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Record and track sales of uniforms and school items</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsSaleModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Record Sale
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredSales.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredSales.reduce((sum, s) => sum + parseFloat(s.total_price), 0).toLocaleString()} BIF
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Avg. Basket</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredSales.length ? (filteredSales.reduce((sum, s) => sum + parseFloat(s.total_price), 0) / filteredSales.length).toFixed(0) : 0} BIF
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search by buyer or product..."
                value={saleSearch}
                onChange={(e) => setSaleSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={saleBuyerTypeFilter} onValueChange={(v) => setSaleBuyerTypeFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Buyer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyers</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredSales} columns={saleColumns} itemsPerPage={10} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input name="name" defaultValue={editingProduct?.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" defaultValue={editingProduct ? String(editingProduct.category) : undefined}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select name="unit" defaultValue={editingProduct ? String(editingProduct.unit) : undefined}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.symbol})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Stock Level</Label>
              <Input name="minimum_stock" type="number" step="0.1" defaultValue={editingProduct?.minimum_stock ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="is_active" defaultValue={String(editingProduct?.is_active ?? true)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Entry Modal */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select name="product">
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.unit_symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input name="unit_price" type="number" step="0.01" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input name="supplier" placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input name="batch_number" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Input name="expiration_date" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Record Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Exit Modal */}
      <Dialog open={isExitModalOpen} onOpenChange={setIsExitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Stock Exit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExitSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select name="product">
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.unit_symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select name="reason" defaultValue="consumption">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">Consumption</SelectItem>
                    <SelectItem value="affectation">Assignment</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input name="reference" placeholder="Optional" />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">Record Exit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Distribution Modal */}
      <Dialog open={isDistributionModalOpen} onOpenChange={setIsDistributionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDistribution ? "Update Distribution" : "New Distribution"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDistributionSubmit} className="space-y-4">
            {editingDistribution ? (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editingDistribution.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Product (non-food items only)</Label>
                  <Select name="product">
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.filter((p) => p.category_type === "non_vivre").map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" defaultValue={1} min={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <Select name="recipient_type" defaultValue="staff">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipient Name</Label>
                  <Input name="recipient_name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Return</Label>
                    <Input name="expected_return_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input name="notes" placeholder="Optional" />
                  </div>
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="submit">{editingDistribution ? "Update" : "Record Distribution"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sale Modal */}
      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record a Sale</DialogTitle></DialogHeader>
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select name="product" required>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" defaultValue={1} min={1} required />
              </div>
              <div className="space-y-2">
                <Label>Unit Sale Price (BIF)</Label>
                <Input name="unit_price" type="number" step="0.01" placeholder="Selling price" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buyer Name</Label>
                <Input name="buyer_name" placeholder="e.g. Jean Dupont" required />
              </div>
              <div className="space-y-2">
                <Label>Buyer Type</Label>
                <Select name="buyer_type" defaultValue="student">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input name="notes" placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_paid" value="true" defaultChecked className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600" />
                    <span className="text-sm font-medium">Mark as Paid</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full">Record Sale & Print Receipt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Store Product Modal */}
      <Dialog open={isStoreProductModalOpen} onOpenChange={setIsStoreProductModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Local Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStoreProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Store/Depot Name</Label>
              <Select name="store_name" required>
                <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.is_active).map(l => (
                    <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select name="product" required>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" step="0.01" defaultValue={1} required />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (BIF)</Label>
                <Input name="unit_price" type="number" step="0.01" placeholder="Selling price" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full">Save Local Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Inventory Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory: {adjustingInventory?.product_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">New Actual Quantity</Label>
              <div className="flex gap-2 items-center">
                  <Input id="quantity" name="quantity" type="number" step="0.01" defaultValue={adjustingInventory?.quantity} required />
                  <span className="text-sm text-slate-500 whitespace-nowrap">{adjustingInventory?.unit_symbol}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                The current quantity is <strong>{adjustingInventory?.quantity} {adjustingInventory?.unit_symbol}</strong>. <br/>
                Enter a lower number to report a loss, or a higher number to correct an unjustified stock excess.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-slate-900 text-white">Confirm Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
