import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
    ClassRoom,
    TimetableSlot,
    Course,
    Teacher,
    TimetableListRequest
} from "@/types/timetable";
import { toast } from "sonner";

export function useTimetable(params: TimetableListRequest) {
    return useQuery<TimetableSlot[]>({
        queryKey: ["timetable", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("config/timetable/", { params });
            return data?.results || data || [];
        },
        enabled: !!params.classroom,
    });
}

export function useClassRooms() {
    return useQuery<ClassRoom[]>({
        queryKey: ["classrooms"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("config/classrooms/");
            return data?.results || data || [];
        },
    });
}

export function useCourses(classroom?: string | number) {
    return useQuery<Course[]>({
        queryKey: ["courses", classroom],
        queryFn: async () => {
            const { data } = await axiosInstance.get("config/courses/", {
                params: { classroom }
            });
            return data?.results || data || [];
        },
        enabled: !!classroom,
    });
}

export function useTeachers() {
    return useQuery<Teacher[]>({
        queryKey: ["teachers"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("users/accounts/?role=teacher");
            return data?.results || data || [];
        },
    });
}

export function useCreateTimetableSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newSlot: any) => {
            const { data } = await axiosInstance.post("config/timetable/", newSlot);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timetable"] });
            toast.success("Timetable slot created successfully");
        },
        onError: () => {
            toast.error("Failed to create timetable slot");
        },
    });
}
