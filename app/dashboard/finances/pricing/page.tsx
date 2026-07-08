"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Tag, Search, Save, X, Pencil, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/lib/auth-context";
import { canManage } from "@/lib/access-control";

const FEES_CATEGORIES: Record<number, string> = {
  1: "Registration",
  2: "School",
  3: "Class",
  4: "Transport",
  5: "Restaurant",
  7: "Other",
  8: "DayCare",
  9: "Boarding",
};

export default function PricingPage() {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("7");
  const [newPriority, setNewPriority] = useState("1");
  const [newAssignment, setNewAssignment] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const res = await axiosInstance.get("/finance/fees/");
      const results = res.data?.results || res.data || [];
      return Array.isArray(results) ? results : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const fees = data || [];

  const filtered = fees.filter((f: any) => {
    if (categoryFilter !== "all" && f.fee_category !== parseInt(categoryFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.label?.toLowerCase().includes(q) || f.code?.toLowerCase().includes(q);
    }
    return true;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedFees = filtered.slice((page - 1) * pageSize, page * pageSize);

  const startEditing = (fee: any) => {
    setEditingId(fee.id);
    setEditAmount(fee.amount?.toString() || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const saveAmount = async (id: number) => {
    try {
      await axiosInstance.patch(`/finance/fees/${id}/`, { amount: parseFloat(editAmount) });
      toast({ title: "Price updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setEditingId(null);
    } catch {
      toast({ title: "Failed to update price", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!newLabel || !newAmount) return;
    setIsCreating(true);
    try {
      await axiosInstance.post("/finance/fees/", {
        label: newLabel,
        amount: parseFloat(newAmount),
        fee_category: parseInt(newCategory),
        priority: parseInt(newPriority),
        assignment: newAssignment || undefined,
      });
      toast({ title: "Fee created successfully" });
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setIsCreateOpen(false);
      setNewLabel("");
      setNewAmount("");
      setNewCategory("7");
      setNewPriority("1");
      setNewAssignment("");
    } catch {
      toast({ title: "Failed to create fee", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const headers = ["Code", "Label", "Category", "Amount (BIF)", "Priority"];
    const rows = filtered.map((f: any) => [
      f.code || "",
      f.label || "",
      f.fee_category_name || FEES_CATEGORIES[f.fee_category] || "",
      Number(f.amount).toLocaleString(),
      f.priority_name || `Order ${f.priority}`,
    ]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("EDUCORE - FEE PRICING LIST", 14, 15);
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
    doc.save("pricing-list.pdf");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing</h1>
          <p className="text-muted-foreground mt-1">Manage fees and tariff amounts</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{fees.length} fees configured</span>
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          {canManage(user?.role, "finance") && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Fee
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by label or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(FEES_CATEGORIES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No fees found</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount (BIF)</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFees.map((fee: any) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-mono text-xs">{fee.code}</TableCell>
                      <TableCell className="font-medium">{fee.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fee.fee_category_name || FEES_CATEGORIES[fee.fee_category] || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === fee.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-32 text-right h-8"
                            />
                            {canManage(user?.role, "finance") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => saveAmount(fee.id)}
                                disabled={!editAmount || parseFloat(editAmount) < 0}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-semibold tabular-nums">
                            {Number(fee.amount).toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{fee.priority_name || `Order ${fee.priority}`}</TableCell>
                      <TableCell className="text-right">
                        {canManage(user?.role, "finance") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEditing(fee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                      <Button variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Fee Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Fee</DialogTitle>
            <DialogDescription>Add a new fee or tariff to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label *</label>
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Tuition Fee" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (BIF) *</label>
              <Input type="number" min="0" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEES_CATEGORIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <SelectItem key={p} value={String(p)}>Order {p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment (optional)</label>
              <Input value={newAssignment} onChange={(e) => setNewAssignment(e.target.value)} placeholder="e.g. Primary section" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            {canManage(user?.role, "finance") && (
              <Button onClick={handleCreate} disabled={!newLabel || !newAmount || isCreating}>
                {isCreating ? "Creating..." : "Create Fee"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
