import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { 
    paginatedDisciplineRecordSchema, 
    disciplineRecordCreateSchema,
    DisciplineRecordCreate,
    DisciplineReason,
    disciplineReasonSchema,
    configClassroomSchema,
    ConfigClassroom
} from "@/types/discipline";
import { paginatedEnrollmentListSchema, EnrollmentList } from "@/types/enrollment";
import { z } from "zod";

export interface BehaviorQueryParams {
    student_name?: string;
    status?: "recorded" | "appealed" | "cancelled";
    page?: number;
}

export function useBehaviorRecords(params?: BehaviorQueryParams) {
    return useQuery({
        queryKey: ["discipline-records", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/academics/records/", { params });
            return paginatedDisciplineRecordSchema.parse(data);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Fetch students filtered by class_room ID
export function useStudentsByClassLevel(classRoomId: number | null, enabled = true) {
    return useQuery({
        queryKey: ["students", classRoomId],
        queryFn: async () => {
            if (!classRoomId) return [];
            const { data } = await axiosInstance.get("/academics/enrollments/", {
                params: { class_room: classRoomId },
            });
            // Handle nested response structure: { status, message, data: { results: [...] } }
            let enrollments = [];
            if (data?.data?.results) {
                enrollments = data.data.results;
            } else if (data?.results) {
                enrollments = data.results;
            } else if (Array.isArray(data)) {
                enrollments = data;
            }
            return paginatedEnrollmentListSchema.parse({ 
                count: enrollments.length, 
                next: null, 
                previous: null,
                results: enrollments 
            }).results;
        },
        enabled: !!classRoomId && enabled,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch classroom list from config
export function useClassrooms() {
    return useQuery({
        queryKey: ["classrooms"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/config/classrooms/");
            // Handle both paginated and direct array responses
            const classrooms = Array.isArray(data) ? data : (data.results || []);
            // Validate each classroom against schema
            return z.array(configClassroomSchema).parse(classrooms);
        },
        staleTime: 1000 * 60 * 10,
    });
}

// Fetch discipline reasons
export function useDisciplineReasons() {
    return useQuery({
        queryKey: ["discipline-reasons"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/academics/reasons/");
            // Handle nested response structure: { status, message, data: { results: [...] } }
            let reasons = [];
            if (data?.data?.results) {
                reasons = data.data.results;
            } else if (data?.results) {
                reasons = data.results;
            } else if (Array.isArray(data)) {
                reasons = data;
            }
            // Validate against schema
            return z.array(disciplineReasonSchema).parse(reasons);
        },
        staleTime: 1000 * 60 * 30,
    });
}

// Create discipline record
export function useCreateDisciplineRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (record: DisciplineRecordCreate) => {
            const { data } = await axiosInstance.post("/academics/records/", record);
            return disciplineRecordCreateSchema.parse(record); // Validate input
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discipline-records"] });
        },
    });
}
