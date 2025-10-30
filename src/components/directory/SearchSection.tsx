/**
 * SearchSection Component
 *
 * Container for search form and active search indicator.
 * Groups search-related UI elements.
 */

import SearchForm from "./SearchForm";
import ActiveSearchDisplay from "./ActiveSearchDisplay";

interface SearchSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

export default function SearchSection({ searchQuery, onSearch, onClearSearch }: SearchSectionProps) {
  const isSearching = searchQuery.trim() !== "";

  return (
    <section className="space-y-3" aria-label="Search politicians">
      <SearchForm initialQuery={searchQuery} onSubmit={onSearch} onClear={onClearSearch} />

      {isSearching && <ActiveSearchDisplay query={searchQuery} onClear={onClearSearch} />}
    </section>
  );
}
