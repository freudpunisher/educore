import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedStudentListSchema, AcademicsEnrollmentsListRequest, studentDetailSchema } from "@/types/student";

export function useStudents(params?: AcademicsEnrollmentsListRequest) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("users/students/", { params });
      // Safe parsing — will throw clear error if API changes
      return paginatedStudentListSchema.parse(data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentDetail(id: number | null) {
  return useQuery({
    queryKey: ["students", "detail", id],
    queryFn: async () => {
      if (id === null || isNaN(id)) return null;
      try {
        const response = await axiosInstance.get(`users/students/${id}/`);
        // Handle potential double-wrapping or interceptor bypass
        const rawData = response.data;
        const studentData = (rawData && typeof rawData === 'object' && 'status' in rawData && rawData.status === 'success')
          ? rawData.data
          : rawData;

        console.log("Processing Student Data:", studentData);
        return studentDetailSchema.parse(studentData);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Issues:", JSON.stringify(err.issues, null, 2));
        } else {
          console.error("Unknown Error in useStudentDetail:", err);
        }
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}