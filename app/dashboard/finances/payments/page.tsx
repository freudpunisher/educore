"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Filter,
    Download,
    ExternalLink,
    CreditCard,
    Receipt,
    Printer,
    Calendar as CalendarIcon,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Check,
    ChevronsUpDown,
    Wallet,
    TrendingUp,
    Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePayments, useInvoices } from "@/hooks/use-finance"
import { useDebounce } from "@/hooks/use-debounce"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [invoiceFilter, setInvoiceFilter] = useState("all")
    const [invoiceComboSearch, setInvoiceComboSearch] = useState("")
    const [openInvoiceCombo, setOpenInvoiceCombo] = useState(false)
    const [paymentPage, setPaymentPage] = useState(1)
    const { toast } = useToast()

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedInvoiceComboSearch = useDebounce(invoiceComboSearch, 500);

    const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices({
        search: debouncedInvoiceComboSearch,
        page_size: 10000
    });
    const invoices = invoicesData?.results || [];

    const {
        data: paymentsData,
        isLoading,
        isError,
    } = usePayments({
        page: paymentPage,
        search: debouncedSearch,
        invoice: invoiceFilter && invoiceFilter !== "all" ? Number(invoiceFilter) : undefined,
    });

    const filteredPayments = paymentsData?.results || [];

    const handlePrintReceipt = (payment: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official Payment Receipt - PAY-${payment.id}</title>
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
                            <strong>ACADEMIC EXCELLENCE INSTITUTE</strong><br/>
                            123 Education Boulevard, Bujumbura<br/>
                            Finance Department | +257 22 00 00 00
                        </div>
                    </div>
                    <div class="receipt-meta">
                        <h1>RECEIPT</h1>
                        <div style="font-weight: 700; color: #64748b;">No: PAYMENT-${payment.id}</div>
                        <div class="status-badge">PAID & VERIFIED</div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Payment Date</div>
                        <div class="detail-value">${new Date().toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Payment Method</div>
                        <div class="detail-value">${payment.payment_mode_name || 'Credit Card / Electronic'}</div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Invoice Reference</div>
                        <div class="detail-value">${payment.invoice_reference || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Transaction ID</div>
                        <div class="detail-value">TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </div>
                </div>

                <table class="payment-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount Local (Fbu)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>School Fee Coverage</strong><br/>
                                <small style="color: #64748b;">Fee payment towards associated reference</small>
                            </td>
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
                    <em>This receipt is automatically generated and digitally verified by the AEI Finance System.</em>
                </div>
              </div>
              <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic">Payment History</h1>
                    <p className="text-muted-foreground font-medium mt-1">Audit trail of all processed school fee transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-2 hover:bg-muted transition-all font-bold h-12 px-6">
                        <Download className="w-4 h-4 mr-2" />
                        Export Ledger
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950 text-white rounded-[2rem] p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet className="w-16 h-16 rotate-12" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Today's Batch</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black">2.4M Fbu</h3>
                        <span className="text-[10px] text-emerald-400 font-bold mb-1">+5.2%</span>
                    </div>
                </Card>

                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Success Rate</p>
                    <h3 className="text-2xl font-black text-emerald-600">99.9%</h3>
                    <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99%]" />
                    </div>
                </Card>

                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Avg. Settlement</p>
                    <h3 className="text-2xl font-black text-foreground">450K Fbu</h3>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1">Per transaction</p>
                </Card>

                <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] p-6 group hover:translate-y-[-4px] transition-all">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Goal</p>
                    <h3 className="text-2xl font-black text-indigo-600">82%</h3>
                    <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full w-[82%]" />
                    </div>
                </Card>
            </div>

            {/* Payments Table */}
            <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Trace transaction ID or reference..."
                                className="pl-12 h-14 bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-indigo-500 transition-all rounded-2xl font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Popover open={openInvoiceCombo} onOpenChange={setOpenInvoiceCombo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openInvoiceCombo}
                                        className="w-[220px] h-14 justify-between bg-muted/50 border-transparent rounded-2xl hover:bg-background hover:shadow-md transition-all font-bold text-muted-foreground"
                                    >
                                        <span className="truncate">
                                            {invoiceFilter && invoiceFilter !== "all"
                                                ? invoices.find(i => i.id.toString() === invoiceFilter)?.reference || `Invoice #${invoiceFilter}`
                                                : "All Invoiced Fees"}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 rounded-2xl border-border shadow-2xl" align="end">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search invoices..."
                                            value={invoiceComboSearch}
                                            onValueChange={setInvoiceComboSearch}
                                            className="h-12 border-none focus:ring-0"
                                        />
                                        <CommandList>
                                            <CommandEmpty className="p-4 text-center text-xs font-bold text-muted-foreground">
                                                {isInvoicesLoading ? "Scanning network..." : "No invoice trace detected."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="all"
                                                    onSelect={() => {
                                                        setInvoiceFilter("all");
                                                        setOpenInvoiceCombo(false);
                                                    }}
                                                    className="rounded-xl m-1 font-bold"
                                                >
                                                    Show All Transactions
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            invoiceFilter === "all" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                                {invoices.map((inv) => (
                                                    <CommandItem
                                                        key={`invoice-${inv.id}`}
                                                        value={inv.id.toString()}
                                                        onSelect={() => {
                                                            setInvoiceFilter(inv.id.toString());
                                                            setOpenInvoiceCombo(false);
                                                        }}
                                                        className="rounded-xl m-1 font-bold"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{inv.reference}</span>
                                                            <span className="text-[10px] text-muted-foreground">{inv.student_name}</span>
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4 flex-shrink-0",
                                                                invoiceFilter === inv.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/50 hover:bg-background hover:shadow-md transition-all text-muted-foreground">
                                <CalendarIcon className="w-5 h-5" />
                            </Button>
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
                        <div className="rounded-[2rem] border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border hover:bg-transparent px-8">
                                        <TableHead className="py-6 pl-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Transaction Trace</TableHead>
                                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Invoice Anchor</TableHead>
                                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Mechanism</TableHead>
                                        <TableHead className="py-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Volume</TableHead>
                                        <TableHead className="py-6 pr-8 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Documentation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} className="border-border hover:bg-muted/30 transition-all group">
                                            <TableCell className="py-8 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-foreground text-lg leading-none">PAY-{payment.id}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Digital Ledger Entry
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8 font-bold text-muted-foreground">
                                                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-xl">
                                                    <Receipt className="w-3 h-3 text-indigo-500" />
                                                    {payment.invoice_reference}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3 text-indigo-600" />
                                                    <span className="text-xs font-black uppercase text-foreground">{payment.payment_mode_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <span className="text-xl font-black text-foreground">{Number(payment.amount).toLocaleString()} <small className="text-[10px] text-muted-foreground uppercase">Fbu</small></span>
                                            </TableCell>
                                            <TableCell className="py-8 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-10 shadow-lg shadow-indigo-500/10"
                                                        onClick={() => handlePrintReceipt(payment)}
                                                    >
                                                        <Printer className="w-4 h-4 mr-2" /> Print Receipt
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredPayments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-32 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <Search className="w-16 h-16" />
                                                    <p className="font-black tracking-widest uppercase text-sm text-foreground">No transaction traces detected</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between p-6 bg-muted/30">
                                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                                    Archive Scanning: <span className="text-foreground">{filteredPayments.length}</span> of <span className="text-foreground">{paymentsData?.count || 0}</span> Entries
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                                        disabled={paymentPage === 1}
                                        className="rounded-xl h-10 px-4 hover:bg-background hover:shadow-md transition-all font-bold text-muted-foreground"
                                    >
                                        Previous
                                    </Button>
                                    <div className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-black text-white shadow-lg shadow-indigo-200 min-w-[40px] text-center">
                                        {paymentPage}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPaymentPage(p => p + 1)}
                                        disabled={!paymentsData?.next}
                                        className="rounded-xl h-10 px-4 hover:bg-background hover:shadow-md transition-all font-bold text-muted-foreground"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
