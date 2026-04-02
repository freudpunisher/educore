"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | "maintenance";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusConfig = {
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
  };

  const config = statusConfig[status];

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
