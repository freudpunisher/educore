import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { z } from "zod";

const dashboardSchema = z.object({
    students: z.object({
        total: z.number(),
        enrolled: z.number(),
        inactive: z.number(),
    }),
    finance: z.object({
        total_invoiced: z.number(),
        total_paid: z.number(),
        balance: z.number(),
    }),
}).passthrough();

export type DashboardData = z.infer<typeof dashboardSchema>;

export function useDashboard() {
    return useQuery({
        queryKey: ["core", "dashboard"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/core/dashboard/");
            const raw = data?.data || data;
            return dashboardSchema.parse(raw);
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
