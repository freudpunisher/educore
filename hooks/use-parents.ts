import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  last_login: z.string().optional().nullable(),
});

export const parentListSchema = z.object({
  id: z.number(),
  user: userSchema,
  role: z.string(),
  active: z.boolean(),
  address: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  children_count: z.number().default(0),
});

const paginatedParentSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(parentListSchema),
});

const studentChildSchema = z.object({
  id: z.number(),
  student: z.number(),
  account: z.number(),
  relationship: z.string(),
  is_primary_contact: z.boolean(),
  student_name: z.string().optional(),
  enrollment_number: z.string().optional().nullable(),
  class_name: z.string().optional(),
});

export type ParentItem = z.infer<typeof parentListSchema>;
export type StudentChild = z.infer<typeof studentChildSchema>;

export function useParents(params?: { page?: number; page_size?: number; search?: string }) {
  return useQuery({
    queryKey: ["parents", params],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("users/accounts/parents/", { params });
      const payload = raw?.data || raw;
      return paginatedParentSchema.parse(payload);
    },
  });
}

export function useParentChildren(parentId: number | undefined) {
  return useQuery({
    queryKey: ["parent-children", parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(`users/accounts/${parentId}/children/`);
      const payload = raw?.data || raw;
      return z.array(studentChildSchema).parse(payload);
    },
  });
}
