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
    assignment: z.string().nullable().optional(),
    fee_category: numericIdSchema,
    fee_category_name: z.string().nullable().optional(),
    priority: numericIdSchema,
    priority_name: z.string().nullable().optional(),
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
    buyer_name: z.string().nullable().optional(),
    status: numericIdSchema,
    status_name: z.string(),
    amount: z.string(),
    amount_paid: z.string().nullable().optional().default("0.00"),
    balance: z.string().nullable().optional().default("0.00"),
    date: z.string(), // "2026-03-18 13:26"
    period: nullableNumericIdSchema,
    period_name: z.string().nullable().optional(),
    term: nullableNumericIdSchema,
    term_name: z.string().nullable().optional(),
});

export const paginatedInvoiceSchema = createPaginatedSchema(invoiceSchema);

export const paymentSchema = z.object({
    id: numericIdSchema,
    amount: z.string(),
    document: z.string().nullable().optional(),
    invoice: nullableNumericIdSchema,
    invoice_reference: z.string(),
    student_name: z.string().nullable().optional(),
    student_id: nullableNumericIdSchema,
    payment_mode: nullableNumericIdSchema,
    payment_mode_name: z.string(),
    institution: nullableNumericIdSchema,
    institution_name: z.string().nullable().optional(),
    payment_reference: z.string().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    created_by: nullableNumericIdSchema,
    created_by_name: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    cancelled_at: z.string().nullable().optional(),
    cancelled_by_name: z.string().nullable().optional(),
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
    assignment: z.string().nullable().optional(),
    fee_category: z.number().nullable().optional(),
    fee_category_name: z.string().nullable().optional(),
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

export const surplusRefundSchema = z.object({
    id: numericIdSchema,
    surplus: numericIdSchema,
    amount: z.string(),
    refund_mode: nullableNumericIdSchema,
    refund_mode_name: z.string(),
    check_number: z.string().nullable().optional(),
    institution: nullableNumericIdSchema,
    document: z.any().nullable().optional(),
    document_url: z.string().nullable().optional(),
    observations: z.string().nullable().optional(),
    created_by: nullableNumericIdSchema,
    created_by_name: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    cancelled_at: z.string().nullable().optional(),
    cancelled_by: nullableNumericIdSchema,
    cancelled_by_name: z.string().nullable().optional(),
});

export const paymentSurplusSchema = z.object({
    id: numericIdSchema,
    student: numericIdSchema,
    student_name: z.string(),
    invoice: numericIdSchema,
    invoice_reference: z.string(),
    total_surplus: z.string(),
    refunded_amount: z.string(),
    remaining: z.string(),
    refunds: z.array(surplusRefundSchema).optional(),
    refunds_count: z.number().optional(),
    created_at: z.string().nullable().optional(),
});

export const surplusAggregatesSchema = z.object({
    total_surplus: z.string(),
    total_refunded: z.string(),
    remaining: z.string(),
});

export const paginatedSurplusSchema = createPaginatedSchema(paymentSurplusSchema).extend({
    aggregates: surplusAggregatesSchema.optional(),
});
export const paginatedRefundSchema = createPaginatedSchema(surplusRefundSchema);

export type SurplusRefund = z.infer<typeof surplusRefundSchema>;
export type PaymentSurplus = z.infer<typeof paymentSurplusSchema>;
