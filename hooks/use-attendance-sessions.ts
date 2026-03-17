import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedAttendanceSessionSchema } from "@/types/attendance";

export function useAttendanceSessions() {
  return useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/attendance-sessions/");
      return paginatedAttendanceSessionSchema.parse(data);
    },
  });
}