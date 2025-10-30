/**
 * PoliticianErrorState Component
 *
 * Error state for entire page when politician data fetch fails.
 * Provides retry option.
 */

import { Button } from "@/components/ui/button";

interface PoliticianErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}

export default function PoliticianErrorState({ error, onRetry }: PoliticianErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Error Icon */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-red-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Failed to Load Politician</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {errorMessage || "An unexpected error occurred while loading the politician profile."}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
}
