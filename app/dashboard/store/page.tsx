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
import { Checkbox } from "@/components/ui/checkbox";
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
  Power,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/lib/auth-context";
import { useModulePermissions } from "@/hooks/use-module-permissions";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Swal from "sweetalert2";

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
  selling_price: string;
  lifo_price: string | null;
  is_payable: boolean;
  quantity: number;
  quantity_lost: number;
  store_locations: string[];
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
  unit_symbol: string;
  quantity: number;
  quantity_lost: number;
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

type AccountDetail = {
  id: number;
  user: { id: number; username: string; first_name: string; last_name: string };
  role: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StorePage() {
  const { user } = useAuth();
  const { canManage } = useModulePermissions("store");
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
  const [modalIsPayable, setModalIsPayable] = useState(false);
  const [adjustInventoryProductId, setAdjustInventoryProductId] = useState<number | null>(null);
  const [adjustPhysicalQty, setAdjustPhysicalQty] = useState<string>("");
  const [isCreateInventoryModalOpen, setIsCreateInventoryModalOpen] = useState(false);
  const [createInventoryProductId, setCreateInventoryProductId] = useState<number | null>(null);
  const [createInventoryQty, setCreateInventoryQty] = useState<string>("");
  const [createInventoryPrice, setCreateInventoryPrice] = useState<string>("");
  const [productLocations, setProductLocations] = useState<string[]>([]);

  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [editingDistribution, setEditingDistribution] = useState<Distribution | null>(null);
  const [accounts, setAccounts] = useState<AccountDetail[]>([]);
  const [currentRecipientType, setCurrentRecipientType] = useState("staff");
  const [selectedRecipientId, setSelectedRecipientId] = useState(0);
  const [selectedRecipientName, setSelectedRecipientName] = useState("");
  const [currentBuyerType, setCurrentBuyerType] = useState("student");
  const [selectedBuyerId, setSelectedBuyerId] = useState(0);
  const [selectedBuyerName, setSelectedBuyerName] = useState("");
  const [buyerComboboxOpen, setBuyerComboboxOpen] = useState(false);
  const [recipientComboboxOpen, setRecipientComboboxOpen] = useState(false);
  const [saleSelectedProductId, setSaleSelectedProductId] = useState<number | null>(null);
  const [saleUnitPrice, setSaleUnitPrice] = useState<string>("");
  const [saleQuantity, setSaleQuantity] = useState<number>(1);

  // Filters
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");
  const [inventoryStockFilter, setInventoryStockFilter] = useState<"all" | "low" | "ok">("all");
  const [entrySearch, setEntrySearch] = useState("");
  const [storeProductSearch, setStoreProductSearch] = useState("");
  const [storeProductLocationFilter, setStoreProductLocationFilter] = useState("all");
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

  useEffect(() => {
    if (isDistributionModalOpen || isSaleModalOpen) {
      api.get<any>("users/accounts/")
        .then((res) => setAccounts(Array.isArray(res) ? res : res.results || []))
        .catch(() => toast.error("Failed to load accounts"));
    }
  }, [isDistributionModalOpen, isSaleModalOpen]);

  // ─── CRUD Handlers ────────────────────────────────────────────────────────

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const isPayable = fd.get("is_payable") === "true";
    const data: Record<string, any> = {
      name: fd.get("name"),
      category: parseInt(fd.get("category") as string),
      unit: parseInt(fd.get("unit") as string),
      is_payable: isPayable,
      selling_price: isPayable ? (fd.get("selling_price") || "0") : "0",
      minimum_stock: parseFloat(fd.get("minimum_stock") as string) || 0,
      is_active: fd.get("is_active") === "true",
    };
    try {
      if (editingProduct) {
        await api.put(`store/stock/products/${editingProduct.id}/`, data);
        const existingStoreProducts = storeProducts.filter(sp => sp.product === editingProduct.id);
        const existingLocations = existingStoreProducts.map(sp => sp.store_name);
        const toRemove = existingStoreProducts.filter(sp => !productLocations.includes(sp.store_name));
        const toAdd = productLocations.filter(loc => !existingLocations.includes(loc));
        await Promise.all(toRemove.map(sp => api.delete(`store/stock/store-products/${sp.id}/`)));
        await Promise.all(toAdd.map(loc =>
          api.post("store/stock/store-products/", {
            store_name: loc,
            product: editingProduct.id,
            quantity: 0,
            unit_price: "0",
          })
        ));
        toast.success("Product updated");
      } else {
        const created = await api.post<any>("store/stock/products/", data);
        const productId = created.id || created.data?.id;
        if (productId && productLocations.length > 0) {
          await Promise.all(productLocations.map((loc) =>
            api.post("store/stock/store-products/", {
              store_name: loc,
              product: productId,
              quantity: 0,
              unit_price: "0",
            })
          ));
        }
        toast.success("Product created");
      }
      setIsProductModalOpen(false);
      setProductLocations([]);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    try {
      await api.patch(`store/stock/products/${product.id}/`, { is_active: !product.is_active });
      toast.success(`Product ${product.is_active ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Status update failed");
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

  const handleTogglePaid = async (id: number, current: boolean) => {
    try {
      await api.patch(`store/stock/sales/${id}/`, { is_paid: !current });
      toast.success(`Sale marked as ${!current ? "PAID" : "UNPAID"}`);
      fetchData();
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const handleDeleteSale = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Sale?",
      text: "This will delete the sale and restore inventory.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
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
      recipient_id: parseInt(fd.get("recipient_id") as string) || 1,
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
    const productId = parseInt(fd.get("product") as string);
    const selectedProduct = products.find((p) => p.id === productId);
    const data = {
      product: productId,
      quantity: parseInt(fd.get("quantity") as string),
      unit_price: parseFloat(fd.get("unit_price") as string),
      buyer_name: fd.get("buyer_name"),
      buyer_type: fd.get("buyer_type"),
      buyer_id: parseInt(fd.get("buyer_id") as string) || null,
      is_paid: fd.get("is_paid") === "true",
      notes: fd.get("notes") || null,
    };
    try {
      await api.post("store/stock/sales/", data);
      if (selectedProduct?.is_payable && selectedProduct.selling_price && parseFloat(selectedProduct.selling_price) > 0) {
        toast.success("Vente enregistrée — facture créée", {
          description: `Facture pour ${selectedProduct.name}`,
          action: {
            label: "Voir la facture",
            onClick: () => window.open("/dashboard/finance/invoices", "_blank"),
          },
        });
      } else {
        toast.success("Sale recorded — inventory updated");
      }
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

  const handleCreateInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createInventoryProductId || !createInventoryQty) return;
    const qty = parseFloat(createInventoryQty);
    const price = parseFloat(createInventoryPrice) || 0;
    if (isNaN(qty) || qty <= 0) return;
    try {
      await api.post("store/stock/entries/", {
        product: createInventoryProductId,
        quantity: qty,
        unit_price: price,
        supplier: "Initial stock",
        batch_number: "INIT",
        store_name: "Main store",
      });
      toast.success("Inventory created successfully");
      setIsCreateInventoryModalOpen(false);
      setCreateInventoryProductId(null);
      setCreateInventoryQty("");
      setCreateInventoryPrice("");
      fetchData();
    } catch {
      toast.error("Failed to create inventory");
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inv = inventory.find((i) => i.id === adjustInventoryProductId);
    if (!inv) return;
    const physical = parseFloat(adjustPhysicalQty);
    if (isNaN(physical)) return;
    const diff = physical - inv.quantity;

    try {
      await api.patch(`store/stock/inventory/${inv.id}/`, { quantity: physical });
      toast.success(`Inventory updated — ${diff >= 0 ? `+${diff}` : diff} ${inv.unit_symbol} ${diff >= 0 ? "gain" : "loss"}`);
      setIsAdjustModalOpen(false);
      setAdjustInventoryProductId(null);
      setAdjustPhysicalQty("");
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

  const sellableProducts = useMemo(() => {
    const inStockProductIds = new Set(
      inventory.filter((i) => i.quantity > 0).map((i) => i.product)
    );
    return products.filter(
      (p) => p.is_payable && parseFloat(p.selling_price || "0") > 0 && inStockProductIds.has(p.id)
    );
  }, [products, inventory]);

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

  const storeProductLocations = useMemo(() => {
    return [...new Set(storeProducts.map((sp) => sp.store_name))];
  }, [storeProducts]);

  const productsWithoutInventory = useMemo(() => {
    const inventoryProductIds = new Set(inventory.map((i) => i.product));
    return products.filter((p) => !inventoryProductIds.has(p.id));
  }, [products, inventory]);

  const filteredStoreProducts = useMemo(() => {
    return storeProducts.filter((sp) => {
      if (storeProductLocationFilter !== "all" && sp.store_name !== storeProductLocationFilter) return false;
      if (storeProductSearch && !sp.product_name.toLowerCase().includes(storeProductSearch.toLowerCase()) && !sp.store_name.toLowerCase().includes(storeProductSearch.toLowerCase())) return false;
      return true;
    });
  }, [storeProducts, storeProductSearch, storeProductLocationFilter]);

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
            {canManage && (
              <DropdownMenuItem onClick={() => { setAdjustInventoryProductId(item.id); setAdjustPhysicalQty(String(item.quantity)); setIsAdjustModalOpen(true); }}>
                <Pencil className="w-4 h-4 mr-2" /> Count
              </DropdownMenuItem>
            )}
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
      key: "unit_symbol" as const,
      label: "Unit",
      sortable: true,
      render: (v: string, item: Product) => (
        <span className="text-slate-600 dark:text-slate-300">{item.unit_name} ({v})</span>
      ),
    },
    {
      key: "selling_price" as const,
      label: "Price / Status",
      sortable: true,
      render: (v: string, item: Product) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            item.is_payable
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {item.is_payable ? "Paid" : "Free"}
          </span>
          {item.is_payable && (
            <span className="font-semibold text-slate-900 dark:text-white">
              {parseFloat(v || "0").toLocaleString()} BIF
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lifo_price" as const,
      label: "Purchase Price",
      sortable: true,
      render: (v: string) => (
        <span className="text-slate-600 dark:text-slate-300 font-mono">
          {v ? `${parseFloat(v).toLocaleString()} BIF` : "—"}
        </span>
      ),
    },
    {
      key: "quantity" as const,
      label: "Qty in Stock",
      sortable: true,
      render: (v: number) => <span className="font-medium">{v}</span>,
    },
    {
      key: "quantity_lost" as const,
      label: "Qty Lost",
      sortable: true,
      render: (v: number) => <span className="text-red-500 font-medium">{v}</span>,
    },
    {
      key: "store_locations" as const,
      label: "Location",
      sortable: true,
      render: (v: string[]) => <span className="text-slate-600 dark:text-slate-300">{v.length > 0 ? v.join(", ") : "—"}</span>,
    },
    {
      key: "minimum_stock" as const,
      label: "Min Stock",
      sortable: true,
      render: (v: number, item: Product) => <span className="text-slate-600 dark:text-slate-300">{v} {item.unit_symbol}</span>,
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
            {canManage && (
              <DropdownMenuItem onClick={() => { setEditingProduct(item); setModalIsPayable(item.is_payable); setProductLocations(item.store_locations); setIsProductModalOpen(true); }}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
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
            {canManage && (
              <DropdownMenuItem onClick={() => { setEditingDistribution(item); setIsDistributionModalOpen(true); }}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Status
              </DropdownMenuItem>
            )}
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
      key: "unit_symbol" as const,
      label: "Unit",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-400">{v}</span>,
    },
    {
      key: "quantity" as const,
      label: "Qty in Store",
      sortable: true,
      render: (v: number) => <span className="font-medium">{v}</span>,
    },
    {
      key: "quantity_lost" as const,
      label: "Qty Lost",
      sortable: true,
      render: (v: number) => <span className="text-red-500 font-medium">{v}</span>,
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
            {!item.is_paid && (
              <DropdownMenuItem onClick={() => handlePrintDocument(item, "invoice")}>
                <Printer className="w-4 h-4 mr-2" /> Print Invoice
              </DropdownMenuItem>
            )}
            {item.is_paid && (
              <DropdownMenuItem onClick={() => handlePrintDocument(item, "receipt")}>
                <Printer className="w-4 h-4 mr-2 text-green-600" /> Print Receipt
              </DropdownMenuItem>
            )}
            {canManage && !item.is_paid && (
              <DropdownMenuItem onClick={() => handleTogglePaid(item.id, item.is_paid)}>
                <Check className="w-4 h-4 mr-2 text-green-600" /> Mark as Paid
              </DropdownMenuItem>
            )}
            {canManage && !item.is_paid && (
              <DropdownMenuItem onClick={() => handleDeleteSale(item.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Transaction
              </DropdownMenuItem>
            )}
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
              Products in Stock
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
              {canManage && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingProduct(null); setModalIsPayable(false); setProductLocations([]); setIsProductModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Product
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{products.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Consumable</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{products.filter(p => p.category_type === "consumable" || p.category_type === "vivre").length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Non-consumable</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{products.filter(p => p.category_type === "non_consumable" || p.category_type === "non_vivre").length}</p>
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
              {canManage && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setAdjustInventoryProductId(null); setAdjustPhysicalQty(""); setIsAdjustModalOpen(true); }}>
                    <Package className="w-4 h-4 mr-2" /> Inventory Count
                  </Button>
                  <Button variant="outline" onClick={() => { setIsCreateInventoryModalOpen(true); }} disabled={productsWithoutInventory.length === 0}>
                    <Plus className="w-4 h-4 mr-2" /> New Inventory
                  </Button>
                </div>
              )}
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Products</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Product catalog with categories and units</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={products} columns={productColumns} itemsPerPage={10} searchableColumns={["name", "category_name", "unit_name"]} />
            </div>
          </TabsContent>

          {/* ── Stock Entries Tab ── */}
          <TabsContent value="entries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Entries</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Restocking and supply records</p>
              </div>
              {canManage && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }}>
                  <ArrowUp className="w-4 h-4 mr-2" /> New Entry
                </Button>
              )}
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
              {canManage && (
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsExitModalOpen(true)}>
                  <ArrowDown className="w-4 h-4 mr-2" /> Log Exit
                </Button>
              )}
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
              {canManage && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingDistribution(null); setCurrentRecipientType("staff"); setSelectedRecipientId(0); setSelectedRecipientName(""); setIsDistributionModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Distribution
                </Button>
              )}
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
              {user?.role === "accountant" && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setCurrentBuyerType("student"); setSelectedBuyerId(0); setSelectedBuyerName(""); setSaleSelectedProductId(null); setSaleUnitPrice(""); setSaleQuantity(1); setIsSaleModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Record Sale
                </Button>
              )}
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
                      <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.type === "vivre" ? "Food" : c.type === "non_vivre" ? "Equipment" : c.type === "consumable" ? "Consumable" : "Non-consumable"})</SelectItem>
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
              <Label>Payable Product</Label>
              <Select name="is_payable" defaultValue={String(editingProduct?.is_payable ?? false)} onValueChange={(v) => setModalIsPayable(v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes — payable</SelectItem>
                  <SelectItem value="false">No — free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {modalIsPayable && (
              <div className="space-y-2">
                <Label>Selling Price (BIF)</Label>
                <Input name="selling_price" type="number" step="0.01" defaultValue={editingProduct?.selling_price ?? 0} required />
              </div>
            )}
            <div className="space-y-2">
              <Label>Minimum Stock Level</Label>
              <Input name="minimum_stock" type="number" step="0.1" defaultValue={editingProduct?.minimum_stock ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>Locations</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {locations.filter(l => l.is_active).map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={productLocations.includes(loc.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProductLocations([loc.name]);
                        } else {
                          setProductLocations([]);
                        }
                      }}
                    />
                    {loc.name}
                  </label>
                ))}
                {locations.filter(l => l.is_active).length === 0 && (
                  <p className="text-xs text-slate-500 col-span-2">No active locations</p>
                )}
              </div>
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
                  <Label>Product (non-consumable items only)</Label>
                  <Select name="product">
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.filter((p) => ["non_vivre", "non_consumable"].includes(p.category_type)).map((p) => (
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
                    <Select
                      name="recipient_type"
                      defaultValue="staff"
                      onValueChange={(val) => {
                        setCurrentRecipientType(val);
                        setSelectedRecipientId(0);
                        setSelectedRecipientName("");
                      }}
                    >
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
                {["staff", "student"].includes(currentRecipientType) ? (
                  <div className="space-y-2">
                    <Label>Recipient</Label>
                    <Popover open={recipientComboboxOpen} onOpenChange={setRecipientComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={recipientComboboxOpen} className="w-full justify-between font-normal">
                          {selectedRecipientName || "Search recipient..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search by name..." />
                          <CommandList>
                            <CommandEmpty>No recipient found.</CommandEmpty>
                            <CommandGroup>
                              {accounts
                                .filter((a) =>
                                  currentRecipientType === "staff"
                                    ? !["student", "student_parent", "none"].includes(a.role)
                                    : a.role === "student"
                                )
                                .map((a) => {
                                  const name = [a.user.first_name, a.user.last_name].filter(Boolean).join(" ") || a.user.username;
                                  return (
                                    <CommandItem
                                      key={a.id}
                                      value={name}
                                      onSelect={() => {
                                        setSelectedRecipientId(a.id);
                                        setSelectedRecipientName(name);
                                        setRecipientComboboxOpen(false);
                                      }}
                                    >
                                      <Check className={selectedRecipientId === a.id ? "opacity-100" : "opacity-0"} />
                                      {name}
                                    </CommandItem>
                                  );
                                })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <input type="hidden" name="recipient_id" value={selectedRecipientId} />
                    <input type="hidden" name="recipient_name" value={selectedRecipientName} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <Input name="recipient_name" required />
                  </div>
                )}
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
      <Dialog open={isSaleModalOpen} onOpenChange={(open) => { setIsSaleModalOpen(open); if (!open) { setSaleSelectedProductId(null); setSaleUnitPrice(""); setSaleQuantity(1); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record a Sale</DialogTitle></DialogHeader>
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select name="product" required onValueChange={(val) => {
                const p = sellableProducts.find((x) => x.id === parseInt(val));
                if (p) {
                  setSaleSelectedProductId(p.id);
                  setSaleUnitPrice(p.selling_price);
                  setSaleQuantity(1);
                } else {
                  setSaleSelectedProductId(null);
                  setSaleUnitPrice("");
                  setSaleQuantity(1);
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {sellableProducts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} — {parseFloat(p.selling_price).toLocaleString()} BIF</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" value={saleQuantity} min={1} required
                  onChange={(e) => setSaleQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-2">
                <Label>Unit Sale Price (BIF)</Label>
                <Input name="unit_price" type="number" step="0.01" value={saleUnitPrice} required
                  onChange={(e) => setSaleUnitPrice(e.target.value)}
                  placeholder={saleSelectedProductId ? "" : "Select a product first"} />
              </div>
            </div>
            {saleSelectedProductId && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 text-center">
                <span className="text-sm text-green-700 dark:text-green-300">Total</span>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {(saleQuantity * parseFloat(saleUnitPrice || "0")).toLocaleString()} BIF
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {currentBuyerType === "student" || currentBuyerType === "staff" ? (
                <div className="space-y-2">
                  <Label>Buyer</Label>
                  <Popover open={buyerComboboxOpen} onOpenChange={setBuyerComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={buyerComboboxOpen} className="w-full justify-between font-normal">
                        {selectedBuyerName || "Search buyer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search by name..." />
                        <CommandList>
                          <CommandEmpty>No buyer found.</CommandEmpty>
                          <CommandGroup>
                            {accounts
                              .filter((a) =>
                                currentBuyerType === "staff"
                                  ? !["student", "student_parent", "none"].includes(a.role)
                                  : a.role === "student"
                              )
                              .map((a) => {
                                const name = [a.user.first_name, a.user.last_name].filter(Boolean).join(" ") || a.user.username;
                                return (
                                  <CommandItem
                                    key={a.id}
                                    value={name}
                                    onSelect={() => {
                                      setSelectedBuyerId(a.id);
                                      setSelectedBuyerName(name);
                                      setBuyerComboboxOpen(false);
                                    }}
                                  >
                                    <Check className={selectedBuyerId === a.id ? "opacity-100" : "opacity-0"} />
                                    {name}
                                  </CommandItem>
                                );
                              })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <input type="hidden" name="buyer_id" value={selectedBuyerId} />
                  <input type="hidden" name="buyer_name" value={selectedBuyerName} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Buyer Name</Label>
                  <Input name="buyer_name" placeholder="e.g. John Doe" required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Buyer Type</Label>
                <Select
                  name="buyer_type"
                  defaultValue="student"
                  onValueChange={(val) => {
                    setCurrentBuyerType(val);
                    setSelectedBuyerId(0);
                    setSelectedBuyerName("");
                  }}
                >
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

      {/* Inventory Count Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={(open) => { setIsAdjustModalOpen(open); if (!open) { setAdjustInventoryProductId(null); setAdjustPhysicalQty(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventory Count</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={String(adjustInventoryProductId ?? "")} onValueChange={(val) => { setAdjustInventoryProductId(parseInt(val)); setAdjustPhysicalQty(""); }}>
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {inventory.map((inv) => (
                    <SelectItem key={inv.id} value={String(inv.id)}>
                      {inv.product_name} ({inv.quantity} {inv.unit_symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {adjustInventoryProductId && (() => {
              const inv = inventory.find((i) => i.id === adjustInventoryProductId);
              if (!inv) return null;
              const physical = parseFloat(adjustPhysicalQty);
              const diff = isNaN(physical) ? 0 : physical - inv.quantity;
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Logical (System)</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{inv.quantity} {inv.unit_symbol}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 text-center">
                      <p className="text-xs text-green-600 dark:text-green-400">Physical (Counted)</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">{physical || "—"} {inv.unit_symbol}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physical">Physical Quantity</Label>
                    <Input id="physical" type="number" step="0.01" value={adjustPhysicalQty} onChange={(e) => setAdjustPhysicalQty(e.target.value)} placeholder="Enter counted quantity" required />
                  </div>
                  {adjustPhysicalQty && !isNaN(physical) && diff !== 0 && (
                    <div className={`rounded-lg p-3 text-center ${diff > 0 ? "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}>
                      <p className="text-sm text-muted-foreground">Difference</p>
                      <p className={`text-2xl font-bold ${diff > 0 ? "text-orange-600 dark:text-orange-400" : "text-red-600 dark:text-red-400"}`}>
                        {diff > 0 ? "+" : ""}{diff} {inv.unit_symbol}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{diff > 0 ? "Surplus (gain)" : "Loss"}</p>
                    </div>
                  )}
                </>
              );
            })()}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsAdjustModalOpen(false); setAdjustInventoryProductId(null); setAdjustPhysicalQty(""); }}>Cancel</Button>
              <Button type="submit" disabled={!adjustInventoryProductId || !adjustPhysicalQty} className="bg-slate-900 text-white">Confirm Count</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Inventory Modal */}
      <Dialog open={isCreateInventoryModalOpen} onOpenChange={(open) => { setIsCreateInventoryModalOpen(open); if (!open) { setCreateInventoryProductId(null); setCreateInventoryQty(""); setCreateInventoryPrice(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInventory} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={String(createInventoryProductId ?? "")} onValueChange={(val) => setCreateInventoryProductId(parseInt(val))}>
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {productsWithoutInventory.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.unit_symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productsWithoutInventory.length === 0 && (
                <p className="text-xs text-amber-600">All products already have inventory records.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input type="number" step="0.01" value={createInventoryQty} onChange={(e) => setCreateInventoryQty(e.target.value)} placeholder="e.g. 100" required />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (BIF)</Label>
                <Input type="number" step="0.01" value={createInventoryPrice} onChange={(e) => setCreateInventoryPrice(e.target.value)} placeholder="e.g. 500" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsCreateInventoryModalOpen(false); setCreateInventoryProductId(null); setCreateInventoryQty(""); setCreateInventoryPrice(""); }}>Cancel</Button>
              <Button type="submit" disabled={!createInventoryProductId || !createInventoryQty} className="bg-slate-900 text-white">Add to Inventory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
