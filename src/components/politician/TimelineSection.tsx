/**
 * TimelineSection Component
 *
 * Container section for the statement timeline, including filter controls and statement list.
 * Manages timeline-specific state and renders appropriate loading/error/empty states.
 */

import type { StatementDetailDTO, PaginationDTO } from "@/types";
import TimeRangeFilter from "./TimeRangeFilter";
import StatementsErrorState from "./StatementsErrorState";
import StatementsEmptyState from "./StatementsEmptyState";
import StatementsList from "./StatementsList";
import StatementsLoadingState from "@/components/feed/StatementsLoadingState";

type TimeRange = "7d" | "30d" | "365d" | "all";

interface TimelineSectionProps {
  politicianId: string;
  politicianName: string;
  statements: StatementDetailDTO[];
  pagination: PaginationDTO;
  currentPage: number;
  timeRange: TimeRange;
  isLoading: boolean;
  error: Error | null;
  currentUserId?: string | null;
  onFilterChange: (timeRange: TimeRange) => void;
  onPageChange: (page: number) => void;
  onStatementDeleted: (statementId: string) => void;
  onRetry: () => void;
}

export default function TimelineSection({
  politicianName,
  statements,
  pagination,
  currentPage,
  timeRange,
  isLoading,
  error,
  currentUserId,
  onFilterChange,
  onPageChange,
  onStatementDeleted,
  onRetry,
}: TimelineSectionProps) {
  // Handle quick reset to "all time" from empty state
  const handleShowAllTime = () => {
    onFilterChange("all");
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Statement Timeline</h2>
      </header>

      {/* Time Range Filter */}
      <TimeRangeFilter activeFilter={timeRange} onChange={onFilterChange} />

      {/* Timeline Content - Conditional Rendering */}
      {isLoading ? (
        <StatementsLoadingState count={3} />
      ) : error ? (
        <StatementsErrorState error={error} onRetry={onRetry} />
      ) : statements.length === 0 ? (
        <StatementsEmptyState
          timeRange={timeRange}
          politicianName={politicianName}
          onShowAllTime={timeRange !== "all" ? handleShowAllTime : undefined}
        />
      ) : (
        <StatementsList
          statements={statements}
          pagination={pagination}
          currentPage={currentPage}
          currentUserId={currentUserId}
          onStatementDeleted={onStatementDeleted}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
