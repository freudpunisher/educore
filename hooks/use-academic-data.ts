// src/hooks/use-academic-data.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { academicYearSchema, classRoomSchema, EnrollmentCreate } from "@/types/enrollment";
import { z } from "zod";
import toast from "react-hot-toast";

const yearsSchema = z.array(academicYearSchema);
const classesSchema = z.array(classRoomSchema);

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("academics/years/");
      console.log("Academic Years:", data);
      return yearsSchema.parse(data);
    },
  });
}

export function useClassRooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/config/classrooms/");
      return classesSchema.parse(data);
    },
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollmentCreate) => {
      const res = await axiosInstance.post("/api/v1/academics/enrollments/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Inscription effectuée avec succès !");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Impossible d’inscrire l’élève";
      toast.error(message);
    },
  });
}