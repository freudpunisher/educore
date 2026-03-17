import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedAcademicYearSchema, paginatedClassRoomSchema, EnrollmentCreate } from "@/types/enrollment";
import { z } from "zod";
import toast from "react-hot-toast";

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("academics/years/");
      console.log("Academic Years:", data);
      const parsed = paginatedAcademicYearSchema.parse(data);
      return parsed.results;
    },
  });
}

export function useClassRooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/config/classrooms/");
      const parsed = paginatedClassRoomSchema.parse(data);
      return parsed.results;
    },
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
      toast.success("Enrollment successful!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Could not enroll student";
      toast.error(message);
    },
  });
}