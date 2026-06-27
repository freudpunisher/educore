"use client";

import { useStudentFinance } from "@/hooks/use-students";
import { Wallet, CreditCard, Receipt, Loader2, ArrowUpRight, Calendar, Printer, CircleDollarSign, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function FinanceTab({ studentId, academicYearId }: { studentId: number, academicYearId?: number }) {
    const { data, isLoading } = useStudentFinance(studentId, academicYearId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const invoices = data?.invoices || [];

    const handlePrintInvoices = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const invoiceCards = invoices.map((inv: any) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <div>
                        <strong style="font-size: 14px;">${inv.reference}</strong>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Created: ${format(new Date(inv.created_at), "PPP")}</div>
                    </div>
                    <span style="padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; background: ${inv.balance === "0.00" ? '#dcfce7' : '#ffedd5'}; color: ${inv.balance === "0.00" ? '#166534' : '#9a3412'}; border: 1px solid ${inv.balance === "0.00" ? '#bbf7d0' : '#fed7aa'};">
                        ${inv.balance === "0.00" ? "Paid" : `Balance: ${inv.balance} Fbu`}
                    </span>
                </div>
                <div style="padding: 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="text-align: left; padding: 10px 16px; color: #475569; font-weight: 600;">Date</th>
                                <th style="text-align: left; padding: 10px 16px; color: #475569; font-weight: 600;">Payment Method</th>
                                <th style="text-align: right; padding: 10px 16px; color: #475569; font-weight: 600;">Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inv.payments.length === 0
                                ? `<tr><td colspan="3" style="text-align: center; padding: 16px; color: #94a3b8; font-style: italic;">No payments recorded</td></tr>`
                                : inv.payments.map((p: any) => `
                                    <tr style="border-top: 1px solid #f1f5f9;">
                                        <td style="padding: 10px 16px; color: #64748b; font-size: 12px;">${format(new Date(p.created_at), "MMM dd, yyyy")}</td>
                                        <td style="padding: 10px 16px;">${p.payment_mode === 1 ? "Bank Transfer" : "Cash / Other"}</td>
                                        <td style="padding: 10px 16px; text-align: right; font-weight: bold; color: #16a34a;">+ ${p.amount} Fbu</td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Student Invoices Report</title>
                    <style>
                        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
                        .summary-card { flex: 1; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
                        .summary-value { font-size: 20px; font-weight: bold; margin-top: 4px; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1 style="margin: 0; font-size: 22px;">Student Invoices Report</h1>
                            <div style="color: #64748b; font-size: 13px; margin-top: 4px;">${data?.student_name || `Student #${studentId}`}</div>
                        </div>
                        <div style="text-align: right; font-size: 12px; color: #64748b;">
                            Generated: ${new Date().toLocaleString()}<br/>
                            Total Records: ${invoices.length}
                        </div>
                    </div>
                    <div class="summary">
                        <div class="summary-card">
                            <div class="summary-label">Total Paid</div>
                            <div class="summary-value" style="color: #16a34a;">${data?.total_paid} Fbu</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Outstanding Balance</div>
                            <div class="summary-value" style="color: #ea580c;">${data?.outstanding_balance} Fbu</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Total Due</div>
                            <div class="summary-value">${data?.total_due} Fbu</div>
                        </div>
                    </div>
                    ${invoiceCards}
                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.print(); window.close(); }, 250);
                        }
                    <\/script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Total Paid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">{data?.total_paid} Fbu</p>
                    </CardContent>
                </Card>
                <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4" />
                            Outstanding Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">{data?.outstanding_balance} Fbu</p>
                    </CardContent>
                </Card>
                <Card className="border-muted-foreground/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Total Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{data?.total_due} Fbu</p>
                    </CardContent>
                </Card>
            </div>

            {/* Surplus & Refunds */}
            {data?.surplus && Number(data.surplus.total_surplus) > 0 && (
                <section className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-emerald-500" />
                        Payment Surplus & Refunds
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Total Surplus
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-emerald-600">{Number(data.surplus.total_surplus).toLocaleString()} Fbu</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-500/5 border-red-500/20">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Refunded
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-red-600">{Number(data.surplus.total_refunded).toLocaleString()} Fbu</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Remaining
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-amber-600">{Number(data.surplus.remaining).toLocaleString()} Fbu</p>
                            </CardContent>
                        </Card>
                        <Card className="border-muted-foreground/20">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Refunds Count
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold">{data.surplus_details?.reduce((sum: number, s: any) => sum + (s.refunds_count || 0), 0) || 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {data.surplus_details?.map((surplus: any) => (
                        <Card key={surplus.id} className="overflow-hidden border-emerald-500/20">
                            <CardHeader className="p-3 bg-emerald-50/50 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Landmark className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-bold">{surplus.invoice_reference}</span>
                                </div>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                    Remaining: {Number(surplus.remaining).toLocaleString()} Fbu
                                </Badge>
                            </CardHeader>
                            {(surplus.refunds?.length ?? 0) > 0 && (
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow>
                                                <TableHead className="text-[10px]">Date</TableHead>
                                                <TableHead className="text-[10px]">Amount</TableHead>
                                                <TableHead className="text-[10px]">Mode</TableHead>
                                                <TableHead className="text-[10px]">By</TableHead>
                                                <TableHead className="text-[10px]">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {surplus.refunds.map((refund: any) => (
                                                <TableRow key={refund.id} className="text-xs">
                                                    <TableCell>{refund.created_at ? format(new Date(refund.created_at), "MMM dd, yyyy") : "—"}</TableCell>
                                                    <TableCell className="font-bold text-red-600">-{Number(refund.amount).toLocaleString()} Fbu</TableCell>
                                                    <TableCell>{refund.refund_mode_name || "—"}</TableCell>
                                                    <TableCell>{refund.created_by_name || "—"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={refund.cancelled_at ? "destructive" : "default"} className="text-[10px]">
                                                            {refund.cancelled_at ? "Cancelled" : "Active"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </section>
            )}

            {/* Invoices List */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        Billing History & Invoices
                    </h3>
                    <Button variant="outline" size="sm" onClick={handlePrintInvoices} disabled={invoices.length === 0}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
                {invoices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-20 text-center">
                            <p className="text-muted-foreground">No invoices found for this student.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {invoices.map((invoice) => (
                            <Card key={invoice.id} className="overflow-hidden">
                                <CardHeader className="p-4 bg-muted/20 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background rounded-lg border">
                                            <Receipt className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{invoice.reference}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                Created {format(new Date(invoice.created_at), "PPP")}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={invoice.balance === "0.00" ? "default" : "outline"} className={invoice.balance !== "0.00" ? "border-orange-200 text-orange-600 bg-orange-50" : ""}>
                                        {invoice.balance === "0.00" ? "Paid" : `Balance: ${invoice.balance} Fbu`}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow>
                                                <TableHead className="w-[150px]">Date</TableHead>
                                                <TableHead>Payment Method</TableHead>
                                                <TableHead className="text-right">Amount Paid</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.payments.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-xs italic">
                                                        No payments recorded against this invoice.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                invoice.payments.map((payment) => (
                                                    <TableRow key={payment.id} className="text-xs">
                                                        <TableCell className="flex items-center gap-2 uppercase font-semibold text-muted-foreground text-[10px]">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(payment.created_at), "MMM dd, yyyy")}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payment.payment_mode === 1 ? "Bank Transfer" : "Cash / Other"}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-green-600">
                                                            + {payment.amount} Fbu
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
