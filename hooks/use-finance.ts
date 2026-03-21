import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedInvoiceSchema, Invoice } from "@/types/finance";

export interface InvoiceQueryParams {
    page?: number;
    page_size?: number;
    student?: string;
    academic_year?: string;
    classroom?: string;
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
