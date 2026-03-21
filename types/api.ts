import { z } from "zod";

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        count: z.number(),
        next: z.string().nullable(),
        previous: z.string().nullable(),
        results: z.array(itemSchema),
    });
}
