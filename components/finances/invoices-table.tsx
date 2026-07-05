"use client";

import { Invoice } from "@/types/finance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, FileText, Calendar, User, DollarSign, ArrowRight, Loader2, Printer, CreditCard, Upload, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayInvoice } from "@/hooks/use-finance";
import { useFinancialInstitutions } from "@/hooks/use-financial-institutions";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface InvoicesTableProps {
    invoices: Invoice[];
    isLoading: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
    const payMutation = usePayInvoice();
    const { data: institutions } = useFinancialInstitutions();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMode, setPaymentMode] = useState<string>("1");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [paymentInstitution, setPaymentInstitution] = useState<string>("");
    const [paymentReference, setPaymentReference] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.reference}</title>
              <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #f1f5f9; padding: 40px; border-radius: 12px; }
                .header { display: flex; justify-content: space-between; border-bottom: 3px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                .logo-box img { height: 60px; margin-bottom: 10px; }
                .invoice-details { text-align: right; }
                .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
                .section { margin-bottom: 30px; }
                .grid { display: flex; justify-content: space-between; gap: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
                th { background: #0f172a; color: white; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .total-row { font-weight: bold; font-size: 18px; }
                .total-row td { border-top: 2px solid #0f172a; }
                .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .status.paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .status.unpaid { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
                .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                @media print {
                    body { padding: 0; }
                    .receipt { border: none; padding: 0; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                 <div class="header">
                     <div>
                         <img src="/logo.png" style="height: 60px; margin-bottom: 10px;" alt="Institutional Logo" />
                         <div class="school-info">
                            <strong>ACADEMIC EXCELLENCE INSTITUTE</strong><br/>
                            123 Education Boulevard, Bujumbura<br/>
                            contact@school.bi | +257 22 00 00 00
                        </div>
                     </div>
                     <div class="invoice-details">
                         <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 800; letter-spacing: 1px;">INVOICE</h1>
                         <div class="subtitle">Reference: <strong style="color: #0f172a;">${invoice.reference}</strong></div>
                         <div class="subtitle">Date: ${invoice.date}</div>
                         <div class="subtitle" style="font-weight: 600;">Period: ${invoice.period_name || 'N/A'}</div>
                     </div>
                 </div>
                 
                 <div class="grid section">
                     <div>
                         <div style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Billed To:</div>
                         <div style="font-size: 18px; font-weight: bold; margin-top: 5px; color: #0f172a;">${invoice.student_name || 'Institutional Entity'}</div>
                         <div class="subtitle">ID: STU-${invoice.student_id}</div>
                     </div>
                     <div style="text-align: right;">
                         <div style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Status:</div>
                         <div style="margin-top: 5px;">
                             <span class="status ${invoice.status === 1 ? 'paid' : 'unpaid'}">
                                 ${invoice.status_name.toUpperCase()}
                             </span>
                         </div>
                     </div>
                 </div>

                 <div class="section">
                     <table>
                         <thead>
                             <tr>
                                 <th>Description</th>
                                 <th>Category</th>
                                 <th style="text-align: right;">Total Amount</th>
                                 <th style="text-align: right;">Paid</th>
                                 <th style="text-align: right;">Balance</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr>
                                 <td>
                                     <div style="font-weight: 600; color: #0f172a;">${invoice.fees_detail?.label || 'General Fee'}</div>
                                     <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Code: ${invoice.fees_detail?.code || 'N/A'}</div>
                                 </td>
                                 <td>${invoice.fees_detail?.fee_category_name || 'Uncategorized'}</td>
                                 <td style="text-align: right; font-weight: 600; color: #0f172a;">${Number(invoice.amount).toLocaleString('en-US')} FBU</td>
                                 <td style="text-align: right; font-weight: 600; color: #166534;">${Number(invoice.amount_paid || 0).toLocaleString('en-US')} FBU</td>
                                 <td style="text-align: right; font-weight: 600; color: #b91c1c;">${Number(invoice.balance || 0).toLocaleString('en-US')} FBU</td>
                             </tr>
                             <tr class="total-row">
                                 <td colspan="4" style="text-align: right; padding-top: 20px;">Remaining Balance:</td>
                                 <td style="text-align: right; font-size: 20px; color: #b91c1c; padding-top: 20px;">${Number(invoice.balance || 0).toLocaleString('en-US')} FBU</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>

                 <div class="footer">
                    This is a computer-generated document. No signature required.<br/>
                    &copy; ${new Date().getFullYear()} School Management System. All rights reserved.
                 </div>
              </div>
              <script>
                window.onload = function() { 
                    setTimeout(function() {
                        window.print(); 
                        window.close(); 
                    }, 250);
                }
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const [fileError, setFileError] = useState(false);

    const handleConfirmPayment = () => {
        if (!selectedInvoice || !paymentAmount) return;

        if (paymentMode !== "1" && !selectedFile) {
            setFileError(true);
            toast.error("Proof document is required for this payment mode.");
            return;
        }
        setFileError(false);

        const formData = new FormData();
        formData.append("invoice", selectedInvoice.id.toString());
        formData.append("amount", paymentAmount);
        formData.append("invoice_reference", selectedInvoice.reference || "");
        formData.append("payment_mode", paymentMode);
        if (selectedFile) {
            formData.append("document", selectedFile);
        }
        if (paymentInstitution) {
            formData.append("institution", paymentInstitution);
        }
        if (paymentReference) {
            formData.append("payment_reference", paymentReference);
        }
        if (paymentDate) {
            formData.append("payment_date", paymentDate);
        }

        payMutation.mutate(formData, {
            onSuccess: () => {
                toast.success(`Payment for ${selectedInvoice.reference} processed successfully.`);
                setIsDialogOpen(false);
                setSelectedInvoice(null);
                setPaymentAmount("");
                setPaymentMode("1");
                setSelectedFile(null);
                setFileError(false);
                setPaymentInstitution("");
                setPaymentReference("");
                setPaymentDate(new Date().toISOString().split("T")[0]);
            },
            onError: (err: any) => {
                const errData = err.response?.data;
                const fieldErrors = errData?.errors;
                let msg = errData?.message || "Failed to process payment.";
                if (fieldErrors && typeof fieldErrors === "object") {
                    const detail = Object.entries(fieldErrors)
                        .map(([field, msgs]) =>
                            Array.isArray(msgs) ? `${field}: ${msgs.join(", ")}` : `${field}: ${msgs}`
                        )
                        .join(" | ");
                    if (detail) msg = `${msg}: ${detail}`;
                }
                toast.error(msg);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No invoices found</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        There are no invoices recorded in the system yet for this period.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[180px] font-bold">Reference</TableHead>
                        <TableHead className="font-bold">Student / Description</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">Period</TableHead>
                        <TableHead className="font-bold">Total</TableHead>
                        <TableHead className="font-bold">Paid</TableHead>
                        <TableHead className="font-bold">Balance</TableHead>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="w-[100px] text-right font-bold pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => {
                        const blockingInvoice = invoices.find(other =>
                            other.student_id === invoice.student_id &&
                            other.status === 0 &&
                            (other.fees_detail?.priority ?? 999) < (invoice.fees_detail?.priority ?? 999)
                        );
                        const isBlocked = !!blockingInvoice;

                        return (
                            <TableRow key={invoice.id} className={cn("group hover:bg-muted/30 transition-colors border-border", isBlocked && "opacity-80")}>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xs font-bold text-primary">{invoice.reference}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{invoice.fees_detail?.code}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{invoice.student_name || "Institutional Fee"}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{invoice.fees_detail?.label}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="bg-background font-medium w-fit">
                                            {invoice.fees_detail?.fee_category_name}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                (invoice.fees_detail?.priority ?? 999) <= 1 ? "bg-red-500" :
                                                    (invoice.fees_detail?.priority ?? 999) <= 3 ? "bg-amber-500" : "bg-blue-500"
                                            )} />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Priority {invoice.fees_detail?.priority}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">{invoice.period_name || "N/A"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">
                                            {Number(invoice.amount).toLocaleString("en-US")} FBU
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-600">
                                            {Number(invoice.amount_paid || 0).toLocaleString("en-US")} FBU
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-destructive">
                                            {Number(invoice.balance || 0).toLocaleString("en-US")} FBU
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{invoice.date}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={invoice.status === 1 ? "default" : "destructive"}>
                                        {invoice.status_name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 space-x-2 whitespace-nowrap">
                                    {invoice.status === 0 && (
                                        <div className="inline-flex flex-col items-end gap-1">
                                            <Button
                                                variant={isBlocked ? "outline" : "default"}
                                                size="sm"
                                                className={cn(
                                                    !isBlocked && "bg-primary text-primary-foreground hover:bg-primary/90",
                                                    isBlocked && "cursor-not-allowed grayscale"
                                                )}
                                                onClick={() => {
                                                    if (isBlocked) {
                                                        toast.error(`Please pay high-priority invoice (${blockingInvoice.fees_detail?.label}) first.`);
                                                        return;
                                                    }
                                                    setSelectedInvoice(invoice);
                                                    setPaymentAmount(invoice.balance.toString());
                                                    setPaymentMode("1");
                                                    setSelectedFile(null);
                                                    setFileError(false);
                                                    setPaymentInstitution("");
                                                    setPaymentReference("");
                                            setPaymentDate(new Date().toISOString().split("T")[0]);
                                            setIsDialogOpen(true);
                                                }}
                                            >
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                Pay
                                            </Button>
                                            {isBlocked && (
                                                <span className="text-[9px] font-bold text-destructive uppercase tracking-tighter">
                                                    Priority Required
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                        onClick={() => handlePrint(invoice)}
                                        title="Print Invoice"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" title="View Details">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to process the payment for {selectedInvoice?.reference}?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-5">
                        <div className="flex justify-between items-center rounded-xl border p-4 bg-muted/30">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Student</span>
                                <span className="font-bold text-foreground">{selectedInvoice?.student_name || "Institutional Fee"}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Invoice Info</span>
                                <span className="font-mono text-xs font-bold text-primary">{selectedInvoice?.reference}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentAmount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (FBU)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="pl-9 font-bold h-11 border-primary/20 focus-visible:ring-primary"
                                    />
                                </div>
                                <p className="text-[15px] text-muted-foreground">
                                    Total: <span className="font-bold">{Number(selectedInvoice?.amount || 0).toLocaleString("en-US")} FBU</span>
                                    {Number(selectedInvoice?.balance || 0) < Number(selectedInvoice?.amount || 0) && (
                                        <> &middot; Remaining: <span className="font-bold text-destructive">{Number(selectedInvoice?.balance || 0).toLocaleString("en-US")} FBU</span></>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Mode</Label>
                                <Select
                                    value={paymentMode}
                                    onValueChange={(val) => {
                                        setPaymentMode(val);
                                        setFileError(false);
                                        if (val === "1") {
                                            setSelectedFile(null);
                                            setPaymentInstitution("");
                                            setPaymentReference("");
                                        }
                                    }}
                                >
                                    <SelectTrigger id="paymentMode" className="h-11 border-primary/20">
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Cash</SelectItem>
                                        <SelectItem value="2">Check</SelectItem>
                                        <SelectItem value="3">Deposit</SelectItem>
                                        <SelectItem value="4">Bank Transfer</SelectItem>
                                        <SelectItem value="5">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {paymentMode !== "1" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentInstitution" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institution</Label>
                                        <Select
                                            value={paymentInstitution}
                                            onValueChange={setPaymentInstitution}
                                        >
                                            <SelectTrigger id="paymentInstitution" className="h-11 border-primary/20">
                                                <SelectValue placeholder="Select institution" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {institutions?.map((inst) => (
                                                    <SelectItem key={inst.id} value={inst.id.toString()}>
                                                        {inst.acronyms} - {inst.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentReference" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Reference</Label>
                                        <Input
                                            id="paymentReference"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Check no., transaction ID..."
                                            className="h-11 border-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Date</Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="h-11 border-primary/20 w-full md:w-1/2"
                                    />
                                </div>
                                <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof Document <span className="text-destructive">(Required)</span></Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all gap-2",
                                        selectedFile ? "border-primary bg-primary/5" : fileError ? "border-destructive bg-destructive/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                                    )}
                                >
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,.pdf"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setSelectedFile(file);
                                            }}
                                        />
                                        <Upload className={cn("h-6 w-6", selectedFile ? "text-primary" : "text-muted-foreground")} />
                                        <div className="text-center">
                                            <p className="text-sm font-bold">
                                                {selectedFile ? selectedFile.name : "Click to upload document"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG allowed"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pb-2 text-[11px]">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="outline" className="rounded-md px-1 py-0 h-4 uppercase text-[9px] font-bold">Category</Badge>
                                <span className="font-medium truncate">{selectedInvoice?.fees_detail?.fee_category_name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="outline" className="rounded-md px-1 py-0 h-4 uppercase text-[9px] font-bold">Period</Badge>
                                <span className="font-medium truncate">{selectedInvoice?.period_name || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={payMutation.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmPayment} disabled={payMutation.isPending}>
                            {payMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
