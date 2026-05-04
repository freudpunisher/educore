import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { z } from "zod";

const kpiCardSchema = z.object({
    label: z.string(),
    value: z.number().or(z.string()),
    icon: z.string().optional(),
    color: z.string().optional(),
}).passthrough();

const dashboardSchema = z.object({
    role: z.string(),
    students: z.object({
        total: z.number(),
        enrolled: z.number(),
        inactive: z.number(),
    }).optional(),
    finance: z.object({
        total_invoiced: z.number(),
        total_paid: z.number(),
        balance: z.number(),
    }).optional(),
    assessments: z.object({
        total: z.number(),
    }).optional(),
    attendance: z.object({
        total_records: z.number(),
    }).optional(),
    staff: z.object({
        total: z.number(),
    }).optional(),
    users: z.object({
        total: z.number(),
    }).optional(),
    kpis: z.record(z.string(), z.number().or(z.string())).optional(),
}).passthrough();

export type DashboardData = z.infer<typeof dashboardSchema>;

export function useDashboard() {
    return useQuery({
        queryKey: ["core", "dashboard"],
        queryFn: async () => {
            // Appelle /api/core/dashboard-stats/ (endpoint du ViewSet)
            // Le hook va utiliser les données dynamiques selon le rôle
            const { data } = await axiosInstance.get("core/dashboard-stats/");
            const raw = data?.data || data;
            return dashboardSchema.parse(raw);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
