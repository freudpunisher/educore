import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedEmployeeListSchema, EmployeeListRequest, EmployeeCreateInput } from "@/types/employee";
import { toast } from "sonner";

export function useEmployees(params?: EmployeeListRequest) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("users/accounts/", { params });
      
      // The backend uses StandardResponseMixin, so it might be wrapped in 'data'
      const rawData = (data && typeof data === 'object' && 'status' in data && data.status === 'success')
        ? data.data
        : data;

      return paginatedEmployeeListSchema.parse(rawData);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EmployeeCreateInput) => {
      const { data } = await axiosInstance.post("users/accounts/", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (error: any) => {
      const data = error.response?.data;
      let errorMessage = data?.message || "Failed to create employee";

      if (data?.errors?.detail) {
        const detail = data.errors.detail;
        if (detail.includes("duplicate key") && detail.includes("username")) {
          errorMessage = "This username is already taken. Please choose a different one.";
        } else if (detail.includes("duplicate key") && detail.includes("email")) {
          errorMessage = "This email is already in use. Please use a different email.";
        } else {
          errorMessage = data.errors.detail;
        }
      }

      toast.error(errorMessage, { duration: 6000 });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`users/accounts/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Account deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete account";
      toast.error(message, { duration: 6000 });
    },
  });
}

export function useRestoreEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.post(`users/accounts/${id}/restore/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Account restored successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to restore account";
      toast.error(message, { duration: 6000 });
    },
  });
}

export function useToggleEmployeeActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.post(`users/accounts/${id}/toggle_active/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to toggle account status";
      toast.error(message, { duration: 6000 });
    },
  });
}

