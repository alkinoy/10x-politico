/**
 * PoliticiansDirectory Component
 *
 * Main interactive container for the politicians directory.
 * Manages search state, data fetching, pagination, and orchestrates child components.
 * Handles both search and browse modes.
 */

import { useState, useCallback } from "react";
import type { PaginatedResponse, PoliticianDTO, PaginationDTO } from "@/types";

// Child components
import PageHeader from "./directory/PageHeader";
import SearchSection from "./directory/SearchSection";
import ResultsCount from "./directory/ResultsCount";
import PoliticiansGrid from "./directory/PoliticiansGrid";
import PoliticiansLoadingState from "./directory/PoliticiansLoadingState";
import PoliticiansErrorState from "./directory/PoliticiansErrorState";
import PoliticiansEmptyState from "./directory/PoliticiansEmptyState";
import PaginationControls from "./politician/PaginationControls";

interface PoliticiansDirectoryProps {
  initialData: PaginatedResponse<PoliticianDTO>;
  initialPage: number;
  initialSearchQuery?: string;
  initialError?: string | null;
}

interface DirectoryState {
  isLoading: boolean;
  error: Error | null;
  politicians: PoliticianDTO[];
  pagination: PaginationDTO;
  currentPage: number;
  searchQuery: string;
}

export default function PoliticiansDirectory({
  initialData,
  initialPage,
  initialSearchQuery = "",
  initialError = null,
}: PoliticiansDirectoryProps) {
  // Initialize state from props
  const [state, setState] = useState<DirectoryState>({
    isLoading: false,
    error: initialError ? new Error(initialError) : null,
    politicians: initialData.data,
    pagination: initialData.pagination,
    currentPage: initialPage,
    searchQuery: initialSearchQuery,
  });

  /**
   * Fetch politicians from API
   * Maintains search query and updates URL
   */
  const fetchPoliticians = useCallback(async (page = 1, search?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        sort: "last_name",
        order: "asc",
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(`/api/politicians?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to load politicians");
      }

      const data: PaginatedResponse<PoliticianDTO> = await response.json();

      setState({
        isLoading: false,
        error: null,
        politicians: data.data,
        pagination: data.pagination,
        currentPage: page,
        searchQuery: search || "",
      });

      // Update URL without reload
      updateURL(page, search);

      // Scroll to top after page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, []);

  /**
   * Update browser URL with current search and page
   */
  const updateURL = (page: number, search?: string) => {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set("page", page.toString());
    }

    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    const queryString = params.toString();
    const newURL = queryString ? `/politicians?${queryString}` : "/politicians";

    window.history.pushState({}, "", newURL);
  };

  /**
   * Handle search form submission
   * Resets to page 1 with new search query
   */
  const handleSearch = useCallback(
    (query: string) => {
      fetchPoliticians(1, query);
    },
    [fetchPoliticians]
  );

  /**
   * Handle clear search
   * Resets to page 1 without search query
   */
  const handleClearSearch = useCallback(() => {
    fetchPoliticians(1, "");
  }, [fetchPoliticians]);

  /**
   * Handle page change
   * Maintains current search query
   */
  const handlePageChange = useCallback(
    (page: number) => {
      fetchPoliticians(page, state.searchQuery);
    },
    [fetchPoliticians, state.searchQuery]
  );

  /**
   * Handle retry after error
   * Maintains current page and search
   */
  const handleRetry = useCallback(() => {
    fetchPoliticians(state.currentPage, state.searchQuery);
  }, [fetchPoliticians, state.currentPage, state.searchQuery]);

  // Determine which view to render
  const hasSearch = state.searchQuery.trim() !== "";
  const hasResults = state.politicians.length > 0;
  const hasError = state.error !== null;
  const showPagination = hasResults && state.pagination.total_pages > 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Politicians Directory" description="Browse and search all politicians in our database" />

      {/* Search Section */}
      <SearchSection searchQuery={state.searchQuery} onSearch={handleSearch} onClearSearch={handleClearSearch} />

      {/* Results Count */}
      {hasResults && !state.isLoading && !hasError && (
        <ResultsCount total={state.pagination.total} searchQuery={hasSearch ? state.searchQuery : undefined} />
      )}

      {/* Loading State */}
      {state.isLoading && <PoliticiansLoadingState count={12} />}

      {/* Error State */}
      {hasError && !state.isLoading && <PoliticiansErrorState error={state.error} onRetry={handleRetry} />}

      {/* Empty State */}
      {!hasResults && !state.isLoading && !hasError && (
        <PoliticiansEmptyState
          isSearching={hasSearch}
          searchQuery={state.searchQuery}
          onClearSearch={handleClearSearch}
        />
      )}

      {/* Politicians Grid */}
      {hasResults && !state.isLoading && !hasError && <PoliticiansGrid politicians={state.politicians} />}

      {/* Pagination Controls */}
      {showPagination && !state.isLoading && !hasError && (
        <PaginationControls
          currentPage={state.currentPage}
          totalPages={state.pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
