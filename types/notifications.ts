import { z } from "zod";

export const notificationTypeSchema = z.enum([
    "INFO",
    "SUCCESS",
    "WARNING",
    "ERROR",
    "PAYMENT",
    "ATTENDANCE",
    "DISCIPLINE",
    "ANNOUNCEMENT",
    "SYSTEM",
]);

export const notificationPrioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const notificationSchema = z.object({
    id: z.number(),
    type: notificationTypeSchema,
    type_display: z.string(),
    priority: notificationPrioritySchema,
    priority_display: z.string(),
    title: z.string(),
    message: z.string(),
    link: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    is_read: z.boolean(),
    read_at: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.any()).optional().default({}),
    created_at: z.string(),
    time_ago: z.string().optional().default(""),
});

export const notificationCountSchema = z.object({
    unread_count: z.number(),
});

export const notificationStatsSchema = z.object({
    total: z.number(),
    unread: z.number(),
    by_type: z.array(
        z.object({
            type: z.string(),
            total: z.number(),
            unread: z.number(),
        })
    ),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
