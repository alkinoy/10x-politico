/**
 * UserStatementsSection Component
 *
 * Displays a list of statements created by the user with pagination.
 * Shows edit/delete controls for statements within the grace period.
 */

import { useState, useEffect, useCallback } from "react";
import type { StatementDetailDTO, PaginationDTO } from "@/types";
import { Button } from "@/components/ui/button";
import GracePeriodIndicator from "@/components/GracePeriodIndicator";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface UserStatementsSectionProps {
  userId: string;
}

export default function UserStatementsSection({ userId }: UserStatementsSectionProps) {
  const [statements, setStatements] = useState<StatementDetailDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user's statements
  const fetchStatements = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch statements filtered by user ID
        const params = new URLSearchParams({
          created_by_user_id: userId,
          page: page.toString(),
          limit: "10",
          sort_by: "created_at",
          order: "desc",
        });

        const response = await fetch(`/api/statements?${params}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load statements");
        }

        const data = await response.json();
        setStatements(data.data || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("Error fetching statements:", err);
        setError("Failed to load your statements. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Load statements on mount and when page changes
  useEffect(() => {
    fetchStatements(currentPage);
  }, [currentPage, fetchStatements]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle statement deletion
  const handleDeleteStatement = useCallback(
    async (statementId: string) => {
      if (!confirm("Are you sure you want to delete this statement? This action cannot be undone.")) {
        return;
      }

      setDeletingId(statementId);

      try {
        // Get the current session for authentication
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Authentication required. Please sign in again.");
        }

        const response = await fetch(`/api/statements/${statementId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error?.message || "Failed to delete statement";
          throw new Error(errorMessage);
        }

        // Remove the deleted statement from the list
        setStatements((prev) => prev.filter((s) => s.id !== statementId));

        // If this was the last statement on the page and not the first page, go to previous page
        if (statements.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else if (statements.length > 1) {
          // Just remove from current view, no need to refetch
          // Statement is already removed from state above
        } else {
          // This was the only statement, refresh to show empty state
          fetchStatements(currentPage);
        }
      } catch (err) {
        console.error("Error deleting statement:", err);
        alert(err instanceof Error ? err.message : "Failed to delete statement. Please try again.");
      } finally {
        setDeletingId(null);
      }
    },
    [statements.length, currentPage, fetchStatements]
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-6 shadow-sm">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchStatements(currentPage)} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (statements.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">You haven&apos;t submitted any statements yet.</p>
        <Button variant="default" size="sm" asChild className="mt-4">
          <a href="/statements/new">Add Your First Statement</a>
        </Button>
      </div>
    );
  }

  // Render statements list
  return (
    <div className="space-y-4">
      {/* Statements List */}
      <div className="space-y-4">
        {statements.map((statement) => (
          <article key={statement.id} className="rounded-xl border bg-card p-6 shadow-sm">
            {/* Statement Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">
                  <a href={`/politicians/${statement.politician_id}`} className="hover:underline">
                    {statement.politician.first_name} {statement.politician.last_name}
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground">{statement.politician.party.name}</p>
              </div>
              {(statement.can_edit || statement.can_delete) && (
                <div className="flex items-center gap-2">
                  {statement.can_edit && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/statements/${statement.id}/edit`}>Edit</a>
                    </Button>
                  )}
                  {statement.can_delete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStatement(statement.id)}
                      disabled={deletingId === statement.id}
                      aria-busy={deletingId === statement.id}
                    >
                      {deletingId === statement.id ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Statement Content */}
            <p className="mb-3 text-sm">{statement.statement_text}</p>

            {/* Statement Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Statement made: {formatDate(statement.statement_timestamp)}</span>
              <span>Added: {formatDate(statement.created_at)}</span>
              {(statement.can_edit || statement.can_delete) && (
                <GracePeriodIndicator createdAt={statement.created_at} />
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.total_pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.total_pages}
            aria-label="Next page"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
