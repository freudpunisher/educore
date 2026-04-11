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
