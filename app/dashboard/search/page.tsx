"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground mt-1">
          Showing results for "{query}"
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Global Search Feature In Progress</h2>
          <p className="text-muted-foreground max-w-md">
            The global search feature is currently being implemented. In the meantime, you can use the specific search bars available in individual modules (e.g., Pedagogy, Users).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
