/**
 * RecentStatementsFeed Component
 *
 * Main interactive container for the statements feed.
 * Manages data fetching, pagination state, loading states, and orchestrates child components.
 * Handles client-side navigation when users change pages.
 */

import { useState } from "react";
import type { PaginatedResponse, StatementDTO } from "@/types";
import StatementsLoadingState from "./StatementsLoadingState";
import StatementsErrorState from "./StatementsErrorState";
import StatementsEmptyState from "./StatementsEmptyState";
import StatementCard from "./StatementCard";

// View-specific state types
interface FeedState {
  isLoading: boolean;
  error: Error | null;
  statements: StatementDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  currentPage: number;
}

interface RecentStatementsFeedProps {
  initialData: PaginatedResponse<StatementDTO>;
  initialPage: number;
  currentUserId?: string | null;
}

export default function RecentStatementsFeed({ initialData, initialPage, currentUserId }: RecentStatementsFeedProps) {
  // ========================================================================
  // State Management
  // ========================================================================

  const [feedState, setFeedState] = useState<FeedState>({
    isLoading: false,
    error: null,
    statements: initialData.data,
    pagination: initialData.pagination,
    currentPage: initialPage,
  });

  // ========================================================================
  // Data Fetching
  // ========================================================================

  /**
   * Fetch statements for a specific page
   */
  const fetchStatements = async (page: number) => {
    setFeedState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        sort_by: "created_at",
        order: "desc",
      });

      const response = await fetch(`/api/statements?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to load statements");
      }

      const data: PaginatedResponse<StatementDTO> = await response.json();

      setFeedState({
        isLoading: false,
        error: null,
        statements: data.data,
        pagination: data.pagination,
        currentPage: page,
      });

      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set("page", page.toString());
      window.history.pushState({}, "", url.toString());

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFeedState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  };

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle page change from pagination controls
   */
  const handlePageChange = (page: number) => {
    if (page !== feedState.currentPage) {
      fetchStatements(page);
    }
  };

  /**
   * Handle statement deletion
   */
  const handleStatementDeleted = (statementId: string) => {
    // Remove statement from local state
    setFeedState((prev) => ({
      ...prev,
      statements: prev.statements.filter((s) => s.id !== statementId),
    }));
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    fetchStatements(feedState.currentPage);
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recent Statements</h1>
        <p className="text-gray-600">Browse the latest political statements submitted by the community</p>
      </header>

      {/* Loading State */}
      {feedState.isLoading && <StatementsLoadingState count={5} />}

      {/* Error State */}
      {feedState.error && !feedState.isLoading && (
        <StatementsErrorState error={feedState.error} onRetry={handleRetry} />
      )}

      {/* Empty State */}
      {!feedState.isLoading && !feedState.error && feedState.statements.length === 0 && (
        <StatementsEmptyState isAuthenticated={!!currentUserId} />
      )}

      {/* Statements List */}
      {!feedState.isLoading && !feedState.error && feedState.statements.length > 0 && (
        <section aria-label="Recent statements" className="space-y-4">
          {feedState.statements.map((statement) => (
            <StatementCard
              key={statement.id}
              statement={statement}
              currentUserId={currentUserId}
              onDeleted={handleStatementDeleted}
            />
          ))}
        </section>
      )}

      {/* Pagination Controls */}
      {!feedState.isLoading && !feedState.error && feedState.pagination.total_pages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(feedState.currentPage - 1)}
            disabled={feedState.currentPage === 1}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {feedState.currentPage} of {feedState.pagination.total_pages}
          </span>

          <button
            onClick={() => handlePageChange(feedState.currentPage + 1)}
            disabled={feedState.currentPage === feedState.pagination.total_pages}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
