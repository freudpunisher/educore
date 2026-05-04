// types/attendance.ts
import { z } from "zod";
import { createPaginatedSchema } from "./api";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const SessionType = {
  COURSE: "course",
  EXAM: "exam",
  SCHOOL: "school",
  OTHER: "other",
} as const;

export const AttendanceStatusValues = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
  AUTHORIZED: "authorized",
} as const;

export type AttendanceStatusType = (typeof AttendanceStatusValues)[keyof typeof AttendanceStatusValues];

export const DailyStatusValues = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
  HALF_DAY: "half_day",
} as const;

export const ExamAttendanceStatusValues = {
  PRESENT: "present",
  ABSENT: "absent",
  EXCUSED: "excused",
  EXCLUDED: "excluded",
} as const;

// ---------------------------------------------------------------------------
// AttendanceSession
// ---------------------------------------------------------------------------

export const attendanceSessionSchema = z.object({
  id: z.number(),
  date: z.string().transform((s) => new Date(s)),
  start_time: z.string(),
  end_time: z.string(),
  subject: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  classroom: z.number(),
  classroom_name: z.string(),
  session_type: z.string().optional().default("course"),
  session_type_display: z.string().optional(),
  late_threshold_minutes: z.number().optional().default(10),
  attendances_count: z.coerce.number(),
  is_locked: z.boolean().optional(),
  stats: z
    .object({
      total: z.number(),
      present: z.number(),
      absent: z.number(),
      late: z.number(),
      excused: z.number(),
      attendance_rate: z.number(),
    })
    .optional(),
});

export const attendanceSessionCreateSchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  classroom: z.number(),
  session_type: z.string().optional().default("course"),
  late_threshold_minutes: z.number().optional().default(10),
  subject: z.string().optional(),
  description: z.string().optional(),
});

export type AttendanceSessionCreate = z.infer<typeof attendanceSessionCreateSchema>;
export const sessionsArraySchema = z.array(attendanceSessionSchema);
export const paginatedAttendanceSessionSchema = createPaginatedSchema(attendanceSessionSchema);
export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;

// ---------------------------------------------------------------------------
// StudentAttendance
// ---------------------------------------------------------------------------

export const studentAttendanceSchema = z.object({
  id: z.number(),
  student: z.number(),
  student_name: z.string().optional(),
  student_enrollment: z.string().optional(),
  enrollment: z.number(),
  session: z.number(),
  session_info: z
    .object({
      date: z.string(),
      start_time: z.string(),
      end_time: z.string().optional(),
      classroom: z.string(),
      subject: z.string().nullable().optional(),
      session_type: z.string().optional(),
    })
    .optional(),
  status: z.string(),
  status_display: z.string().optional(),
  lateness_minutes: z.number().default(0),
  marked_by: z.number().nullable().optional(),
  marked_by_name: z.string().nullable().optional(),
  marked_at: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export type StudentAttendance = z.infer<typeof studentAttendanceSchema>;

export interface BulkAttendanceItem {
  student: number;
  enrollment: number;
  status: AttendanceStatusType;
  lateness_minutes?: number;
  notes?: string;
}

export interface BulkMarkPayload {
  session_id: number;
  attendances: BulkAttendanceItem[];
}

// ---------------------------------------------------------------------------
// ExamAttendance
// ---------------------------------------------------------------------------

export const examAttendanceSchema = z.object({
  id: z.number(),
  assessment: z.number(),
  assessment_title: z.string().optional(),
  student: z.number(),
  student_name: z.string().optional(),
  student_enrollment: z.string().optional(),
  enrollment: z.number(),
  status: z.string(),
  status_display: z.string().optional(),
  arrival_time: z.string().nullable().optional(),
  lateness_minutes: z.number().default(0),
  notes: z.string().nullable().optional(),
  marked_by: z.number().nullable().optional(),
  marked_by_name: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type ExamAttendance = z.infer<typeof examAttendanceSchema>;
export const paginatedExamAttendanceSchema = createPaginatedSchema(examAttendanceSchema);

export interface BulkExamAttendanceItem {
  student: number;
  enrollment: number;
  status: string;
  lateness_minutes?: number;
  arrival_time?: string;
  notes?: string;
}

export interface BulkExamMarkPayload {
  assessment_id: number;
  attendances: BulkExamAttendanceItem[];
}

// ---------------------------------------------------------------------------
// SchoolDailyAttendance
// ---------------------------------------------------------------------------

export const schoolDailyAttendanceSchema = z.object({
  id: z.number(),
  student: z.number(),
  student_name: z.string().optional(),
  student_enrollment: z.string().optional(),
  enrollment: z.number(),
  classroom_name: z.string().optional(),
  date: z.string(),
  status: z.string(),
  status_display: z.string().optional(),
  arrival_time: z.string().nullable().optional(),
  departure_time: z.string().nullable().optional(),
  lateness_minutes: z.number().default(0),
  justification: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  marked_by: z.number().nullable().optional(),
  marked_by_name: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type SchoolDailyAttendance = z.infer<typeof schoolDailyAttendanceSchema>;
export const paginatedSchoolDailyAttendanceSchema = createPaginatedSchema(schoolDailyAttendanceSchema);

export interface BulkSchoolAttendanceItem {
  student: number;
  enrollment: number;
  status: string;
  arrival_time?: string;
  departure_time?: string;
  lateness_minutes?: number;
  justification?: string;
  notes?: string;
}

export interface BulkSchoolMarkPayload {
  date: string;
  classroom_id: number;
  attendances: BulkSchoolAttendanceItem[];
}

// ---------------------------------------------------------------------------
// ClassAttendanceSummary
// ---------------------------------------------------------------------------

export const classAttendanceSummarySchema = z.object({
  id: z.number(),
  classroom: z.number(),
  classroom_name: z.string().optional(),
  date: z.string(),
  total_students: z.number(),
  present_count: z.number(),
  absent_count: z.number(),
  late_count: z.number(),
  excused_count: z.number(),
  attendance_rate: z.coerce.number(),
  updated_at: z.string().optional(),
});

export type ClassAttendanceSummary = z.infer<typeof classAttendanceSummarySchema>;
export const paginatedClassAttendanceSummarySchema = createPaginatedSchema(classAttendanceSummarySchema);

// ---------------------------------------------------------------------------
// Attendance Stats (for a session or student history)
// ---------------------------------------------------------------------------

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}