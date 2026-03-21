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
    ArrowUpRight
} from "lucide-react"
import { mockInvoices } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [methodFilter, setMethodFilter] = useState("all")
    const { toast } = useToast()

    // Derive payments from paid invoices
    const payments = mockInvoices
        .filter(invoice => invoice.status === "paid")
        .map((invoice, index) => ({
            id: `PAY-${1000 + index}`,
            invoiceId: invoice.id,
            studentName: invoice.studentName,
            amount: invoice.amount,
            date: invoice.paidDate || invoice.dueDate,
            method: index % 3 === 0 ? "Bank Transfer" : index % 3 === 1 ? "Cash Office" : "Credit Card",
            status: "completed"
        }))

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMethod = methodFilter === "all" || payment.method === methodFilter
        return matchesSearch && matchesMethod
    })

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
                        <h3 className="text-2xl font-bold">$2,450</h3>
                        <span className="text-[10px] text-green-500 font-bold mb-1">+5%</span>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Weekly Volume</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-bold">$18,200</h3>
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
                            <Select value={methodFilter} onValueChange={setMethodFilter}>
                                <SelectTrigger className="w-[180px] h-12 bg-muted/50 border-transparent rounded-xl">
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="Cash Office">Cash Office</SelectItem>
                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-muted/50">
                                <CalendarIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Transaction ID</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Invoice</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Student</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Date</TableHead>
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
                                                <span className="font-bold text-sm">{payment.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 font-medium text-muted-foreground">{payment.invoiceId}</TableCell>
                                        <TableCell className="py-6 font-bold">{payment.studentName}</TableCell>
                                        <TableCell className="py-6 text-muted-foreground font-medium text-sm">
                                            {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-primary" />
                                                <span className="text-xs font-bold">{payment.method}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <span className="text-lg font-bold text-foreground">${payment.amount.toLocaleString()}</span>
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-muted text-muted-foreground hover:bg-muted/80 font-bold"
                                                    onClick={() => handlePrintReceipt(payment)}
                                                >
                                                    <Printer className="w-4 h-4 mr-2" /> Print
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
