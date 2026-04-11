import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
    paginatedTransportVehicleSchema,
    VehicleCreate,
    paginatedTransportDriverSchema,
    paginatedTransportItinerarySchema,
    paginatedTransportSubscriptionSchema,
    transportSubscriptionSchema,
    TransportSubscriptionCreate,
    TransportDashboardStats,
    transportDashboardStatsSchema,
    TransportCheckInList,
    transportCheckInListSchema
} from "@/types/transport";

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

export function useDrivers(params?: { page?: number; search?: string }) {
    return useQuery({
        queryKey: ["transport-drivers", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/transport/driver/", { params });
            const rawData = data?.data || data;
            return paginatedTransportDriverSchema.parse(rawData);
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useItineraries(params?: { page?: number; search?: string }) {
    return useQuery({
        queryKey: ["transport-itineraries", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/transport/itinerary/", { params });
            const rawData = data?.data || data;
            return paginatedTransportItinerarySchema.parse(rawData);
        },
        staleTime: 1000 * 60 * 5,
    });
}
export function useTransportSubscriptions(params?: {
    page?: number;
    search?: string;
    status?: string;
    student?: string | number;
}) {
    return useQuery({
        queryKey: ["transport-subscriptions", params],
        queryFn: async () => {
            try {
                const { data: rawResponse } = await axiosInstance.get("/transport/subscriptions/", { params });

                // Extract the 'data' part if the response is wrapped
                const data = (rawResponse && typeof rawResponse === 'object' && 'status' in rawResponse && rawResponse.status === 'success')
                    ? rawResponse.data
                    : rawResponse;

                console.log("Subscriptions API Data:", data);
                return paginatedTransportSubscriptionSchema.parse(data);
            } catch (err: any) {
                if (err.name === "ZodError") {
                    console.error("Zod Validation Issues (useTransportSubscriptions):", JSON.stringify(err.issues, null, 2));
                } else {
                    console.error("Unknown Error in useTransportSubscriptions:", err);
                }
                throw err;
            }
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateTransportSubscription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: TransportSubscriptionCreate) => {
            const response = await axiosInstance.post("/transport/subscriptions/", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transport-subscriptions"] });
        },
    });
}

export function useUpdateTransportSubscription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<TransportSubscriptionCreate> }) => {
            const response = await axiosInstance.patch(`/transport/subscriptions/${id}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transport-subscriptions"] });
        },
    });
}

export function useTransportDashboard() {
    return useQuery({
        queryKey: ["transport-dashboard"],
        queryFn: async () => {
            const { data: rawResponse } = await axiosInstance.get("/transport/dashboard/");

            // Extract the 'data' part if the response is wrapped
            const data = (rawResponse && typeof rawResponse === 'object' && 'status' in rawResponse && rawResponse.status === 'success')
                ? rawResponse.data
                : rawResponse;

            return transportDashboardStatsSchema.parse(data);
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useTransportCheckIns(params: {
    page?: number;
    search?: string;
    status?: string | boolean;
} = {}) {
    return useQuery({
        queryKey: ["transport-check-ins", params],
        queryFn: async () => {
            const { data: rawResponse } = await axiosInstance.get("/transport/transport-check-in/", {
                params: {
                    page: params.page || 1,
                    search: params.search || undefined,
                    status: params.status,
                }
            });

            // Handle standard wrapper if present
            const data = (rawResponse && typeof rawResponse === 'object' && 'status' in rawResponse && rawResponse.status === 'success')
                ? rawResponse.data
                : rawResponse;

            try {
                return transportCheckInListSchema.parse(data);
            } catch (err) {
                console.error("Zod Validation Error for Transport Check-Ins:", err);
                // Return data as-is to avoid crashing the UI if strictly typed schemas break
                return data as TransportCheckInList;
            }
        },
    });
}

