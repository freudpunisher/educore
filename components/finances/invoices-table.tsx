"use client";

import { Invoice } from "@/types/finance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, FileText, Calendar, User, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InvoicesTableProps {
    invoices: Invoice[];
    isLoading: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
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
                            <TableCell className="text-right pr-6">
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
