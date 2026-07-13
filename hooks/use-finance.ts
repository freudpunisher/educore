import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedInvoiceSchema, Invoice, paginatedPaymentSchema, financeOverviewSchema, paginatedSurplusSchema, paginatedRefundSchema } from "@/types/finance";

export function useFinanceOverview() {
    return useQuery({
        queryKey: ["finances", "overview"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/finance/overview/`);
            return financeOverviewSchema.parse(data?.data || data);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export interface InvoiceQueryParams {
    page?: number;
    page_size?: number;
    student?: string;
    academic_year?: string;
    classroom?: string;
    entity?: string;
    status?: string;
    search?: string;
    staff?: string;
    staff_search?: string;
}

export function useInvoices(params: InvoiceQueryParams = { page: 1, page_size: 10 }) {
    return useQuery({
        queryKey: ["finances", "invoices", params],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/finance/invoices/`, {
                    params
                });

                // The axios interceptor usually returns response.data.data as response.data
                // but we extract it defensively here to handle all cases
                const rawData = response.data;
                const extraction = (rawData && (rawData.data || rawData.results)) ? (rawData.data || rawData) : rawData;

                return paginatedInvoiceSchema.parse(extraction);
            } catch (err: any) {
                if (err.name === "ZodError") {
                    console.error("Zod Validation Issues (useInvoices):", JSON.stringify(err.issues, null, 2));
                } else {
                    console.error("Error in useInvoices:", err);
                }
                throw err;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export interface PaymentPayload {
    invoice: number;
    amount: string;
    invoice_reference: string;
}

export function usePayInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axiosInstance.post("/finance/payments/", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["finances", "invoices"] });
        }
    });
}

export interface PaymentQueryParams {
    page?: number;
    search?: string;
    invoice?: number;
    date_from?: string;
    date_to?: string;
}

export function usePayments(params: PaymentQueryParams = { page: 1 }) {
    return useQuery({
        queryKey: ["finances", "payments", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/finance/payments/`, { params });
            const rawData = data?.data || data;
            return paginatedPaymentSchema.parse(rawData);
        },
    });
}

export interface SurplusQueryParams {
    page?: number;
    student?: number;
    search?: string;
    academic_year?: string;
}

export function usePaymentSurpluses(params: SurplusQueryParams = { page: 1 }) {
    return useQuery({
        queryKey: ["finance", "surpluses", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/finance/payment-surpluses/", { params });
            const rawData = data?.data || data;
            return paginatedSurplusSchema.parse(rawData);
        },
    });
}

export function useSurplusRefunds(params: SurplusQueryParams = { page: 1 }) {
    return useQuery({
        queryKey: ["finance", "refunds", params],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/finance/surplus-refunds/", { params });
            const rawData = data?.data || data;
            return paginatedRefundSchema.parse(rawData);
        },
    });
}

export function useCreateRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axiosInstance.post("/finance/surplus-refunds/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["finance", "surpluses"] });
            queryClient.invalidateQueries({ queryKey: ["finance", "refunds"] });
            queryClient.invalidateQueries({ queryKey: ["finances", "invoices"] });
        },
    });
}

export function useCancelRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (refundId: number) => {
            const response = await axiosInstance.post(`/finance/surplus-refunds/${refundId}/cancel/`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["finance", "surpluses"] });
            queryClient.invalidateQueries({ queryKey: ["finance", "refunds"] });
        },
    });
}

export function useCancelInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invoiceId: number) => {
            const response = await axiosInstance.post(`/finance/invoices/${invoiceId}/cancel/`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["finances", "invoices"] });
        },
    });
}

export function useFees() {
    return useQuery({
        queryKey: ["finance", "fees"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/finance/fees/");
            return data?.results || data || [];
        },
    });
}

export function useCreateAnticipatedInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            student_id: number;
            fees_id: number;
            period_id?: number;
            term_id?: number;
            generate_all_terms?: boolean;
            generate_all?: string;
        }) => {
            const response = await axiosInstance.post("/finance/invoices/create_anticipated/", payload);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["finances", "invoices"] });
            queryClient.invalidateQueries({ queryKey: ["finance", "fees"] });
            queryClient.invalidateQueries({ queryKey: ["students", "finance", variables.student_id] });
        },
    });
}
