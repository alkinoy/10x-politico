/**
 * StatementsLoadingState Component
 *
 * Skeleton screen displayed while statements are being fetched from the API.
 * Mimics the structure of actual statement cards with shimmer animation.
 */

interface StatementsLoadingStateProps {
  count?: number; // Number of skeleton cards to show (default: 5)
}

export default function StatementsLoadingState({ count = 5 }: StatementsLoadingStateProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading statements">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          {/* Politician Header Skeleton */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded-full" />

            <div className="flex-1 space-y-2">
              {/* Name skeleton */}
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              {/* Party badge skeleton */}
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>

          {/* Statement Content Skeleton */}
          <div className="space-y-3 mb-4">
            {/* Timestamp skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/4" />

            {/* Statement text skeleton (3 lines) */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div className="flex items-center justify-between text-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
          </div>
        </div>
      ))}

      <span className="sr-only">Loading statements...</span>
    </div>
  );
}
