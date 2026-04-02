"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  itemsPerPage?: number;
  searchableColumns?: (keyof T)[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  itemsPerPage = 10,
  searchableColumns = [],
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      searchableColumns.some((column) => {
        const value = String(item[column]).toLowerCase();
        return value.includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchableColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="space-y-4">
      {searchableColumns.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                      column.sortable ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-slate-200 dark:border-slate-700 ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" : ""
                    } ${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300"
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-muted-foreground dark:text-slate-400"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
