"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { usePaymentSurpluses, useCancelRefund } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CircleDollarSign, Search, ChevronLeft, ChevronRight, RotateCcw, FileText, XCircle, Wallet, ArrowUpFromLine, ArrowDownToLine, Printer } from "lucide-react";
import { RefundDialog } from "@/components/finances/refund-dialog";
import { toast } from "@/hooks/use-toast";

export default function SurplusesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [selectedSurplus, setSelectedSurplus] = useState<any>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const { data, isLoading } = usePaymentSurpluses({ page, search: search || undefined, academic_year: academicYear || undefined });
  const cancelRefund = useCancelRefund();

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await axiosInstance.get("/academics/years/");
      return (res.data?.results || []) as Array<{ id: number; start_year: number; end_year: number; is_current: boolean; name?: string }>;
    },
    staleTime: 1000 * 60 * 30,
  });

  const surpluses = data?.results || [];
  const totalCount = data?.count || 0;
  const aggregates = data?.aggregates;
  const PAGE_SIZE = 10;

  const handleCancelRefund = async (refundId: number) => {
    if (!confirm("Are you sure you want to cancel this refund?")) return;
    try {
      await cancelRefund.mutateAsync(refundId);
      toast.success("Refund cancelled successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel refund.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 15mm; }
        }
      `}</style>
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Surpluses & Refunds</h1>
          <p className="text-sm text-muted-foreground">Manage overpayments and process refunds</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 no-print">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div id="printable-area">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-dashed border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Summary</span>
        </div>
      </div>
      {aggregates && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Surplus</p>
                <p className="text-2xl font-bold text-emerald-800">{Number(aggregates.total_surplus).toLocaleString()} Fbu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-red-100 text-red-700">
                <ArrowUpFromLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">Refunded</p>
                <p className="text-2xl font-bold text-red-800">{Number(aggregates.total_refunded).toLocaleString()} Fbu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                <ArrowDownToLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Remaining</p>
                <p className="text-2xl font-bold text-amber-800">{Number(aggregates.remaining).toLocaleString()} Fbu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative no-print">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-dashed border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Filters</span>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap no-print">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or invoice..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={academicYear} onValueChange={(v) => { setAcademicYear(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-52 h-11">
            <SelectValue placeholder="All academic years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All academic years</SelectItem>
            {yearsData?.map((y) => (
              <SelectItem key={y.id} value={y.id.toString()}>
                {y.name || `${y.start_year}/${y.end_year}`} {y.is_current ? "(Current)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative no-print">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-dashed border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">List</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : surpluses.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <CircleDollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No payment surpluses found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Total Surplus</TableHead>
                  <TableHead className="text-right">Refunded</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surpluses.map((surplus: any) => (
                  <TableRow key={surplus.id} className="group">
                    <TableCell className="font-medium">{surplus.student_name}</TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{surplus.invoice_reference}</code>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {Number(surplus.total_surplus).toLocaleString()} Fbu
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {Number(surplus.refunded_amount).toLocaleString()} Fbu
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-600">
                      {Number(surplus.remaining).toLocaleString()} Fbu
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{surplus.refunds_count || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Number(surplus.remaining) > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => { setSelectedSurplus(surplus); setRefundDialogOpen(true); }}
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Refund
                          </Button>
                        )}
                        {surplus.refunds?.length > 0 && (
                          <details className="relative">
                            <summary className="text-xs text-muted-foreground cursor-pointer list-none flex items-center gap-1 px-2 py-1 rounded hover:bg-muted">
                              <FileText className="h-3 w-3" /> History
                            </summary>
                            <div className="absolute right-0 top-full mt-1 z-10 w-80 bg-popover border rounded-lg shadow-lg p-3 space-y-2">
                              {surplus.refunds.map((r: any) => (
                                <div key={r.id} className="text-xs border-b pb-2 last:border-0">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-red-600">-{Number(r.amount).toLocaleString()} Fbu</span>
                                    <Badge variant={r.cancelled_at ? "destructive" : "default"} className="text-[10px]">
                                      {r.cancelled_at ? "Cancelled" : "Active"}
                                    </Badge>
                                  </div>
                                  <div className="text-muted-foreground mt-1">
                                    {r.refund_mode_name} — {r.created_by_name || "—"}
                                  </div>
                                  {r.observations && (
                                    <div className="text-muted-foreground italic mt-1">&ldquo;{r.observations}&rdquo;</div>
                                  )}
                                  {!r.cancelled_at && (
                                    <button
                                      onClick={() => handleCancelRefund(r.id)}
                                      className="text-destructive hover:text-destructive/80 mt-1 flex items-center gap-1 text-[10px]"
                                    >
                                      <XCircle className="h-3 w-3" /> Cancel
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground no-print">
        <div>
          Showing {surpluses.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to{" "}
          {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * PAGE_SIZE >= totalCount || isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedSurplus && (
        <div className="no-print">
          <RefundDialog
            surplusId={selectedSurplus.id}
            surplusRemaining={selectedSurplus.remaining}
            studentName={selectedSurplus.student_name}
            invoiceRef={selectedSurplus.invoice_reference}
            open={refundDialogOpen}
            onOpenChange={setRefundDialogOpen}
          />
        </div>
      )}
    </div>
  );
}
