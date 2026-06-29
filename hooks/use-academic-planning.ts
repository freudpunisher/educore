import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

// ──────────────────────────────────────────────
//  Course Teacher Assignment
// ──────────────────────────────────────────────
export function useUpdateCourseTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, teacher }: { courseId: number; teacher: number | null }) => {
      const { data } = await axiosInstance.patch(`/config/courses/${courseId}/`, {
        teacher: teacher,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast.success("Teacher assigned to course");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to assign teacher";
      toast.error(message);
    },
  });
}

// ──────────────────────────────────────────────
//  Academic Year CRUD
// ──────────────────────────────────────────────
export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { start_year: number; end_year: number; is_current?: boolean }) => {
      const response = await axiosInstance.post("/academics/years/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Academic year created");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create academic year";
      toast.error(message);
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { start_year?: number; end_year?: number; is_current?: boolean } }) => {
      const response = await axiosInstance.patch(`/academics/years/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Academic year updated");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update academic year";
      toast.error(message);
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/academics/years/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Academic year deleted");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to delete academic year";
      toast.error(message);
    },
  });
}

// ──────────────────────────────────────────────
//  Term CRUD
// ──────────────────────────────────────────────
export function useCreateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { academic_year: number; name: string; start_date: string; end_date: string }) => {
      const response = await axiosInstance.post("/academics/terms/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success("Term created");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create term";
      toast.error(message);
    },
  });
}

export function useUpdateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; start_date?: string; end_date?: string } }) => {
      const response = await axiosInstance.patch(`/academics/terms/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success("Term updated");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update term";
      toast.error(message);
    },
  });
}

export function useDeleteTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/academics/terms/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success("Term deleted");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to delete term";
      toast.error(message);
    },
  });
}
