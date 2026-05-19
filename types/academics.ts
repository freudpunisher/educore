import { z } from "zod";

export const EventTypeValues = {
    HOLIDAY: "holiday",
    EXAM: "exam",
    EVENT: "event",
    MEETING: "meeting",
    OTHER: "other",
} as const;

export const eventTypeSchema = z.nativeEnum(EventTypeValues);

export type EventType = z.infer<typeof eventTypeSchema>;

export const schoolEventSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional().nullable(),
    start_date: z.string(),
    end_date: z.string().optional().nullable(),
    event_type: eventTypeSchema.default("event"),
    location: z.string().optional().nullable(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
    created_by: z.number().optional().nullable(),
});

export type SchoolEvent = z.infer<typeof schoolEventSchema>;

export const paginatedSchoolEventSchema = z.object({
    count: z.number(),
    next: z.string().optional().nullable(),
    previous: z.string().optional().nullable(),
    results: z.array(schoolEventSchema),
});

export type PaginatedSchoolEvent = z.infer<typeof paginatedSchoolEventSchema>;

export const schoolEventCreateSchema = schoolEventSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});

export type SchoolEventCreate = z.infer<typeof schoolEventCreateSchema>;
