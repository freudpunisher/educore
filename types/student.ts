// src/lib/types/student.ts ← FINAL VERSION
import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const enrollmentInfoSchema = z.object({
  classroom: z.string(),
  academic_year: z.string(),
}).nullable();

export const studentListSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  enrollment_number: z.string(),
  class_level: z.string().optional(),
  gender: z.number(),
  enrollment_date: z.string().transform((str) => new Date(str)),
  is_enrolled: z.boolean().optional(),
  account_active: z.boolean().optional(),
  enrollment_info: enrollmentInfoSchema,
});

export const studentsListArraySchema = z.array(studentListSchema);
export const paginatedStudentListSchema = createPaginatedSchema(studentListSchema);

export type Student = z.infer<typeof studentListSchema>;
export type EnrollmentInfo = z.infer<typeof enrollmentInfoSchema>;

export type AcademicsEnrollmentsListRequest = {
  academic_year?: number;
  class_room?: number;
  /**
   * A search term.
   */
  search?: string;
  student?: number;
  [property: string]: any;
};

// --- Student Detail View Types ---

export enum DocumentTypeEnum {
  Bulletin = "bulletin",
  Certificate = "certificate",
  Enrollment = "enrollment",
  ExamCopy = "exam_copy",
  Medical = "medical",
  Other = "other",
}

export const studentDocumentSchema = z.object({
  id: z.number(),
  student: z.number(),
  document_type: z.nativeEnum(DocumentTypeEnum),
  file: z.string(),
  file_url: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean().optional(),
  uploaded_at: z.string().transform((str) => new Date(str)),
  uploaded_by_user: z.string(),
});

export type StudentDocument = z.infer<typeof studentDocumentSchema>;

export enum RoleEnum {
  AcademicPrincipal = "academic_principal",
  Accountant = "accountant",
  Director = "director",
  DisciplinePrincipal = "discipline_principal",
  Driver = "driver",
  GlobalControl = "global_control",
  Hr = "hr",
  None = "none",
  Receptionist = "receptionist",
  Student = "student",
  StudentParent = "student_parent",
  SystemAdmin = "system_admin",
  Teacher = "teacher",
}

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const accountDetailSchema = z.object({
  id: z.number(),
  user: userSchema,
  role: z.nativeEnum(RoleEnum),
  phone_number: z.string().nullable(),
  address: z.string(),
  active: z.boolean().optional(),
});

export enum RelationshipEnum {
  Father = "father",
  Guardian = "guardian",
  Mother = "mother",
  Other = "other",
}

export const studentParentSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().nullable().or(z.literal("")),
  phone_number: z.string().nullable().or(z.literal("")),
  relationship: z.union([z.nativeEnum(RelationshipEnum), z.string()]),
  is_primary_contact: z.boolean().optional(),
});

export type StudentParent = z.infer<typeof studentParentSchema>;

export const studentAccountInfoSchema = z.object({
  id: z.coerce.number(),
  active: z.coerce.boolean(),
  role: z.string(),
  username: z.string(),
}).passthrough();

export const studentDetailSchema = z.object({
  id: z.coerce.number(),
  enrollment_number: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string(),
  gender: z.coerce.number(),
  date_of_birth: z.union([z.string(), z.date()]).nullable().transform((val) => (val ? new Date(val) : null)),
  enrollment_date: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  enrollment_info: z.union([z.string(), z.record(z.any()), z.null()]).optional(),
  is_enrolled: z.coerce.boolean().optional(),
  account_info: z.union([z.string(), z.record(z.any()), z.null()]).optional(),
  parent_contact: z.string().nullable(),
  parent_email: z.string().nullable(),
  documents: z.array(studentDocumentSchema).default([]),
  parents_info: z.array(studentParentSchema).nullish().transform(val => val ?? []),
}).passthrough();

export type StudentDetail = z.infer<typeof studentDetailSchema>;