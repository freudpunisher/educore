// src/components/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import toast from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  // Important: create the client inside the component to avoid SSR issues
  const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || "Une erreur est survenue");
      },
    },
  },
});

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}