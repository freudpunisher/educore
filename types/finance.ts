import { z } from "zod";
import { createPaginatedSchema } from "./api";

const numericIdSchema = z.union([z.number(), z.string()]).transform((val) => Number(val));
const nullableNumericIdSchema = z.union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) => (val === null || val === undefined ? val : Number(val)));

export const feesDetailSchema = z.object({
    id: numericIdSchema,
    code: z.string(),
    amount: z.string(),
    label: z.string(),
    assignment: z.string(),
    fee_category: numericIdSchema,
    fee_category_name: z.string(),
    priority: numericIdSchema,
    priority_name: z.string(),
    period: nullableNumericIdSchema,
    period_name: z.string().nullable().optional(),
});

export const invoiceSchema = z.object({
    id: numericIdSchema,
    reference: z.string().nullable().optional().default(""),
    fees: nullableNumericIdSchema,
    fees_detail: feesDetailSchema.nullable().optional(),
    entity: numericIdSchema,
    entity_name: z.string(),
    entity_id: numericIdSchema,
    student_id: nullableNumericIdSchema,
    student_name: z.string().nullable().optional(),
    status: numericIdSchema,
    status_name: z.string(),
    amount: z.string(),
    amount_paid: z.string().nullable().optional().default("0.00"),
    balance: z.string().nullable().optional().default("0.00"),
    date: z.string(), // "2026-03-18 13:26"
    period: nullableNumericIdSchema,
    period_name: z.string().nullable().optional(),
});

export const paginatedInvoiceSchema = createPaginatedSchema(invoiceSchema);

export const paymentSchema = z.object({
    id: numericIdSchema,
    amount: z.string(),
    document: z.string().nullable().optional(),
    invoice: nullableNumericIdSchema,
    invoice_reference: z.string(),
    payment_mode: nullableNumericIdSchema,
    payment_mode_name: z.string(),
}).passthrough();

export const paginatedPaymentSchema = createPaginatedSchema(paymentSchema);

export const revenueDataPointSchema = z.object({
    month: z.string(),
    revenue: z.number(),
});

export const financeOverviewSchema = z.object({
    totalRevenue: z.number(),
    totalBalance: z.number(),
    overdueCount: z.number(),
    revenueData: z.array(revenueDataPointSchema),
    recentInvoices: z.array(invoiceSchema),
});

export const feesPreviewItemSchema = z.object({
    label: z.string(),
    amount: z.string(),
    assignment: z.string().optional(),
    fee_category: z.number().optional(),
    fee_category_name: z.string().optional(),
});

export const feesPreviewSchema = z.object({
    has_fees: z.boolean(),
    fees: z.array(feesPreviewItemSchema),
    notice: z.string().nullable().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type PaginatedInvoice = z.infer<typeof paginatedInvoiceSchema>;
export type FeesDetail = z.infer<typeof feesDetailSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaginatedPayment = z.infer<typeof paginatedPaymentSchema>;
export type RevenueDataPoint = z.infer<typeof revenueDataPointSchema>;
export type FinanceOverview = z.infer<typeof financeOverviewSchema>;
export type FeesPreviewItem = z.infer<typeof feesPreviewItemSchema>;
export type FeesPreview = z.infer<typeof feesPreviewSchema>;
