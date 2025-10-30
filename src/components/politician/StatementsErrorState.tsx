/**
 * StatementsErrorState Component
 *
 * Error state for timeline when statement fetching fails.
 * Allows retry while maintaining filter selection.
 */

import { Button } from "@/components/ui/button";

interface StatementsErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}

export default function StatementsErrorState({ error, onRetry }: StatementsErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-gray-200 rounded-lg">
      {/* Error Icon */}
      <div className="mb-4">
        <svg
          className="w-16 h-16 text-red-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Statements</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {errorMessage || "An error occurred while loading the statement timeline."}
      </p>

      {/* Retry Button */}
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}
