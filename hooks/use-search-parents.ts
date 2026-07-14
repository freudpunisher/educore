import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface ParentResult {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  role: string;
  active: boolean;
  address: string;
  phone_number: string;
}

export function useSearchParents(query: string) {
  return useQuery({
    queryKey: ["parents", "search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await axiosInstance.get("users/accounts/search-parents/", {
        params: { q: query },
      });
      return response.data?.data ?? response.data ?? [];
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
