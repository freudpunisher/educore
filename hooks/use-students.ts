import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedStudentListSchema } from "@/types/student";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("users/students/");
      // Safe parsing — will throw clear error if API changes
      return paginatedStudentListSchema.parse(data);
    },
    staleTime: 1000 * 60 * 5,
  });
}