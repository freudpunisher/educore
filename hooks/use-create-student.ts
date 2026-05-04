// src/hooks/use-create-student.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { CreateStudentData } from "@/lib/schemas/student.Schema";
import { toast } from "@/hooks/use-toast";

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentData | FormData) => {
      const isFormData = data instanceof FormData;
      const response = await axiosInstance.post("users/students/", data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student created successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Error creating student";
      toast.error(message);
    },
  });
}