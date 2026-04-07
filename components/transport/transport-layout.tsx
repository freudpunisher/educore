"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Truck,
  Users,
  Route,
  Car,
  CheckCircle,
} from "lucide-react";

const transportTabs = [
  { label: "Subscription", href: "/dashboard/transport/subscription", icon: Users },
  { label: "Itinerary", href: "/dashboard/transport/itinerary", icon: Route },
  { label: "Driver", href: "/dashboard/transport/driver", icon: Users },
  { label: "Vehicle", href: "/dashboard/transport/vehicle", icon: Car },
  { label: "Verification Check", href: "/dashboard/transport/verification", icon: CheckCircle },
];

interface TransportLayoutProps {
  children: React.ReactNode;
}

export function TransportLayout({ children }: TransportLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 py-6 px-4">
        <div className="space-y-4">
          <Link href="/dashboard/transport" className="flex items-center gap-2 px-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Transport</span>
          </Link>

          <nav className="space-y-2 mt-8">
            {transportTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-6 px-6">
        {children}
      </main>
    </div>
  );
}
