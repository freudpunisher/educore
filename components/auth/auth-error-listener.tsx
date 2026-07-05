"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function AuthErrorListener() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setError(detail?.message || "Session expired. Please log in again.");
    };

    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-w-md mx-auto p-6">
        <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-bold text-base mt-1">
            {error}
          </AlertDescription>
        </Alert>
        <button
          onClick={() => {
            setError(null);
            router.push("/login");
          }}
          className="mt-4 w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
