// src/lib/types/attendance.ts
import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const attendanceSessionSchema = z.object({
  id: z.number(),
  date: z.string().transform((s) => new Date(s)),
  start_time: z.string(),
  end_time: z.string(),
  subject: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  classroom: z.number(),
  classroom_name: z.string(),
  attendances_count: z.coerce.number(),
  is_locked: z.boolean().optional(),
});

export const attendanceSessionCreateSchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  classroom: z.number(),
  subject: z.string().optional(),
  description: z.string().optional(),
});

export type AttendanceSessionCreate = z.infer<typeof attendanceSessionCreateSchema>;

export const sessionsArraySchema = z.array(attendanceSessionSchema);
export const paginatedAttendanceSessionSchema = createPaginatedSchema(attendanceSessionSchema);

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;