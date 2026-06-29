// src/hooks/use-create-student.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { CreateStudentData } from "@/lib/schemas/student.Schema";
import { toast } from "@/hooks/use-toast";

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentData | FormData) => {
      const response = await axiosInstance.post("users/students/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"], refetchType: "all" });
      toast.success("Student created successfully!");
    },
    onError: (error: any) => {
      const errData = error?.response?.data;
      const message =
        errData?.message ||
        errData?.detail ||
        "Error creating student";
      const fieldErrors = errData?.errors;
      const detail =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.entries(fieldErrors)
              .map(([field, msgs]) =>
                Array.isArray(msgs) ? `${field}: ${msgs.join(", ")}` : `${field}: ${msgs}`
              )
              .join(" | ")
          : null;
      toast.error(detail || message);
    },
  });
}