"use client";

import { useStudentTransactions } from "@/hooks/use-students";
import { Box, Loader2, Calendar, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Status4EcEnum } from "@/types/student";

export function TransactionsTab({ studentId }: { studentId: number }) {
    const { data, isLoading } = useStudentTransactions(studentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const sales = data?.sales || [];
    const distributions = data?.distributions || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Sales Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    Purchases & Sales History
                </h3>
                {sales.length === 0 ? (
                    <Card className="border-dashed bg-muted/20">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            No purchase history found.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Product</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead className="text-right">Total Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{sale.product_name}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(sale.date), "PPP")}
                                            </TableCell>
                                            <TableCell>{sale.quantity || 1}</TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {sale.total_price} Fbu
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Distributions Section */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Box className="h-5 w-5 text-muted-foreground" />
                    Material Distributions
                </h3>
                {distributions.length === 0 ? (
                    <Card className="border-dashed bg-muted/20">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            No material distributions recorded.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {distributions.map((item) => (
                            <Card key={item.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm uppercase tracking-tight">{item.product_name}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase font-bold">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(item.distribution_date), "MMM dd, yyyy")}
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                                Qty: {item.quantity || 1}
                                            </Badge>
                                        </div>
                                    </div>
                                    {item.status && (
                                        <Badge variant="outline" className={`capitalize text-[9px] font-bold ${item.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                            {item.status}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
