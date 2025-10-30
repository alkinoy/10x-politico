/**
 * StatementsEmptyState Component
 *
 * Empty state for timeline when no statements exist in selected time range.
 * Provides context-aware message and suggests expanding filter.
 */

import { Button } from "@/components/ui/button";

type TimeRange = "7d" | "30d" | "365d" | "all";

interface StatementsEmptyStateProps {
  timeRange: TimeRange;
  politicianName: string;
  onShowAllTime?: () => void;
}

export default function StatementsEmptyState({ timeRange, politicianName, onShowAllTime }: StatementsEmptyStateProps) {
  // Get context-aware message based on time range
  const getEmptyStateMessage = () => {
    const timeRangeLabels: Record<TimeRange, string> = {
      "7d": "the last 7 days",
      "30d": "the last 30 days",
      "365d": "the last year",
      all: "",
    };

    if (timeRange === "all") {
      return {
        title: "No Statements Yet",
        message: `${politicianName} hasn't made any public statements yet. Check back later for updates.`,
      };
    }

    return {
      title: "No Statements Found",
      message: `No statements found in ${timeRangeLabels[timeRange]}. Try expanding your search to see more.`,
    };
  };

  const { title, message } = getEmptyStateMessage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-gray-200 rounded-lg">
      {/* Empty State Icon */}
      <div className="mb-4">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Empty State Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>

      {/* Show All Time Button (only when filtered) */}
      {onShowAllTime && (
        <Button onClick={onShowAllTime} variant="outline">
          Show All Time
        </Button>
      )}
    </div>
  );
}
