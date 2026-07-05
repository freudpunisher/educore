import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
