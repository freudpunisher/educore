import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface AuditLog {
  id: number;
  user_display: string;
  username: string;
  role: string;
  action: string;
  action_display: string;
  criticality: string;
  criticality_display: string;
  module: string;
  object_type: string;
  object_id: number | null;
  description: string;
  status: string;
  status_display: string;
  ip_address: string;
  endpoint: string;
  created_at: string;
  is_critical: boolean;
  is_suspicious: boolean;
}

export interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

interface AuditParams {
  page?: number;
  search?: string;
  username?: string;
  role?: string;
  module?: string;
  action?: string;
  status?: string;
  criticality?: string;
  date_gte?: string;
  date_lte?: string;
}

export function useAuditLogs(params: AuditParams = {}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await api.get<AuditLogsResponse>("/audit/audit-logs/", {
        params: {
          ...params,
          // DRF filters matching the viewset filterset_fields
          created_at__gte: params.date_gte,
          created_at__lte: params.date_lte,
        },
      });
      // Handle standard response wrapper if present
      if (response.data && "status" in response.data && response.data.status === "success") {
          return (response.data as any).data as AuditLogsResponse;
      }
      return response.data;
    },
  });
}

export function useAuditAnalytics() {
  return useQuery({
    queryKey: ["audit-analytics"],
    queryFn: async () => {
      const response = await api.get("/audit/audit-logs/analytics/");
      if (response.data && "status" in response.data && response.data.status === "success") {
          return (response.data as any).data;
      }
      return response.data;
    },
  });
}
