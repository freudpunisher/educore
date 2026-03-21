"use client";

import { Invoice } from "@/types/finance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, FileText, Calendar, User, DollarSign, ArrowRight, Loader2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayInvoice } from "@/hooks/use-finance";
import { useState } from "react";
import toast from "react-hot-toast";

interface InvoicesTableProps {
    invoices: Invoice[];
    isLoading: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
    const payMutation = usePayInvoice();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.reference}</title>
              <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #333; }
                .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                .invoice-details { text-align: right; }
                .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
                .section { margin-bottom: 30px; }
                .grid { display: flex; justify-content: space-between; gap: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                th { background: #f8fafc; font-weight: 600; color: #475569; }
                .total-row { font-weight: bold; font-size: 18px; }
                .total-row td { border-top: 2px solid #333; }
                .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .status.paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .status.unpaid { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
                .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
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
                         <div class="logo">EduCore</div>
                         <div class="subtitle">123 Education Boulevard<br/>Bujumbura, Burundi<br/>Email: info@educore.edu</div>
                     </div>
                     <div class="invoice-details">
                         <h1 style="margin: 0; color: #1e293b; font-size: 28px; font-weight: 800; letter-spacing: 1px;">INVOICE</h1>
                         <div class="subtitle">Reference: <strong style="color: #333;">${invoice.reference}</strong></div>
                         <div class="subtitle">Date: ${invoice.date}</div>
                     </div>
                 </div>
                 
                 <div class="grid section">
                     <div>
                         <div style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Billed To:</div>
                         <div style="font-size: 18px; font-weight: bold; margin-top: 5px; color: #0f172a;">${invoice.student_name || 'Institutional Entity'}</div>
                         <div class="subtitle">Client Account</div>
                     </div>
                     <div style="text-align: right;">
                         <div style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Status:</div>
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
                                 <th>Period</th>
                                 <th style="text-align: right;">Amount</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr>
                                 <td>
                                     <div style="font-weight: 600; color: #0f172a;">${invoice.fees_detail.label}</div>
                                     <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Code: ${invoice.fees_detail.code}</div>
                                 </td>
                                 <td>${invoice.fees_detail.fee_category_name}</td>
                                 <td>${invoice.fees_detail.period_name}</td>
                                 <td style="text-align: right; font-weight: 600; color: #0f172a;">${Number(invoice.amount).toLocaleString('en-US')} FBU</td>
                             </tr>
                             <tr class="total-row">
                                 <td colspan="3" style="text-align: right; padding-top: 20px;">Total Due:</td>
                                 <td style="text-align: right; font-size: 20px; color: #2563eb; padding-top: 20px;">${Number(invoice.amount).toLocaleString('en-US')} FBU</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>

                 <div class="footer">
                     <p style="font-weight: 600; color: #333; margin-bottom: 5px;">Thank you for your prompt payment!</p>
                     <p style="margin-top: 0;">If you have any questions concerning this invoice, contact the finance department at finance@educore.edu.</p>
                 </div>
              </div>
              <script>
                // We add a tiny delay to ensure CSS renders before triggering print dialog
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

    const handleConfirmPayment = () => {
        if (!selectedInvoice) return;

        payMutation.mutate({
            invoice: selectedInvoice.id,
            amount: selectedInvoice.amount,
            invoice_reference: selectedInvoice.reference,
        }, {
            onSuccess: () => {
                toast.success(`Payment for ${selectedInvoice.reference} processed successfully.`);
                setIsDialogOpen(false);
                setSelectedInvoice(null);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || `Failed to process payment.`);
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
                        <TableHead className="font-bold">Amount</TableHead>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="w-[100px] text-right font-bold pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs font-bold text-primary">{invoice.reference}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{invoice.fees_detail.code}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{invoice.student_name || "Institutional Fee"}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{invoice.fees_detail.label}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-background font-medium">
                                    {invoice.fees_detail.fee_category_name}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold">
                                        {Number(invoice.amount).toLocaleString("en-US")} FBU
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">Incl. {invoice.fees_detail.period_name}</span>
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
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => {
                                            setSelectedInvoice(invoice);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Pay
                                    </Button>
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
                    ))}
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

                    <div className="py-4 space-y-3">
                        <div className="flex justify-between items-center rounded-lg border p-3">
                            <span className="text-sm text-muted-foreground">Amount Due</span>
                            <span className="font-bold text-lg">{Number(selectedInvoice?.amount || 0).toLocaleString("en-US")} FBU</span>
                        </div>
                        <div className="flex justify-between items-center rounded-lg border p-3 bg-muted/30">
                            <span className="text-sm text-muted-foreground">Student</span>
                            <span className="font-medium">{selectedInvoice?.student_name || "Institutional Fee"}</span>
                        </div>
                        <div className="flex justify-between items-center rounded-lg border p-3 bg-muted/30">
                            <span className="text-sm text-muted-foreground">Fee Category</span>
                            <span className="font-medium">{selectedInvoice?.fees_detail?.fee_category_name || "N/A"}</span>
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
        </div>
    );
}
