import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface SearchResult {
  type: "student" | "classroom" | "course";
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchResultsResponse {
  results: SearchResult[];
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return { results: [] };
      const { data } = await axiosInstance.get<SearchResultsResponse>(`/core/search/?q=${encodeURIComponent(query)}`);
      return data;
    },
    enabled: !!query && query.length >= 2,
  });
}
