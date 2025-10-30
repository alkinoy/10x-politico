/**
 * StatementsErrorState Component
 *
 * Error state displayed when statement fetching fails.
 * Shows user-friendly error message and retry option.
 */

interface StatementsErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}

export default function StatementsErrorState({ error, onRetry }: StatementsErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center" role="alert" aria-live="assertive">
      {/* Error Icon */}
      <div className="flex justify-center mb-4">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h2 className="text-xl font-semibold text-red-900 mb-2">Unable to Load Statements</h2>
      <p className="text-red-800 mb-6 max-w-md mx-auto">
        {errorMessage || "An unexpected error occurred. Please try again."}
      </p>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Retry
      </button>

      {/* Help Text */}
      <p className="text-sm text-red-700 mt-4">
        If the problem persists, please check your internet connection or try again later.
      </p>
    </div>
  );
}
