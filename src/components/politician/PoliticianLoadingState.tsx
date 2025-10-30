/**
 * PoliticianLoadingState Component
 *
 * Loading skeleton for initial page load.
 * Shows skeleton for both profile header and timeline section.
 */

export default function PoliticianLoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar Skeleton */}
          <div className="size-24 bg-gray-200 rounded-full flex-shrink-0" />

          {/* Info Skeleton */}
          <div className="flex-1 space-y-4">
            {/* Name Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-64" />

            {/* Party Badge Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-32" />

            {/* Biography Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>

            {/* Statement Count Skeleton */}
            <div className="h-5 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>

      {/* Timeline Section Skeleton */}
      <div className="space-y-6">
        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 rounded w-48" />
        </div>

        {/* Filter Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-28" />
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>

        {/* Statement Cards Skeleton */}
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            {/* Politician Header Skeleton */}
            <div className="flex items-center gap-3">
              <div className="size-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>

            {/* Statement Content Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Metadata Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
