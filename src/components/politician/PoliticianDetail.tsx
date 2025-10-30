/**
 * PoliticianDetail Component
 *
 * Main container component orchestrating the politician detail view.
 * Manages timeline filtering, pagination, and statement refresh after delete actions.
 */

import { useState, useCallback } from "react";
import type { PoliticianDetailDTO, PaginatedResponse, StatementDetailDTO } from "@/types";
import PoliticianNotFound from "./PoliticianNotFound";
import PoliticianLoadingState from "./PoliticianLoadingState";
import PoliticianErrorState from "./PoliticianErrorState";
import PoliticianHeader from "./PoliticianHeader";
import TimelineSection from "./TimelineSection";

// Time range type
type TimeRange = "7d" | "30d" | "365d" | "all";

interface PoliticianDetailProps {
  politicianId: string;
  initialPolitician: PoliticianDetailDTO | null;
  initialStatements: PaginatedResponse<StatementDetailDTO> | null;
  initialTimeRange: TimeRange;
  initialPage: number;
  currentUserId?: string | null;
  politicianError?: string | null;
  statementsError?: string | null;
}

interface DetailState {
  // Politician profile state
  politician: PoliticianDetailDTO | null;
  profileLoading: boolean;
  profileError: Error | null;

  // Timeline state
  statements: StatementDetailDTO[];
  statementsLoading: boolean;
  statementsError: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  currentPage: number;
  timeRange: TimeRange;
}

export default function PoliticianDetail({
  politicianId,
  initialPolitician,
  initialStatements,
  initialTimeRange,
  initialPage,
  currentUserId,
  politicianError,
  statementsError,
}: PoliticianDetailProps) {
  // Initialize state from props
  const [detailState, setDetailState] = useState<DetailState>({
    politician: initialPolitician,
    profileLoading: false,
    profileError: politicianError ? new Error(politicianError) : null,
    statements: initialStatements?.data || [],
    statementsLoading: false,
    statementsError: statementsError ? new Error(statementsError) : null,
    pagination: initialStatements?.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      total_pages: 0,
    },
    currentPage: initialPage,
    timeRange: initialTimeRange,
  });

  // Fetch timeline with new filters or page
  const fetchTimeline = useCallback(
    async (timeRange: TimeRange, page: number) => {
      setDetailState((prev) => ({
        ...prev,
        statementsLoading: true,
        statementsError: null,
      }));

      try {
        const params = new URLSearchParams({
          time_range: timeRange,
          page: page.toString(),
          limit: "50",
          sort_by: "statement_timestamp",
          order: "desc",
        });

        const response = await fetch(`/api/politicians/${politicianId}/statements?${params}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Failed to load statements");
        }

        const data: PaginatedResponse<StatementDetailDTO> = await response.json();

        setDetailState((prev) => ({
          ...prev,
          statementsLoading: false,
          statements: data.data,
          pagination: data.pagination,
          currentPage: page,
          timeRange,
        }));

        // Update URL without page reload
        updateURL(timeRange, page);
      } catch (error) {
        setDetailState((prev) => ({
          ...prev,
          statementsLoading: false,
          statementsError: error as Error,
        }));
      }
    },
    [politicianId]
  );

  // Update URL with current filter and page
  const updateURL = (timeRange: TimeRange, page: number) => {
    const params = new URLSearchParams();

    if (timeRange !== "all") {
      params.set("time_range", timeRange);
    }

    if (page > 1) {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    const newURL = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

    window.history.pushState({}, "", newURL);
  };

  // Handle time range filter change
  const handleFilterChange = useCallback(
    (newTimeRange: TimeRange) => {
      if (newTimeRange !== detailState.timeRange) {
        // Reset to page 1 when filter changes
        fetchTimeline(newTimeRange, 1);
      }
    },
    [detailState.timeRange, fetchTimeline]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage !== detailState.currentPage) {
        fetchTimeline(detailState.timeRange, newPage);
        // Scroll to timeline top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [detailState.timeRange, detailState.currentPage, fetchTimeline]
  );

  // Handle statement deletion
  const handleStatementDeleted = useCallback(
    (statementId: string) => {
      // Remove statement from local array
      setDetailState((prev) => {
        const newStatements = prev.statements.filter((s) => s.id !== statementId);

        // Check if we need to refetch (e.g., last item on page deleted)
        const shouldRefetch = newStatements.length === 0 && prev.pagination.total > 0;

        if (shouldRefetch) {
          // Refetch current page or previous page if current becomes empty
          const newPage = prev.currentPage > 1 ? prev.currentPage - 1 : prev.currentPage;
          fetchTimeline(prev.timeRange, newPage);
          return prev; // State will be updated by fetchTimeline
        }

        return {
          ...prev,
          statements: newStatements,
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - 1,
          },
        };
      });
    },
    [fetchTimeline]
  );

  // Retry loading politician profile
  const handleRetryProfile = useCallback(() => {
    window.location.reload();
  }, []);

  // Retry loading timeline
  const handleRetryTimeline = useCallback(() => {
    fetchTimeline(detailState.timeRange, detailState.currentPage);
  }, [detailState.timeRange, detailState.currentPage, fetchTimeline]);

  // Handle 404 - Politician not found
  if (politicianError === "POLITICIAN_NOT_FOUND" || !initialPolitician) {
    return <PoliticianNotFound politicianId={politicianId} />;
  }

  // Handle profile error
  if (detailState.profileError) {
    return <PoliticianErrorState error={detailState.profileError} onRetry={handleRetryProfile} />;
  }

  // Handle profile loading (shouldn't happen with SSR, but included for completeness)
  if (detailState.profileLoading) {
    return <PoliticianLoadingState />;
  }

  // Render politician profile and timeline
  const { politician } = detailState;

  if (!politician) {
    return <PoliticianNotFound politicianId={politicianId} />;
  }

  return (
    <div className="space-y-8">
      {/* Politician Profile Header */}
      <PoliticianHeader politician={politician} />

      {/* Statement Timeline Section */}
      <TimelineSection
        politicianId={politicianId}
        politicianName={`${politician.first_name} ${politician.last_name}`}
        statements={detailState.statements}
        pagination={detailState.pagination}
        currentPage={detailState.currentPage}
        timeRange={detailState.timeRange}
        isLoading={detailState.statementsLoading}
        error={detailState.statementsError}
        currentUserId={currentUserId}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onStatementDeleted={handleStatementDeleted}
        onRetry={handleRetryTimeline}
      />
    </div>
  );
}
