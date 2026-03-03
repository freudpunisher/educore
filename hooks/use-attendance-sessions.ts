// src/hooks/use-attendance-sessions.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { sessionsArraySchema } from "@/types/attendance";

export function useAttendanceSessions() {
  return useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/attendance-sessions/");
      return sessionsArraySchema.parse(data);
    },
  });
}