/**
 * PoliticiansErrorState Component
 *
 * Error state displayed when politician fetching fails.
 * Shows user-friendly error message and retry option.
 */

import { Button } from "@/components/ui/button";

interface PoliticiansErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}

export default function PoliticiansErrorState({ error, onRetry }: PoliticiansErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-red-50 rounded-lg border border-red-200 p-6">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <svg
            className="size-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h3 className="text-lg font-semibold text-red-900 text-center mb-2">Failed to Load Politicians</h3>
        <p className="text-sm text-red-700 text-center mb-6">{errorMessage}</p>

        {/* Retry Button */}
        <div className="flex justify-center">
          <Button onClick={onRetry} variant="default" className="bg-red-600 hover:bg-red-700">
            <svg className="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
