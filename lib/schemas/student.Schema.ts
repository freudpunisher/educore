// src/lib/schemas/student.schema.ts
import { z } from "zod";

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  class_level: z.string().min(1, "Class level is required"),
  gender: z.enum(["0", "1"], {
    required_error: "Gender is required",
  }),
  date_of_birth: z.string().optional().or(z.literal("")),

  parent_contact: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Invalid phone number (e.g. +243812345678)"
    )
    .optional()
    .or(z.literal("")),
  parent_email: z
    .string()
    .email("Parent email is invalid")
    .optional()
    .or(z.literal("")),
});

export type CreateStudentData = z.infer<typeof createStudentSchema>;