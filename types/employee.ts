import { z } from "zod";
import { createPaginatedSchema } from "./api";
import { userSchema, RoleEnum } from "./student";

export const employeeSchema = z.object({
  id: z.number(),
  user: userSchema,
  role: z.nativeEnum(RoleEnum),
  phone_number: z.string().nullable(),
  address: z.string(),
  active: z.boolean(),
});

export const paginatedEmployeeListSchema = createPaginatedSchema(employeeSchema);

export type Employee = z.infer<typeof employeeSchema>;

export type EmployeeListRequest = {
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
};

export const employeeCreateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.nativeEnum(RoleEnum),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  active: z.boolean().default(true),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;

