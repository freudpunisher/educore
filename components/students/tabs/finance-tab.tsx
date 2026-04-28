"use client";

import { useStudentFinance } from "@/hooks/use-students";
import { Wallet, CreditCard, Receipt, Loader2, ArrowUpRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

            {/* Invoices List */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    Billing History & Invoices
                </h3>
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
