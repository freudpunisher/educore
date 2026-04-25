import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const configClassroomSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    classroom_group: z.number(),
    place: z.number(),
    tutor: z.number(),
});

export enum DisciplineRecordStatusEnum {
    Recorded = "recorded",
    Appealed = "appealed",
    Cancelled = "cancelled",
}

export const disciplineReasonSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().optional(),
    points_value: z.string(),
    incident_type: z.string().optional(),
    tier: z.number().optional(),
    description: z.string().optional().nullable(),
});

export const disciplineRecordSchema = z.object({
    id: z.number(),
    student_name: z.string().optional().nullable(),
    student_enrollment: z.string(),
    date_incident: z.string().transform((s) => new Date(s)),
    description: z.string().optional().nullable(),
    points: z.string(),
    reason_name: z.string(),
    reason: z.number(),
    recorded_by_name: z.string().optional().nullable(),
    recorded_by: z.number().optional().nullable(),
    student: z.number(),
    status: z.nativeEnum(DisciplineRecordStatusEnum),
    appeal_reason: z.string().nullable().optional(),
});

export const disciplineRecordCreateSchema = z.object({
    student: z.number().min(1, "Student is required"),
    date_incident: z.string().min(1, "Date is required"),
    reason: z.number().min(1, "Reason is required"),
    description: z.string().optional(),
    points: z.string().optional(),
    appeal_reason: z.string().optional(),
    status: z.nativeEnum(DisciplineRecordStatusEnum).default(DisciplineRecordStatusEnum.Recorded),
});

export type DisciplineRecord = z.infer<typeof disciplineRecordSchema>;
export type DisciplineReason = z.infer<typeof disciplineReasonSchema>;
export type DisciplineRecordCreate = z.infer<typeof disciplineRecordCreateSchema>;
export type ConfigClassroom = z.infer<typeof configClassroomSchema>;
export const paginatedDisciplineRecordSchema = createPaginatedSchema(disciplineRecordSchema);
