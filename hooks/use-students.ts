import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  paginatedStudentListSchema,
  AcademicsEnrollmentsListRequest,
  studentDetailSchema,
  studentAcademicsResponseSchema,
  studentFinanceResponseSchema,
  studentLifeResponseSchema,
  studentServicesResponseSchema,
  studentTransactionsResponseSchema
} from "@/types/student";
import { toast } from "sonner";

export function useStudents(params?: AcademicsEnrollmentsListRequest) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      try {
        const { data: rawResponse } = await axiosInstance.get("users/students/", { params });
        const data = (rawResponse && typeof rawResponse === 'object' && 'status' in rawResponse && rawResponse.status === 'success')
          ? rawResponse.data
          : rawResponse;
        return paginatedStudentListSchema.parse(data);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Issues (useStudents):", JSON.stringify(err.issues, null, 2));
        } else {
          console.error("Unknown Error in useStudents:", err);
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentDetail(id: number | null) {
  return useQuery({
    queryKey: ["students", "detail", id],
    queryFn: async () => {
      if (id === null || isNaN(id)) return null;
      try {
        const response = await axiosInstance.get(`users/students/${id}/`);
        const rawData = response.data;
        const studentData = (rawData && typeof rawData === 'object' && 'status' in rawData && rawData.status === 'success')
          ? rawData.data
          : rawData;
        return studentDetailSchema.parse(studentData);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Issues:", JSON.stringify(err.issues, null, 2));
        } else {
          console.error("Unknown Error in useStudentDetail:", err);
        }
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentAcademics(id: number | null, academicYearId?: number) {
  return useQuery({
    queryKey: ["students", "academics", id, academicYearId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`users/students/${id}/academics/`, {
        params: { academic_year: academicYearId }
      });
      const payload = data.status === 'success' ? data.data : data;
      return studentAcademicsResponseSchema.parse(payload);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentFinance(id: number | null, academicYearId?: number) {
  return useQuery({
    queryKey: ["students", "finance", id, academicYearId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`users/students/${id}/finance/`, {
        params: { academic_year: academicYearId }
      });
      const payload = data.status === 'success' ? data.data : data;
      return studentFinanceResponseSchema.parse(payload);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentLife(id: number | null, academicYearId?: number) {
  return useQuery({
    queryKey: ["students", "life", id, academicYearId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`users/students/${id}/life/`, {
        params: { academic_year: academicYearId }
      });
      const payload = data.status === 'success' ? data.data : data;
      return studentLifeResponseSchema.parse(payload);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentServices(id: number | null, academicYearId?: number) {
  return useQuery({
    queryKey: ["students", "services", id, academicYearId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`users/students/${id}/services/`, {
        params: { academic_year: academicYearId }
      });
      const payload = data.status === 'success' ? data.data : data;
      return studentServicesResponseSchema.parse(payload);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentTransactions(id: number | null, academicYearId?: number) {
  return useQuery({
    queryKey: ["students", "transactions", id, academicYearId],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(`users/students/${id}/transactions/`, {
        params: { academic_year: academicYearId }
      });
      const payload = data.status === 'success' ? data.data : data;
      return studentTransactionsResponseSchema.parse(payload);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadStudentDocument(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosInstance.post(`users/student-documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", studentId] });
      toast.success("Document uploaded successfully");
    },
    onError: (err: any) => {
      console.error("Document Upload Error:", err);
      toast.error("Failed to upload document");
    },
  });
}

export function useValidateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: number) => {
      const { data } = await axiosInstance.post(`users/students/${studentId}/validate/`);
      return data;
    },
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", studentId] });
      toast.success("Élève validé avec succès");
    },
    onError: (err: any) => {
      console.error("Student Validation Error:", err);
      toast.error("Échec de la validation de l'élève");
    },
  });
}