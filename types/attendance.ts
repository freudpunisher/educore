// src/lib/types/attendance.ts
import { z } from "zod";

export const attendanceSessionSchema = z.object({
  id: z.number(),
  date: z.string().transform((s) => new Date(s)),
  start_time: z.string(),
  end_time: z.string(),
  subject: z.string().nullable(),
  description: z.string().nullable(),
  classroom: z.number(),
  classroom_name: z.string(),
  attendances_count: z.string(), // "12/15"
  is_locked: z.boolean().optional(),
});

export const sessionsArraySchema = z.array(attendanceSessionSchema);

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;