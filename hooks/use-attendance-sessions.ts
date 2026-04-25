import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import {
  paginatedAttendanceSessionSchema,
  AttendanceSessionCreate,
  BulkMarkPayload,
  BulkExamMarkPayload,
  BulkSchoolMarkPayload,
  paginatedExamAttendanceSchema,
  paginatedSchoolDailyAttendanceSchema,
  paginatedClassAttendanceSummarySchema,
  AttendanceStats,
} from "@/types/attendance";

// ---------------------------------------------------------------------------
// AttendanceSession hooks
// ---------------------------------------------------------------------------

export function useAttendanceSessions(params?: {
  session_type?: string;
  classroom?: number;
  is_locked?: boolean;
  date?: string;
}) {
  return useQuery({
    queryKey: ["attendance-sessions", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/attendance-sessions/", {
        params,
      });
      const raw = data?.data || data;
      return paginatedAttendanceSessionSchema.parse(raw);
    },
  });
}

export function useAttendanceSessionDetail(id: string | number | null) {
  return useQuery({
    queryKey: ["attendance-sessions", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get(
        `/academics/attendance-sessions/${id}/`
      );
      return data?.data || data;
    },
    enabled: !!id,
  });
}

export function useCreateAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceSessionCreate) => {
      const resp = await axiosInstance.post("/academics/attendance-sessions/", data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Séance créée avec succès !");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erreur lors de la création";
      toast.error(message);
    },
  });
}

export function useLockSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { data } = await axiosInstance.post(
        `/academics/attendance-sessions/${sessionId}/lock/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Séance verrouillée");
    },
    onError: () => toast.error("Erreur lors du verrouillage"),
  });
}

export function useUnlockSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const { data } = await axiosInstance.post(
        `/academics/attendance-sessions/${sessionId}/unlock/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Séance déverrouillée");
    },
    onError: () => toast.error("Erreur lors du déverrouillage"),
  });
}

// ---------------------------------------------------------------------------
// StudentAttendance — Bulk mark (courses)
// ---------------------------------------------------------------------------

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkMarkPayload) => {
      const { data } = await axiosInstance.post(
        "/academics/attendances/bulk_mark/",
        payload
      );
      return data?.data || data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["student-attendances"] });
      const total = (result?.created || 0) + (result?.updated || 0);
      toast.success(`✅ ${total} présence(s) enregistrée(s)`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(message);
    },
  });
}

export function useStudentAttendanceHistory(
  studentId: number | null,
  classroomId?: number | null
) {
  return useQuery({
    queryKey: ["student-attendance-history", studentId, classroomId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/academics/attendances/student_history/",
        {
          params: {
            student_id: studentId,
            ...(classroomId ? { classroom_id: classroomId } : {}),
          },
        }
      );
      return data?.data || data;
    },
    enabled: !!studentId,
  });
}

// ---------------------------------------------------------------------------
// ExamAttendance hooks
// ---------------------------------------------------------------------------

export function useExamAttendances(params?: {
  assessment?: number;
  student?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["exam-attendances", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/exam-attendances/", {
        params,
      });
      const raw = data?.data || data;
      return paginatedExamAttendanceSchema.parse(raw);
    },
    enabled: !!(params?.assessment || params?.student),
  });
}

export function useExamAttendanceByAssessment(assessmentId: number | null) {
  return useQuery({
    queryKey: ["exam-attendances-by-assessment", assessmentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/academics/exam-attendances/by_assessment/",
        { params: { assessment_id: assessmentId } }
      );
      return data?.data || data;
    },
    enabled: !!assessmentId,
  });
}

export function useBulkMarkExamAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkExamMarkPayload) => {
      const { data } = await axiosInstance.post(
        "/academics/exam-attendances/bulk_mark/",
        payload
      );
      return data?.data || data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["exam-attendances"] });
      queryClient.invalidateQueries({ queryKey: ["exam-attendances-by-assessment"] });
      const total = (result?.created || 0) + (result?.updated || 0);
      toast.success(`✅ ${total} présence(s) examen enregistrée(s)`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Erreur lors de l'enregistrement examen"
      );
    },
  });
}

// ---------------------------------------------------------------------------
// SchoolDailyAttendance hooks
// ---------------------------------------------------------------------------

export function useSchoolDailyAttendances(params?: {
  "enrollment__class_room"?: number;
  date?: string;
  "date__gte"?: string;
  "date__lte"?: string;
  status?: string;
  student?: number;
}) {
  return useQuery({
    queryKey: ["school-daily-attendances", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/school-attendances/", {
        params,
      });
      const raw = data?.data || data;
      return paginatedSchoolDailyAttendanceSchema.parse(raw);
    },
  });
}

export function useSchoolDailyAttendanceSummary(
  classroomId: number | null,
  date: string | null
) {
  return useQuery({
    queryKey: ["school-daily-summary", classroomId, date],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/academics/school-attendances/daily_summary/",
        { params: { classroom_id: classroomId, date } }
      );
      return data?.data || data;
    },
    enabled: !!classroomId && !!date,
  });
}

export function useBulkMarkSchoolAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkSchoolMarkPayload) => {
      const { data } = await axiosInstance.post(
        "/academics/school-attendances/bulk_mark/",
        payload
      );
      return data?.data || data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["school-daily-attendances"] });
      queryClient.invalidateQueries({ queryKey: ["school-daily-summary"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summaries"] });
      const total = (result?.created || 0) + (result?.updated || 0);
      toast.success(`✅ ${total} présence(s) journalière(s) enregistrée(s)`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    },
  });
}

// ---------------------------------------------------------------------------
// ClassAttendanceSummary hooks
// ---------------------------------------------------------------------------

export function useAttendanceSummaries(params?: {
  classroom?: number;
  "date__gte"?: string;
  "date__lte"?: string;
}) {
  return useQuery({
    queryKey: ["attendance-summaries", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/academics/attendance-summaries/",
        { params }
      );
      const raw = data?.data || data;
      return paginatedClassAttendanceSummarySchema.parse(raw);
    },
  });
}

export function useClassAttendanceReport(
  classroomId: number | null,
  dateFrom?: string,
  dateTo?: string
) {
  return useQuery({
    queryKey: ["class-attendance-report", classroomId, dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/academics/attendance-summaries/class_report/",
        {
          params: {
            classroom_id: classroomId,
            date_from: dateFrom,
            date_to: dateTo,
          },
        }
      );
      return data?.data || data;
    },
    enabled: !!classroomId,
  });
}