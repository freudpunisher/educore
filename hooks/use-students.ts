import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedStudentListSchema, AcademicsEnrollmentsListRequest, studentDetailSchema } from "@/types/student";
import { toast } from "sonner";

export function useStudents(params?: AcademicsEnrollmentsListRequest) {
  // ... existing implementation ...
}

export function useStudentDetail(id: number | null) {
  // ... existing implementation ...
}

export function useUploadStudentDocument(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosInstance.post(`users/students/${studentId}/documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", studentId] });
      toast.success("Document uploaded successfully");
    },
    onError: (err: any) => {
      console.error("Document Upload Error:", err);
      toast.error("Failed to upload document");
    },
  });
}