"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Eye,
    ShieldAlert,
    Pencil,
    CheckCircle2,
    MoreHorizontal,
    History,
    AlertCircle,
    XCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { DisciplineRecord, DisciplineRecordStatusEnum } from "@/types/discipline";
import { cn } from "@/lib/utils";

interface BehaviorTableProps {
    records: DisciplineRecord[];
    onViewDetails: (record: DisciplineRecord) => void;
    onEdit: (record: DisciplineRecord) => void;
    onStatusChange: (record: DisciplineRecord, status: DisciplineRecord["status"]) => void;
}

export function BehaviorTable({ records, onViewDetails, onEdit, onStatusChange }: BehaviorTableProps) {
    const getStatusBadge = (status: DisciplineRecord["status"]) => {
        switch (status) {
            case "recorded":
                return (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200/50 px-3 py-1 rounded-full font-medium">
                        Recorded
                    </Badge>
                );
            case "appealed":
                return (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200/50 px-3 py-1 rounded-full font-medium">
                        Appealed
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200/50 px-3 py-1 rounded-full font-medium">
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="rounded-2xl border border-muted-foreground/10 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-muted-foreground/10">
                        <TableHead className="py-4 font-bold text-foreground/80">Student</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80">Reason</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80 text-center">Points</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80">Date</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80">Recorded By</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80">Status</TableHead>
                        <TableHead className="py-4 font-bold text-foreground/80 text-right pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <ShieldAlert className="h-12 w-12 opacity-20" />
                                    <p className="text-lg">No behavior records found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        records.map((record) => (
                            <TableRow
                                key={record.id}
                                className="group border-b border-muted-foreground/5 hover:bg-muted/20 transition-colors"
                                onClick={() => onViewDetails(record)}
                            >
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{record.student_name || "Unknown Student"}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{record.student_enrollment}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-sm font-medium text-muted-foreground">{record.reason_name}</span>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <span className={cn(
                                        "text-sm font-bold px-2 py-0.5 rounded",
                                        Math.abs(parseFloat(record.points_deducted)) > 5
                                            ? "text-rose-600 bg-rose-50"
                                            : "text-amber-600 bg-amber-50"
                                    )}>
                                        {parseFloat(record.points_deducted) > 0 ? "-" : ""}{record.points_deducted}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-sm text-muted-foreground font-medium">
                                    {format(new Date(record.date_incident), "dd MMM yyyy", { locale: fr })}
                                </TableCell>
                                <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                                    {record.recorded_by_name || "Administrator"}
                                </TableCell>
                                <TableCell className="py-4">
                                    {getStatusBadge(record.status)}
                                </TableCell>
                                <TableCell className="py-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(record);
                                            }}
                                            className="rounded-full hover:bg-primary/10 hover:text-primary h-9 w-9 p-0"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(record);
                                            }}
                                            className="rounded-full hover:bg-amber-100 hover:text-amber-700 h-9 w-9 p-0"
                                            title="Edit Record"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-full hover:bg-blue-100 hover:text-blue-700 h-9 w-9 p-0"
                                                    title="Change Status"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-muted-foreground/10">
                                                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                                                    Update Status
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onStatusChange(record, DisciplineRecordStatusEnum.Recorded)}
                                                    className="rounded-lg gap-2 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Recorded
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onStatusChange(record, DisciplineRecordStatusEnum.Appealed)}
                                                    className="rounded-lg gap-2 cursor-pointer focus:bg-amber-50 focus:text-amber-700"
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                    Appealed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onStatusChange(record, DisciplineRecordStatusEnum.Cancelled)}
                                                    className="rounded-lg gap-2 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Cancelled
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
