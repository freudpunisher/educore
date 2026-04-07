"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage change (positive or negative)
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = "",
}: KpiCardProps) {
  const isTrendPositive = trend && trend > 0;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 transition-all hover:shadow-lg dark:hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          {isTrendPositive ? (
            <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-semibold ${
              isTrendPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {Math.abs(trend)}% vs last quarter
          </span>
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-muted-foreground dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
