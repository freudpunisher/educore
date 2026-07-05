import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import {
  type OverviewTab,
  type FinancesTab,
  type SchoolLifeTab,
  type PedagogyTab,
  overviewTabSchema,
  financesTabSchema,
  schoolLifeTabSchema,
  pedagogyTabSchema,
} from "@/types/director-dashboard"

interface DashboardFilters {
  date_range?: string
  academic_year_id?: number
  level_id?: number
  class_id?: number
  gender?: string
}

function buildParams(filters?: DashboardFilters) {
  const params: Record<string, string | number> = {}
  if (filters?.date_range) params.date_range = filters.date_range
  if (filters?.academic_year_id) params.academic_year_id = filters.academic_year_id
  if (filters?.level_id) params.level_id = filters.level_id
  if (filters?.class_id) params.class_id = filters.class_id
  if (filters?.gender) params.gender = filters.gender
  return params
}

export function useDirectorOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["director-dashboard", "overview", filters],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("core/director-dashboard/overview/", {
        params: buildParams(filters),
      })
      return overviewTabSchema.parse(raw?.data ?? raw)
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useDirectorFinances(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["director-dashboard", "finances", filters],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("core/director-dashboard/finances/", {
        params: buildParams(filters),
      })
      return financesTabSchema.parse(raw?.data ?? raw)
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useDirectorSchoolLife(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["director-dashboard", "school-life", filters],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("core/director-dashboard/school-life/", {
        params: buildParams(filters),
      })
      return schoolLifeTabSchema.parse(raw?.data ?? raw)
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useDirectorPedagogy(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["director-dashboard", "pedagogy", filters],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("core/director-dashboard/pedagogy/", {
        params: buildParams(filters),
      })
      return pedagogyTabSchema.parse(raw?.data ?? raw)
    },
    staleTime: 1000 * 60 * 2,
  })
}
