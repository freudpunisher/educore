import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedEmployeeListSchema, EmployeeListRequest, EmployeeCreateInput } from "@/types/employee";
import { toast } from "sonner";

export function useEmployees(params?: EmployeeListRequest) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: async () => {
      // We use the specific 'employees' action we added to AccountViewSet
      const { data } = await axiosInstance.get("users/accounts/employees/", { params });
      
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
      const errorMessage = error.response?.data?.message || "Failed to create employee";
      toast.error(errorMessage);
    },
  });
}

