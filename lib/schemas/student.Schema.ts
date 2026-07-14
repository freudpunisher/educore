// src/lib/schemas/student.schema.ts
import { z } from "zod";

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().or(z.literal("")),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["0", "1"], {
    required_error: "Gender is required",
  }),
  date_of_birth: z.string().optional().or(z.literal("")),
  place_of_birth: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),

  father_full_name: z.string().optional().or(z.literal("")),
  father_phone_number: z.string().optional().or(z.literal("")),
  father_job_name: z.string().optional().or(z.literal("")),
  mother_full_name: z.string().optional().or(z.literal("")),
  mother_phone_number: z.string().optional().or(z.literal("")),
  mother_job_name: z.string().optional().or(z.literal("")),
  address_parent_quarter: z.string().optional().or(z.literal("")),
  address_parent_commune: z.string().optional().or(z.literal("")),
  address_parent_province: z.string().optional().or(z.literal("")),

  parent_id: z.coerce.number().int().optional(),
  parent_first_name: z.string().optional().or(z.literal("")),
  parent_last_name: z.string().optional().or(z.literal("")),
  parent_relationship: z.string().optional().or(z.literal("")),
  parent_contact: z.string().optional().or(z.literal("")),
  parent_email: z.string().email("Invalid parent email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type CreateStudentData = z.infer<typeof createStudentSchema>;

export const studentEntrySchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().or(z.literal("")),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["0", "1"], { required_error: "Gender is required" }),
  date_of_birth: z.string().optional().or(z.literal("")),
  place_of_birth: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  father_full_name: z.string().optional().or(z.literal("")),
  father_phone_number: z.string().optional().or(z.literal("")),
  father_job_name: z.string().optional().or(z.literal("")),
  mother_full_name: z.string().optional().or(z.literal("")),
  mother_phone_number: z.string().optional().or(z.literal("")),
  mother_job_name: z.string().optional().or(z.literal("")),
  address_parent_quarter: z.string().optional().or(z.literal("")),
  address_parent_commune: z.string().optional().or(z.literal("")),
  address_parent_province: z.string().optional().or(z.literal("")),
});

export const createStudentsBatchSchema = z.object({
  students: z.array(studentEntrySchema).min(1, "At least one student is required"),
  parent_id: z.coerce.number().int().optional(),
  parent_first_name: z.string().optional().or(z.literal("")),
  parent_last_name: z.string().optional().or(z.literal("")),
  parent_relationship: z.string().optional().or(z.literal("")),
  parent_contact: z.string().optional().or(z.literal("")),
  parent_email: z.string().email("Invalid parent email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type StudentEntryData = z.infer<typeof studentEntrySchema>;
export type CreateStudentsBatchData = z.infer<typeof createStudentsBatchSchema>;

export const uploadDocumentSchema = z.object({
  document_type: z.enum(["bulletin", "certificate", "enrollment", "exam_copy", "medical", "other"], {
    required_error: "Document type is required",
  }),
  description: z.string().optional().or(z.literal("")),
  file: z.any().refine((file) => file instanceof File || (typeof window !== 'undefined' && file instanceof FileList), "File is required"),
  is_public: z.boolean().default(true),
});

export type UploadDocumentData = z.infer<typeof uploadDocumentSchema>;
