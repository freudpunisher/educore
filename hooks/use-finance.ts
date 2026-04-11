import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedInvoiceSchema, Invoice, paginatedPaymentSchema } from "@/types/finance";

export interface InvoiceQueryParams {
    page?: number;
    page_size?: number;
    student?: string;
    academic_year?: string;
    classroom?: string;
    entity?: string;
    status?: string;
    search?: string;
}

export function useInvoices(params: InvoiceQueryParams = { page: 1, page_size: 10 }) {
    return useQuery({
        queryKey: ["finances", "invoices", params],
        queryFn: async () => {
            const response = await axiosInstance.get(`/finance/invoices/`, {
                params
            });

            // The axios interceptor in @/lib/axios returns response.data.data as response.data
            // We need to validate the structure
            const validated = paginatedInvoiceSchema.parse(response.data);
            return validated;
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
