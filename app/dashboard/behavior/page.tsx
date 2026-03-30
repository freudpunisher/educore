"use client";

import { useState } from "react";
import { useBehaviorRecords } from "@/hooks/use-discipline";
import { BehaviorTable } from "@/components/discipline/behavior-table";
import { BehaviorFilters } from "@/components/discipline/behavior-filters";
import { BehaviorModal } from "@/components/discipline/behavior-modal";
import { CreateBehaviorDialog } from "@/components/discipline/create-behavior-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    Loader2,
    RefreshCcw,
    Plus
} from "lucide-react";
import { DisciplineRecord } from "@/types/discipline";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";

export default function BehaviorPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedRecord, setSelectedRecord] = useState<DisciplineRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, isError, refetch, isFetching } = useBehaviorRecords({
        page,
        student_name: debouncedSearch,
        status: status === "all" ? undefined : (status as any),
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatus("all");
        setPage(1);
    };

    const handleViewDetails = (record: DisciplineRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <ShieldAlert className="w-16 h-16 text-destructive/50" />
                <h2 className="text-2xl font-bold">Failed to load records</h2>
                <p className="text-muted-foreground">There was an error fetching the discipline records.</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                            <ShieldAlert className="w-8 h-8 text-primary-foreground" />
                        </div>
                        Student Behavior
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Record and manage disciplinary incidents across the school.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-bold gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Record
                </Button>
            </div>

            <Card className="border-none shadow-2xl shadow-muted/20 bg-card/30 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <BehaviorFilters
                        search={search}
                        onSearchChange={handleSearchChange}
                        status={status}
                        onStatusChange={handleStatusChange}
                        onClear={handleClearFilters}
                    />
                </CardHeader>
                <CardContent className="p-8 pt-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping -z-10" />
                            </div>
                            <p className="text-muted-foreground font-bold animate-pulse">Loading records...</p>
                        </div>
                    ) : (
                        <>
                            <BehaviorTable
                                records={data?.results || []}
                                onViewDetails={handleViewDetails}
                            />

                            <div className="flex items-center justify-between mt-8">
                                <p className="text-sm text-muted-foreground font-medium">
                                    Showing <span className="text-foreground font-bold">{data?.results.length || 0}</span> of <span className="text-foreground font-bold">{data?.count || 0}</span> records
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={!data?.previous || isFetching}
                                        className="w-11 h-11 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/5 text-primary font-bold shadow-inner">
                                        {page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!data?.next || isFetching}
                                        className="w-11 h-11 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <BehaviorModal
                record={selectedRecord}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <CreateBehaviorDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSuccess={() => {
                    refetch();
                    setPage(1);
                }}
            />
        </div>
    );
}
