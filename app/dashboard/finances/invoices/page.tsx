"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Filter,
    Download,
    MoreHorizontal,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Trash2,
    Printer,
    ChevronRight
} from "lucide-react"
import { mockInvoices, mockStudents } from "@/lib/mock-data"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InvoicesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
    const { toast } = useToast()

    const filteredInvoices = mockInvoices.filter(invoice => {
        const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleRecordPayment = (invoice: any) => {
        setSelectedInvoice(invoice)
        setIsPaymentDialogOpen(true)
    }

    const handleViewDetails = (invoice: any) => {
        setSelectedInvoice(invoice)
        setIsDetailsDialogOpen(true)
    }

    const handleDownload = (invoice: any) => {
        toast({
            title: "Downloading Invoice",
            description: `Invoice ${invoice.id} is being generated...`,
        })
        // Mock download logic
        console.log(`Downloading ${invoice.id}`)
    }

    const handlePrintReceipt = (invoice: any) => {
        toast({
            title: "Printing Receipt",
            description: `Sending receipt for ${invoice.id} to printer...`,
        })
        console.log(`Printing receipt for ${invoice.id}`)
    }

    const handleVoidInvoice = (invoice: any) => {
        setSelectedInvoice(invoice)
        setIsVoidDialogOpen(true)
    }

    const confirmVoid = () => {
        toast({
            title: "Invoice Voided",
            description: `Invoice ${selectedInvoice?.id} has been voided successfully.`,
            variant: "destructive",
        })
        setIsVoidDialogOpen(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>
            case "pending":
                return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 rounded-full"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case "overdue":
                return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Invoice Management</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track billing, manage payments, and generate school fee reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-border/50 h-12 px-6">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button className="rounded-xl shadow-lg shadow-primary/20 h-12 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <Badge variant="secondary" className="bg-green-500/5 text-green-600 border-none font-bold uppercase tracking-wider text-[10px]">Collected</Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tight">$42,850</h3>
                            <p className="text-sm text-muted-foreground font-medium">Total revenue received</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-500" />
                            </div>
                            <Badge variant="secondary" className="bg-orange-500/5 text-orange-600 border-none font-bold uppercase tracking-wider text-[10px]">Pending</Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tight">$12,400</h3>
                            <p className="text-sm text-muted-foreground font-medium">Awaiting payment</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <Badge variant="secondary" className="bg-red-500/5 text-red-600 border-none font-bold uppercase tracking-wider text-[10px]">Overdue</Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tight">$3,150</h3>
                            <p className="text-sm text-muted-foreground font-medium">Past due date</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student or invoice ID..."
                                className="pl-12 h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] h-12 bg-muted/50 border-transparent rounded-xl">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Invoices</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-muted/50">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Invoice ID</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Student</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Type</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Amount</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Due Date</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Status</TableHead>
                                    <TableHead className="py-5 text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                        <TableCell className="py-4 font-bold text-sm">{invoice.id}</TableCell>
                                        <TableCell className="py-4 font-medium">{invoice.studentName}</TableCell>
                                        <TableCell className="py-4">
                                            <span className="capitalize text-xs font-bold text-muted-foreground/80 bg-muted px-2 py-1 rounded-md">{invoice.type}</span>
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-lg text-foreground">${invoice.amount.toLocaleString()}</TableCell>
                                        <TableCell className="py-4 text-muted-foreground font-medium text-sm">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(invoice.status)}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {invoice.status !== "paid" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-lg transition-all"
                                                        onClick={() => handleRecordPayment(invoice)}
                                                    >
                                                        Pay
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                                        <DropdownMenuItem
                                                            className="rounded-lg px-3 py-2 gap-3 cursor-pointer"
                                                            onClick={() => handleViewDetails(invoice)}
                                                        >
                                                            <FileText className="w-4 h-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="rounded-lg px-3 py-2 gap-3 cursor-pointer"
                                                            onClick={() => handleDownload(invoice)}
                                                        >
                                                            <Download className="w-4 h-4" /> Download PDF
                                                        </DropdownMenuItem>
                                                        {invoice.status === "paid" && (
                                                            <DropdownMenuItem
                                                                className="rounded-lg px-3 py-2 gap-3 cursor-pointer"
                                                                onClick={() => handlePrintReceipt(invoice)}
                                                            >
                                                                <Printer className="w-4 h-4" /> Print Receipt
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="rounded-lg px-3 py-2 gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => handleVoidInvoice(invoice)}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Void Invoice
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-heading">Record Payment</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 font-medium">
                                Applying payment for Invoice {selectedInvoice?.id}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border/50">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">Amount Due</p>
                                <h4 className="text-2xl font-bold">${selectedInvoice?.amount.toLocaleString()}</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">Student</p>
                                <p className="font-bold">{selectedInvoice?.studentName}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">Payment Method</Label>
                                <Select defaultValue="bank">
                                    <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank">Bank Transfer</SelectItem>
                                        <SelectItem value="cash">Cash Office</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">Payment Date</Label>
                                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-12 bg-muted/50 border-transparent rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">Transaction Ref (Optional)</Label>
                                <Input placeholder="TRX-123456789" className="h-12 bg-muted/50 border-transparent rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="h-12 flex-1 rounded-xl border-border/50 font-bold">
                            Cancel
                        </Button>
                        <Button onClick={() => setIsPaymentDialogOpen(false)} className="h-12 flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-muted p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl font-bold font-heading">Invoice Details</DialogTitle>
                            </div>
                            <DialogDescription className="text-muted-foreground font-medium">
                                Comprehensive breakdown of billing for {selectedInvoice?.id}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Student Name</p>
                                <p className="font-bold text-lg">{selectedInvoice?.studentName}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Billing Type</p>
                                <Badge variant="secondary" className="capitalize font-bold">{selectedInvoice?.type}</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Issue Date</p>
                                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Due Date</p>
                                <p className="font-semibold">{selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                                <p className="font-bold text-sm">Description</p>
                                <p className="font-bold text-sm">Amount</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">{selectedInvoice?.description || "Institutional Fees"}</p>
                                <p className="font-bold text-lg">${selectedInvoice?.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mr-1">Current Status</p>
                            {selectedInvoice && getStatusBadge(selectedInvoice.status)}
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 gap-3">
                        <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="h-12 flex-1 rounded-xl border-border/50 font-bold">
                            Close
                        </Button>
                        <div className="flex flex-1 gap-2">
                            <Button variant="secondary" className="h-12 flex-1 rounded-xl font-bold" onClick={() => handleDownload(selectedInvoice)}>
                                <Download className="w-4 h-4 mr-2" /> PDF
                            </Button>
                            {selectedInvoice?.status === "paid" && (
                                <Button className="h-12 flex-1 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => handlePrintReceipt(selectedInvoice)}>
                                    <Printer className="w-4 h-4 mr-2" /> Print
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Void Confirmation Dialog */}
            <AlertDialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
                <AlertDialogContent className="rounded-[2rem] p-8 border-none shadow-2xl">
                    <AlertDialogHeader>
                        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold font-heading">Void Invoice?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium text-lg leading-relaxed">
                            Are you absolutely sure you want to void invoice <span className="font-bold text-foreground">{selectedInvoice?.id}</span>?
                            This action cannot be undone and will remove it from active billing.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 flex-1 rounded-xl border-border/50 font-bold m-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-bold m-0 shadow-lg shadow-red-500/20"
                            onClick={confirmVoid}
                        >
                            Void Invoice
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
