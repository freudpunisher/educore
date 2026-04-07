"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BehaviorFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    onClear: () => void;
}

export function BehaviorFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onClear,
}: BehaviorFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by student name..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-muted-foreground/20 focus:ring-primary/20 transition-all"
                />
            </div>

            <div className="flex gap-3">
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[180px] h-11 rounded-xl border-muted-foreground/20">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="recorded">Recorded</SelectItem>
                        <SelectItem value="appealed">Appealed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                {(search || status !== "all") && (
                    <Button
                        variant="ghost"
                        onClick={onClear}
                        className="h-11 px-4 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
