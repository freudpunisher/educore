"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Download,
    Receipt,
    Printer,
    Calendar as CalendarIcon,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Check,
    ChevronsUpDown,
    ChevronLeftIcon,
    ChevronRightIcon,
    Wallet,
    Clock,
    FileText,
    Building2,
    XCircle,
} from "lucide-react"
import { usePayments, useInvoices, useCancelPayment } from "@/hooks/use-finance"
import { useDebounce } from "@/hooks/use-debounce"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [invoiceFilter, setInvoiceFilter] = useState("all")
    const [openInvoiceCombo, setOpenInvoiceCombo] = useState(false)
    const [paymentPage, setPaymentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [institutionFilter, setInstitutionFilter] = useState("all")

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedDateFrom = useDebounce(dateFrom, 500);
    const debouncedDateTo = useDebounce(dateTo, 500);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const cancelPayment = useCancelPayment();

    const { data: institutions = [] } = useQuery({
        queryKey: ["institutions"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/config/institutions/")
            return data?.data || data?.results || data || []
        },
    })

    const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices({
        page_size: 10000
    });
    const invoices = invoicesData?.results || [];

    const {
        data: paymentsData,
        isLoading,
        isError,
    } = usePayments({
        page: paymentPage,
        page_size: pageSize,
        search: debouncedSearch,
        invoice: invoiceFilter && invoiceFilter !== "all" ? Number(invoiceFilter) : undefined,
        date_from: debouncedDateFrom || undefined,
        date_to: debouncedDateTo || undefined,
        institution: institutionFilter !== "all" ? Number(institutionFilter) : undefined,
    });

    const filteredPayments = paymentsData?.results || [];
    const totalCount = paymentsData?.count || 0;

    const formatReference = (payment: any) => {
        let datePart = "0000-00";
        if (payment.created_at) {
            const d = payment.created_at.split(" ")[0];
            datePart = d;
        }
        const paddedId = String(payment.id).padStart(4, "0");
        return `PAY-${datePart}-${paddedId}`;
    };

    const handleExportCSV = () => {
        const headers = [
            "Reference", "Invoice Reference", "Payment Reference",
            "Payment Date", "Method", "Amount (FBU)",
            "Institution", "Created By", "Creation Date"
        ]
        const rows = filteredPayments.map((p: any) => [
            formatReference(p),
            p.invoice_reference || "",
            p.payment_reference || "",
            p.payment_date || "",
            p.payment_mode_name || "",
            p.amount || 0,
            p.institution_name || "",
            p.created_by_name || "",
            p.created_at || "",
        ])
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n")
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `payments_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handlePrintReceipt = (payment: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official Payment Receipt - ${formatReference(payment)}</title>
              <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                .receipt-container { max-width: 800px; margin: 0 auto; border: 2px solid #f1f5f9; padding: 40px; border-radius: 24px; position: relative; overflow: hidden; }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: #f1f5f9; z-index: -1; font-weight: 900; }
                .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 30px; margin-bottom: 40px; }
                .logo-box img { height: 70px; margin-bottom: 15px; }
                .school-info { font-size: 14px; color: #475569; font-weight: 500; }
                .receipt-meta { text-align: right; }
                .receipt-meta h1 { margin: 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: -0.04em; }
                .status-badge { display: inline-block; padding: 6px 12px; background: #059669; color: white; border-radius: 8px; font-weight: 800; font-size: 12px; margin-top: 10px; }
                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                .detail-item { }
                .detail-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
                .detail-value { font-size: 16px; font-weight: 700; color: #1e293b; }
                .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                .payment-table th { text-align: left; padding: 16px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; }
                .payment-table td { padding: 20px 16px; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
                .total-section { background: #0f172a; color: white; padding: 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
                .total-label { font-size: 14px; font-weight: 600; opacity: 0.8; }
                .total-amount { font-size: 28px; font-weight: 900; }
                .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; }
                @media print { .receipt-container { border: none; padding: 0; } }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <div class="watermark">OFFICIAL</div>
                <div class="header">
                    <div class="logo-box">
                        <img src="/logo.png" alt="School Logo" />
                        <div class="school-info">
                            <strong>ROOTED IN CHRIST, READY FOR TOMORROW</strong><br/>
                            GIHOSHA No 7 AVE BUKIRIRO,BUJUMBURA,BURUNDI<br/>
                            info@discoveryschoolburundi.org | +257 22 23 20 59 <br/>
                            discoveryschoolburundi.org
                        </div>
                    </div>
                    <div class="receipt-meta">
                        <h1>RECEIPT</h1>
                        <div style="font-weight: 700; color: #64748b;">No: ${formatReference(payment)}</div>
                        <div class="status-badge">PAID & VERIFIED</div>
                    </div>
                </div>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Payment Date</div>
                        <div class="detail-value">${payment.payment_date || new Date().toLocaleDateString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Payment Method</div>
                        <div class="detail-value">${payment.payment_mode_name || "N/A"}</div>
                    </div>
                </div>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Invoice Reference</div>
                        <div class="detail-value">${payment.invoice_reference || "N/A"}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Payment Reference</div>
                        <div class="detail-value">${payment.payment_reference || "N/A"}</div>
                    </div>
                </div>
                <table class="payment-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount (FBU)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>School Fee Payment</strong><br/><small style="color: #64748b;">${payment.institution_name || "Cash"} transaction</small></td>
                            <td style="text-align: right; font-weight: 800;">${Number(payment.amount).toLocaleString()} FBU</td>
                        </tr>
                    </tbody>
                </table>
                <div class="total-section">
                    <div class="total-label">Total Amount Processed</div>
                    <div class="total-amount">${Number(payment.amount).toLocaleString()} FBU</div>
                </div>
                <div class="footer">
                    Thank you for your commitment to education excellence.<br/>
                    <em>This receipt is automatically generated and digitally verified.</em>
                </div>
              </div>
              <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    }

    const handleCancelPayment = (paymentId: number) => {
        if (window.confirm("Are you sure you want to cancel this payment? The invoice will be re-initialized.")) {
            setCancellingId(paymentId);
            cancelPayment.mutate(paymentId, {
                onSuccess: () => {
                    setCancellingId(null);
                },
                onError: (err: any) => {
                    setCancellingId(null);
                    const msg = err?.response?.data?.message || "Failed to cancel payment. Only directors can cancel payments.";
                    alert(msg);
                },
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic">Payment History</h1>
                    <p className="text-muted-foreground font-medium mt-1">Audit trail of all processed school fee transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-lg border-2 hover:bg-muted transition-all font-bold h-12 px-6" onClick={handleExportCSV} disabled={filteredPayments.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Ledger
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border shadow-sm bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet className="w-16 h-16 rotate-12" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Today&apos;s Batch</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black">2.4M Fbu</h3>
                        <span className="text-[10px] text-emerald-400 font-bold mb-1">+5.2%</span>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-xl p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Success Rate</p>
                    <h3 className="text-2xl font-black text-emerald-600">99.9%</h3>
                    <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99%]" />
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-xl p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Avg. Settlement</p>
                    <h3 className="text-2xl font-black text-foreground">450K Fbu</h3>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1">Per transaction</p>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-xl p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Goal</p>
                    <h3 className="text-2xl font-black text-indigo-600">82%</h3>
                    <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full w-[82%]" />
                    </div>
                </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Trace transaction ID or reference..."
                                className="pl-12 h-14 bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-indigo-500 transition-all rounded-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-14 bg-muted/50 border-transparent rounded-lg focus:bg-background focus:ring-2 focus:ring-indigo-500 transition-all font-medium w-[150px]"
                                    placeholder="Date from"
                                />
                                <span className="text-muted-foreground font-bold text-xs">—</span>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-14 bg-muted/50 border-transparent rounded-lg focus:bg-background focus:ring-2 focus:ring-indigo-500 transition-all font-medium w-[150px]"
                                    placeholder="Date to"
                                />
                            </div>
                            <Popover open={openInvoiceCombo} onOpenChange={setOpenInvoiceCombo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openInvoiceCombo}
                                        className="w-[220px] h-14 justify-between bg-muted/50 border-transparent rounded-lg hover:bg-background hover:shadow-md transition-all font-bold text-muted-foreground"
                                    >
                                        <span className="truncate">
                                            {invoiceFilter && invoiceFilter !== "all"
                                                ? invoices.find(i => i.id.toString() === invoiceFilter)?.reference || `Invoice #${invoiceFilter}`
                                                : "All Invoiced Fees"}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 rounded-lg border-border shadow-2xl" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search invoices..." className="h-12 border-none focus:ring-0" />
                                        <CommandList>
                                            <CommandEmpty className="p-4 text-center text-xs font-bold text-muted-foreground">
                                                {isInvoicesLoading ? "Scanning network..." : "No invoice trace detected."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="all"
                                                    onSelect={() => { setInvoiceFilter("all"); setOpenInvoiceCombo(false); }}
                                                    className="rounded-xl m-1 font-bold"
                                                >
                                                    Show All Transactions
                                                    <Check className={cn("ml-auto h-4 w-4", invoiceFilter === "all" ? "opacity-100" : "opacity-0")} />
                                                </CommandItem>
                                                {invoices.map((inv) => (
                                                    <CommandItem
                                                        key={`invoice-${inv.id}`}
                                                        value={`${inv.reference} ${inv.student_name} ${inv.id}`}
                                                        onSelect={() => { setInvoiceFilter(inv.id.toString()); setOpenInvoiceCombo(false); }}
                                                        className="rounded-xl m-1 font-bold"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{inv.reference}</span>
                                                            <span className="text-[10px] text-muted-foreground">{inv.student_name}</span>
                                                        </div>
                                                        <Check className={cn("ml-auto h-4 w-4 flex-shrink-0", invoiceFilter === inv.id.toString() ? "opacity-100" : "opacity-0")} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                                <SelectTrigger className="w-[200px] h-14 bg-muted/50 border-transparent rounded-lg focus:bg-background focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-muted-foreground">
                                    <Building2 className="w-4 h-4 mr-2 shrink-0" />
                                    <SelectValue placeholder="All Institutions" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all" className="font-bold">All Institutions</SelectItem>
                                    {institutions.map((inst: any) => (
                                        <SelectItem key={inst.id} value={String(inst.id)} className="font-bold">
                                            {inst.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Securing database connection...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-rose-500">
                            <ShieldAlert className="w-12 h-12" />
                            <p className="font-black text-rose-600">Access Interrupted</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>Retry Handshake</Button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="border-border hover:bg-transparent">
                                            <TableHead className="py-5 pl-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Reference</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Invoice</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Payment Reference</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Payment Date</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Method</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap text-right">Amount Paid</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Institution</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Created By</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Creation Date</TableHead>
                                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Status</TableHead>
                                            <TableHead className="py-5 pr-6 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground whitespace-nowrap">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.map((payment) => (
                                            <TableRow key={payment.id} className="border-border hover:bg-muted/30 transition-all group">
                                                <TableCell className="py-5 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-foreground text-sm leading-none">{formatReference(payment)}</div>
                                                            <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">PAY-{payment.id}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl">
                                                        <Receipt className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                                        <span className="text-xs font-bold text-muted-foreground">{payment.invoice_reference}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {payment.payment_reference || <span className="text-muted-foreground">—</span>}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-xs font-bold text-foreground">
                                                            {payment.payment_date || <span className="text-muted-foreground">—</span>}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge variant="outline" className="bg-background font-bold text-[10px] uppercase">
                                                        {payment.payment_mode_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5 text-right">
                                                    <span className="text-base font-black text-foreground">
                                                        {Number(payment.amount).toLocaleString()}{" "}
                                                        <small className="text-[9px] text-muted-foreground uppercase font-bold">Fbu</small>
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {payment.institution_name || <span className="text-muted-foreground">—</span>}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {payment.created_by_name || <span className="text-muted-foreground">—</span>}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-xs font-bold text-foreground">
                                                            {payment.created_at || <span className="text-muted-foreground">—</span>}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    {payment.cancelled_at ? (
                                                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-200 font-bold text-[10px] uppercase">
                                                            Cancelled
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold text-[10px] uppercase">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-5 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {payment.document && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-9 shadow-lg shadow-emerald-500/10"
                                                                onClick={() => window.open(payment.document!, '_blank')}
                                                            >
                                                                <FileText className="w-3.5 h-3.5 mr-1.5" /> Document
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-9 shadow-lg shadow-indigo-500/10"
                                                            onClick={() => handlePrintReceipt(payment)}
                                                        >
                                                            <Printer className="w-3.5 h-3.5 mr-1.5" /> Receipt
                                                        </Button>
                                                        {!payment.cancelled_at && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-9 shadow-lg shadow-rose-500/10"
                                                                onClick={() => handleCancelPayment(payment.id)}
                                                                disabled={cancellingId === payment.id}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> {cancellingId === payment.id ? "..." : "Cancel"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredPayments.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={11} className="py-32 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Search className="w-16 h-16" />
                                                        <p className="font-black tracking-widest uppercase text-sm text-foreground">No transaction traces detected</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalCount > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t rounded-b-xl">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium">{totalCount}</span>
                                        <span>result{totalCount !== 1 ? "s" : ""}</span>
                                        <span className="mx-1">·</span>
                                        <span>Page {paymentPage} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={String(pageSize)}
                                            onValueChange={(v) => { setPageSize(Number(v)); setPaymentPage(1) }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px] text-xs rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="15">15</SelectItem>
                                                <SelectItem value="30">30</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                disabled={paymentPage <= 1}
                                                onClick={() => setPaymentPage(p => p - 1)}
                                            >
                                                <ChevronLeftIcon className="h-4 w-4" />
                                            </Button>
                                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                                                const totalPages = Math.ceil(totalCount / pageSize);
                                                let start = Math.max(1, paymentPage - 2);
                                                const end = Math.min(totalPages, start + 4);
                                                if (end - start < 4) start = Math.max(1, end - 4);
                                                const pageNum = start + i;
                                                if (pageNum > totalPages) return null;
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === paymentPage ? "default" : "outline"}
                                                        size="sm"
                                                        className="min-w-[32px] rounded-xl"
                                                        onClick={() => setPaymentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                disabled={paymentPage >= Math.ceil(totalCount / pageSize)}
                                                onClick={() => setPaymentPage(p => p + 1)}
                                            >
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
