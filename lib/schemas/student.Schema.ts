// src/lib/schemas/student.schema.ts
import { z } from "zod";

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  class_level: z.string().min(1, "Le niveau est requis"),
  gender: z.enum(["0", "1"], {
    required_error: "Le genre est requis",
  }),
  date_of_birth: z.string().optional().or(z.literal("")),

  parent_contact: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Numéro de téléphone invalide (ex: +243812345678)"
    )
    .optional()
    .or(z.literal("")),
  parent_email: z
    .string()
    .email("Email du parent invalide")
    .optional()
    .or(z.literal("")),
});

export type CreateStudentData = z.infer<typeof createStudentSchema>;