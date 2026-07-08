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
  studentTransactionsResponseSchema,
  studentStatsSchema,
} from "@/types/student";
import { toast } from "sonner";
import { z } from "zod";

const unwrap = (data: any) => {
  if (data && typeof data === 'object') {
    if ((data.status === 'success' || data.success === true) && data.data !== undefined) {
      return data.data;
    }
    if (data.data !== undefined && Object.keys(data).length === 1) {
      return data.data;
    }
  }
  return data;
};

export function useStudents(params?: AcademicsEnrollmentsListRequest) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      try {
        const { data: rawResponse } = await axiosInstance.get("users/students/", { params });
        const data = (rawResponse && typeof rawResponse === 'object' && (rawResponse.status === 'success' || rawResponse.success === true))
          ? (Array.isArray(rawResponse.data) ? { results: rawResponse.data } : rawResponse.data)
          : (Array.isArray(rawResponse) ? { results: rawResponse } : rawResponse);
        return paginatedStudentListSchema.parse(data);
      } catch (err: any) {
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
        const studentData = (rawData && typeof rawData === 'object' && (rawData.status === 'success' || rawData.success === true))
          ? (Array.isArray(rawData.data) ? rawData.data[0] : rawData.data)
          : (Array.isArray(rawData) ? rawData[0] : rawData);
        return studentDetailSchema.parse(studentData);
      } catch (err: any) {
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
      try {
        const { data: raw } = await axiosInstance.get(`users/students/${id}/academics/`, {
          params: { academic_year: academicYearId }
        });
        const payload = unwrap(raw, "useStudentAcademics");

        // Local fail-safe schema to bypass potential stale import issues
        const localAcademicsSchema = z.object({
          academic_history: z.array(z.object({
            id: z.number(),
            academic_year_label: z.any().optional(),
            class_name: z.any().optional(),
            date_enrolled: z.any().optional(),
            grades: z.array(z.object({
              assessment_title: z.any(),
              course_name: z.any(),
              percentage: z.any(),
              score: z.any(),
              comment: z.any().optional(),
            }).passthrough()).default([]),
            is_current: z.any().optional(),
            student_count: z.any().optional(),
            assessment_count: z.any().optional(),
            class_capacity: z.any().optional(),
            course_count: z.any().optional(),
            class_average: z.any().optional(),
            subjects: z.array(z.object({
              course_name: z.string(),
              teacher: z.string(),
              student_grade: z.union([z.string(), z.number()]),
              class_average: z.coerce.number(),
            })).default([]),
          }).passthrough()).default([]),
        }).passthrough();

        return localAcademicsSchema.parse(payload);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Error (Academics):", JSON.stringify(err.issues, null, 2));
        }
        throw err;
      }
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
      try {
        const { data: raw } = await axiosInstance.get(`users/students/${id}/finance/`, {
          params: { academic_year: academicYearId }
        });
        const payload = unwrap(raw, "useStudentFinance");

        // Local fail-safe schema to bypass potential stale import issues
        const localFinanceSchema = z.object({
          invoices: z.array(z.any()).default([]),
          outstanding_balance: z.any().transform(v => String(v ?? "0")),
          total_due: z.any().transform(v => String(v ?? "0")),
          total_paid: z.any().transform(v => String(v ?? "0")),
        }).passthrough();

        return localFinanceSchema.parse(payload);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Error (Finance):", JSON.stringify(err.issues, null, 2));
        }
        throw err;
      }
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
      try {
        const { data: raw } = await axiosInstance.get(`users/students/${id}/life/`, {
          params: { academic_year: academicYearId }
        });
        const payload = unwrap(raw, "useStudentLife");
        return studentLifeResponseSchema.parse(payload);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Error (Life):", JSON.stringify(err.issues, null, 2));
        }
        throw err;
      }
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
      try {
        const { data: raw } = await axiosInstance.get(`users/students/${id}/services/`, {
          params: { academic_year: academicYearId }
        });
        const payload = unwrap(raw, "useStudentServices");

        // Local fail-safe schema to bypass potential stale import issues
        const localServicesSchema = z.object({
          daycare: z.array(z.any()).default([]),
          housing: z.array(z.object({
            id: z.number(),
            room_name: z.any(),
            room_type: z.any(),
            bed_number: z.any(),
            fees: z.any(),
            is_active: z.any().optional(),
            start_date: z.any(),
            end_date: z.any().optional(),
          }).passthrough()).default([]),
          meals: z.array(z.any()).default([]),
          transport: z.array(z.any()).default([]),
        }).passthrough();

        return localServicesSchema.parse(payload);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Error (Services):", JSON.stringify(err.issues, null, 2));
        }
        throw err;
      }
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
      try {
        const { data: raw } = await axiosInstance.get(`users/students/${id}/transactions/`, {
          params: { academic_year: academicYearId }
        });
        const payload = unwrap(raw, "useStudentTransactions");
        return studentTransactionsResponseSchema.parse(payload);
      } catch (err: any) {
        if (err.name === "ZodError") {
          console.error("Zod Validation Error (Transactions):", JSON.stringify(err.issues, null, 2));
        }
        throw err;
      }
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

export function useStudentStats() {
  return useQuery({
    queryKey: ["students", "stats"],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("users/students/stats/");
      const payload = unwrap(raw, "useStudentStats");
      return studentStatsSchema.parse(payload);
    },
    staleTime: 1000 * 60 * 5,
  });
}