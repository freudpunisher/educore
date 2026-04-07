import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedTransportVehicleSchema, VehicleCreate } from "@/types/transport";

export function useVehicles(params?: { page?: number; status?: string; search?: string }) {
    return useQuery({
        queryKey: ["transport-vehicles", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/transport/vehicle/", { params });
            // Handle nested response if applicable: { status, message, data: { ... } }
            const paginatedData = data?.data || data;
            return paginatedTransportVehicleSchema.parse(paginatedData);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: VehicleCreate) => {
            const response = await axiosInstance.post("/transport/vehicle/", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transport-vehicles"] });
        },
    });
}

export function useUpdateVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<VehicleCreate> }) => {
            const response = await axiosInstance.patch(`/transport/vehicle/${id}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transport-vehicles"] });
        },
    });
}
