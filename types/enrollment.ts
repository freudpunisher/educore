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

export const paginatedAcademicYearSchema = createPaginatedSchema(academicYearSchema);
export const paginatedClassRoomSchema = createPaginatedSchema(classRoomSchema);

export const enrollmentCreateSchema = z.object({
  student: z.number(),
  academic_year: z.number(),
  class_room: z.number(),

});

export type AcademicYear = z.infer<typeof academicYearSchema>;
export type ClassRoom = z.infer<typeof classRoomSchema>;
export type EnrollmentCreate = z.infer<typeof enrollmentCreateSchema>;