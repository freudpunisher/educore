import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedAcademicYearSchema, paginatedClassRoomSchema, paginatedEnrollmentListSchema, EnrollmentCreate } from "@/types/enrollment";
import { feesPreviewSchema } from "@/types/finance";
import { z } from "zod";
import toast from "react-hot-toast";

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("academics/years/");
      const parsed = paginatedAcademicYearSchema.parse(data);
      return parsed.results;
    },
  });
}

export function useClassRooms(search?: string) {
  return useQuery({
    queryKey: ["classrooms", search],
    queryFn: async () => {
      let url = "/config/classrooms/";
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const { data } = await axiosInstance.get(url);
      const parsed = paginatedClassRoomSchema.parse(data);
      return parsed.results;
    },
  });
}

export function useClassRoom(id: string | number) {
  return useQuery({
    queryKey: ["classroom", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/config/classrooms/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

export function useClassroomFeesPreview(id: number | null) {
  return useQuery({
    queryKey: ["classroom-fees-preview", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/config/classrooms/${id}/fees-preview/`);
      return feesPreviewSchema.parse(data?.data || data);
    },
    enabled: !!id,
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollmentCreate) => {
      const res = await axiosInstance.post("/academics/enrollments/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["recent-enrollments"] });
      toast.success("Enrollment successful!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Could not enroll student";
      toast.error(message);
    },
  });
}

export function useTerms(academicYearId?: number) {
  return useQuery({
    queryKey: ["terms", academicYearId],
    queryFn: async () => {
      const params = academicYearId ? { academic_year: academicYearId } : {};
      const { data } = await axiosInstance.get("/academics/terms/", { params });
      return data?.results || data || [];
    },
    enabled: true,
  });
}

export function useRecentEnrollments(limit: number = 5, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["recent-enrollments", limit],
    ...options,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/enrollments/", {
        params: { page_size: limit, ordering: "-date_enrolled" },
      });
      const parsed = paginatedEnrollmentListSchema.parse(data);
      return parsed.results;
    },
    staleTime: 1000 * 60 * 2,
  });
}