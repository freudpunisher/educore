"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | "maintenance";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    active: {
      bg: "bg-green-100 dark:bg-green-950",
      text: "text-green-700 dark:text-green-300",
      dot: "bg-green-600 dark:bg-green-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-red-100 dark:bg-red-950",
      text: "text-red-700 dark:text-red-300",
      dot: "bg-red-600 dark:bg-red-500",
      label: "Inactive",
    },
    maintenance: {
      bg: "bg-orange-100 dark:bg-orange-950",
      text: "text-orange-700 dark:text-orange-300",
      dot: "bg-orange-600 dark:bg-orange-500",
      label: "Maintenance",
    },
    pending: {
      bg: "bg-blue-100 dark:bg-blue-950",
      text: "text-blue-700 dark:text-blue-300",
      dot: "bg-blue-600 dark:bg-blue-500",
      label: "Pending",
    },
    unknown: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      dot: "bg-slate-400",
      label: "Unknown",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.unknown;

  return (
    <div
      className={cn(
        `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`,
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
      {config.label}
    </div>
  );

}
