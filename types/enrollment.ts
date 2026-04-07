// src/lib/types/enrollment.ts ← FINAL VERSION
import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const academicYearSchema = z.object({
  id: z.number(),
  start_year: z.number(),
  end_year: z.number(),        // ← WAS string → now number
  is_current: z.boolean(),
});

export const classRoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});

export const classRoomDetailSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
});

export const enrollmentListSchema = z.object({
  id: z.number(),
  student: z.number(),
  student_name: z.string(),
  class_room: z.number(),
  class_room_detail: classRoomDetailSchema.optional(),
  academic_year: z.number(),
  academic_year_display: z.string().optional(),
  date_enrolled: z.string().optional(),
});

export const paginatedAcademicYearSchema = createPaginatedSchema(academicYearSchema);
export const paginatedClassRoomSchema = createPaginatedSchema(classRoomSchema);
export const paginatedEnrollmentListSchema = createPaginatedSchema(enrollmentListSchema);

export const enrollmentCreateSchema = z.object({
  student: z.number(),
  academic_year: z.number(),
  class_room: z.number(),
});

export type AcademicYear = z.infer<typeof academicYearSchema>;
export type ClassRoom = z.infer<typeof classRoomSchema>;
export type ClassRoomDetail = z.infer<typeof classRoomDetailSchema>;
export type EnrollmentList = z.infer<typeof enrollmentListSchema>;
export type EnrollmentCreate = z.infer<typeof enrollmentCreateSchema>;