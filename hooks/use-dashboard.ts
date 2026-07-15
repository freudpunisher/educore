import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { z } from "zod";

const financeByTermSchema = z.object({
  term_name: z.string(),
  total_invoiced: z.number(),
  total_paid: z.number(),
  balance: z.number(),
});

const transportSchema = z.object({
  total_vehicles: z.number().optional(),
  total_drivers: z.number().optional(),
  total_itineraries: z.number().optional(),
  total_students: z.number().optional(),
});

const daycareSchema = z.object({
  total_children: z.number().optional(),
  total_records: z.number().optional(),
});

const boardingSchema = z.object({
  total_students: z.number().optional(),
  total_rooms: z.number().optional(),
  total_beds: z.number().optional(),
  occupied_beds: z.number().optional(),
});

const restaurantSchema = z.object({
  total_subscribers: z.number().optional(),
  total_meals_served: z.number().optional(),
});

const storageSchema = z.object({
  total_products: z.number().optional(),
  total_stock_entries: z.number().optional(),
});

const academicYearSchema = z.object({
  id: z.number(),
  label: z.string(),
  is_current: z.boolean(),
});

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
  finance_by_term: z.array(financeByTermSchema).optional(),
  transport: transportSchema.optional(),
  daycare: daycareSchema.optional(),
  boarding: boardingSchema.optional(),
  restaurant: restaurantSchema.optional(),
  storage: storageSchema.optional(),
  academic_years: z.array(academicYearSchema).optional(),
  selected_academic_year: z.string().nullable().optional(),
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
export type AcademicYear = z.infer<typeof academicYearSchema>;

export function useDashboard(academicYearId?: number | null, enabled = true) {
  const params = academicYearId ? { academic_year_id: academicYearId } : {};
  return useQuery({
    queryKey: ["core", "dashboard", academicYearId],
    queryFn: async () => {
      const { data } = await axiosInstance.get("core/dashboard-stats/", { params });
      const raw = data?.data || data;
      return dashboardSchema.parse(raw);
    },
    staleTime: 1000 * 60 * 2,
    enabled,
  });
}
