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
    ChevronRight,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Check,
    ChevronsUpDown
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

    const handleDownloadReceipt = (payment: any) => {
        toast({
            title: "Receipt Generated",
            description: `Receipt for ${payment.id} has been downloaded.`,
        })
    }

    const handlePrintReceipt = (payment: any) => {
        toast({
            title: "Printing Receipt",
            description: `Sending receipt ${payment.id} to printer...`,
        })
        // In a real app, this might trigger window.print() on a specific component
        console.log(`Printing ${payment.id}`)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Payment History</h1>
                    <p className="text-muted-foreground font-medium mt-1">Review all successfully processed transactions and receipts</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-border/50 h-12 px-6">
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Today's Total</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-bold">2,450 Fbu</h3>
                        <span className="text-[10px] text-green-500 font-bold mb-1">+5%</span>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Weekly Volume</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-bold">18,200 Fbu</h3>
                        <span className="text-[10px] text-green-500 font-bold mb-1">+12%</span>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Active Methods</p>
                    <h3 className="text-2xl font-bold text-primary">4 Types</h3>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Reliability</p>
                    <h3 className="text-2xl font-bold text-green-500">99.9%</h3>
                </Card>
            </div>

            {/* Payments Table */}
            <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-12 h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl"
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
                                        className="w-[200px] h-12 justify-between bg-muted/50 border-transparent rounded-xl hover:bg-muted font-normal text-muted-foreground"
                                    >
                                        <span className="truncate">
                                            {invoiceFilter && invoiceFilter !== "all"
                                                ? invoices.find(i => i.id.toString() === invoiceFilter)?.reference || `Invoice #${invoiceFilter}`
                                                : "All Invoices"}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0 rounded-xl" align="end">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search invoices..."
                                            value={invoiceComboSearch}
                                            onValueChange={setInvoiceComboSearch}
                                            className="h-10 border-none focus:ring-0"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                {isInvoicesLoading ? "Loading..." : "No invoice found."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="all"
                                                    onSelect={() => {
                                                        setInvoiceFilter("all");
                                                        setOpenInvoiceCombo(false);
                                                    }}
                                                >
                                                    All Invoices
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
                                                    >
                                                        <span className="truncate">{inv.reference} {inv.student_name ? `(${inv.student_name})` : ""}</span>
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
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-muted/50">
                                <CalendarIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Loading payments...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-rose-500">
                            <ShieldAlert className="w-10 h-10" />
                            <p className="font-medium">Failed to load payments</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Transaction ID</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Invoice Ref</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Method</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Amount</TableHead>
                                        <TableHead className="py-5 text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Receipt</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="font-bold text-sm">PAY-{payment.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 font-medium text-muted-foreground">{payment.invoice_reference}</TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3 text-primary" />
                                                    <span className="text-xs font-bold">{payment.payment_mode_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <span className="text-lg font-bold text-foreground">{payment.amount.toLocaleString()} Fbu</span>
                                            </TableCell>
                                            <TableCell className="py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground font-bold"
                                                        onClick={() => handleDownloadReceipt(payment)}
                                                    >
                                                        <Receipt className="w-4 h-4 mr-2" /> Receipt
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between p-4 border-t border-border/50">
                                <p className="text-sm text-muted-foreground font-medium">
                                    Showing <span className="text-foreground">{filteredPayments.length}</span> of <span className="text-foreground">{paymentsData?.count || 0}</span> payments
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                                        disabled={paymentPage === 1}
                                        className="rounded-lg h-9 hover:bg-muted"
                                    >
                                        Previous
                                    </Button>
                                    <div className="px-3 py-1 bg-muted/50 rounded-lg text-sm font-bold w-9 h-9 flex items-center justify-center">
                                        {paymentPage}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPaymentPage(p => p + 1)}
                                        disabled={!paymentsData?.next}
                                        className="rounded-lg h-9 hover:bg-muted"
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
