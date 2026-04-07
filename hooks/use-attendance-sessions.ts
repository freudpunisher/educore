import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedAttendanceSessionSchema, AttendanceSessionCreate } from "@/types/attendance";
import toast from "react-hot-toast";

export function useAttendanceSessions() {
  return useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/attendance-sessions/");
      return paginatedAttendanceSessionSchema.parse(data);
    },
  });
}

export function useAttendanceSessionDetail(id: string | number | null) {
  return useQuery({
    queryKey: ["attendance-sessions", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`/academics/attendance-sessions/${id}/`);
      return data; // Individual session detail
    },
    enabled: !!id,
  });
}

export function useCreateAttendanceSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AttendanceSessionCreate) => {
      const resp = await axiosInstance.post("/academics/attendance-sessions/", data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Séance créée avec succès !");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erreur lors de la création de la séance";
      toast.error(message);
    },
  });
}