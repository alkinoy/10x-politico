/**
 * PoliticiansLoadingState Component
 *
 * Skeleton screen displayed while politicians are being fetched.
 * Mimics the grid structure of actual politician cards.
 */

import { Skeleton } from "@/components/ui/skeleton";

interface PoliticiansLoadingStateProps {
  count?: number;
}

export default function PoliticiansLoadingState({ count = 12 }: PoliticiansLoadingStateProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow-sm border space-y-4">
          {/* Avatar and Header */}
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Statement Count */}
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
