import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const feesDetailSchema = z.object({
    id: z.number(),
    code: z.string(),
    amount: z.string(),
    label: z.string(),
    assignment: z.string(),
    fee_category: z.number(),
    fee_category_name: z.string(),
    priority: z.number(),
    priority_name: z.string(),
    period: z.number(),
    period_name: z.string(),
});

export const invoiceSchema = z.object({
    id: z.number(),
    reference: z.string(),
    fees: z.number(),
    fees_detail: feesDetailSchema,
    entity: z.number(),
    entity_name: z.string(),
    entity_id: z.number(),
    student_name: z.string().nullable(),
    status: z.number(),
    status_name: z.string(),
    amount: z.string(),
    date: z.string(), // "2026-03-18 13:26"
});

export const paginatedInvoiceSchema = createPaginatedSchema(invoiceSchema);

export type Invoice = z.infer<typeof invoiceSchema>;
export type PaginatedInvoice = z.infer<typeof paginatedInvoiceSchema>;
export type FeesDetail = z.infer<typeof feesDetailSchema>;
