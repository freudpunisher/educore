import { z } from "zod";

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        count: z.coerce.number().optional().default(0),
        next: z.string().nullable().optional(),
        previous: z.string().nullable().optional(),
        results: z.array(itemSchema).default([]),
    });
}
