// src/lib/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(150, "Identifiant trop long"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;