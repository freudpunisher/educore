import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedSchoolEventSchema, schoolEventSchema, type SchoolEventCreate, type PaginatedSchoolEvent, type SchoolEvent } from "@/types/academics";

export function useEvents(params?: { start_date?: string; end_date?: string }) {
    return useQuery({
        queryKey: ["academics-events", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/academics/events/", {
                params: params,
            });
            // Validate with Zod
            const validated = paginatedSchoolEventSchema.parse(data);
            return validated;
        },
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SchoolEventCreate) => {
            const { data } = await axiosInstance.post("/academics/events/", payload);
            return schoolEventSchema.parse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["academics-events"] });
        },
    });
}
