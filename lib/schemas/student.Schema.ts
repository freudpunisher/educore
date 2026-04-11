// src/lib/schemas/student.schema.ts
import { z } from "zod";

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["0", "1"], {
    required_error: "Gender is required",
  }),
  date_of_birth: z.string().optional().or(z.literal("")),

  parent_first_name: z.string().min(1, "Parent first name is required"),
  parent_last_name: z.string().min(1, "Parent last name is required"),
  parent_relationship: z.enum(["mother", "father", "guardian", "other"], {
    required_error: "Relationship is required",
  }),
  parent_contact: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Invalid phone number (ex: +243812345678)"
    ),
  parent_email: z
    .string()
    .email("Invalid parent email"),
});

export type CreateStudentData = z.infer<typeof createStudentSchema>;

export const uploadDocumentSchema = z.object({
  document_type: z.enum(["bulletin", "certificate", "enrollment", "exam_copy", "medical", "other"], {
    required_error: "Document type is required",
  }),
  description: z.string().optional().or(z.literal("")),
  file: z.any().refine((file) => file instanceof File || (typeof window !== 'undefined' && file instanceof FileList), "File is required"),
  is_public: z.boolean().default(true),
});

export type UploadDocumentData = z.infer<typeof uploadDocumentSchema>;