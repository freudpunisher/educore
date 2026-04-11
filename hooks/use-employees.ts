import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedEmployeeListSchema, EmployeeListRequest } from "@/types/employee";

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
