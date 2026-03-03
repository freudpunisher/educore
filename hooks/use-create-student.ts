// src/hooks/use-create-student.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { createStudentSchema, CreateStudentData } from "@/lib/schemas/student.Schema";
import toast from "react-hot-toast";

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const response = await axiosInstance.post("users/students/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Élève créé avec succès !");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Erreur lors de la création";
      toast.error(message);
    },
  });
}