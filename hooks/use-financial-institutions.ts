import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type FinancialInstitution = {
  id: number;
  acronyms: string;
  name: string;
  account_number: string;
  institution_type: string;
};

export function useFinancialInstitutions() {
  return useQuery({
    queryKey: ["financial-institutions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/config/institutions/");
      const raw = data?.data || data;
      const results = raw?.results || raw;
      return (Array.isArray(results) ? results : []) as FinancialInstitution[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
