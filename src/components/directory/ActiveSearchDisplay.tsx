/**
 * ActiveSearchDisplay Component
 *
 * Displays the current active search query with option to clear it.
 * Shows users what they're searching for.
 */

import { Button } from "@/components/ui/button";

interface ActiveSearchDisplayProps {
  query: string;
  onClear: () => void;
}

export default function ActiveSearchDisplay({ query, onClear }: ActiveSearchDisplayProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
      <svg
        className="size-4 text-blue-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <p className="text-sm text-blue-900 flex-1">
        Searching for: <span className="font-semibold">&quot;{query}&quot;</span>
      </p>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-auto py-1 px-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
        aria-label="Clear search"
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  );
}
