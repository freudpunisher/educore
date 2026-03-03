// src/lib/types/student.ts ← FINAL VERSION
import { z } from "zod";

export const enrollmentInfoSchema = z.object({
  classroom: z.string(),
  academic_year: z.string(),
}).nullable();

export const studentListSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  enrollment_number: z.string(),
  class_level: z.string(),
  gender: z.number(),
  enrollment_date: z.string().transform((str) => new Date(str)),
  is_enrolled: z.boolean().optional(),
  account_active: z.boolean(),
  enrollment_info: enrollmentInfoSchema,
});

export const studentsListArraySchema = z.array(studentListSchema);

export type Student = z.infer<typeof studentListSchema>;
export type EnrollmentInfo = z.infer<typeof enrollmentInfoSchema>;