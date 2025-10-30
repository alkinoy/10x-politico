/**
 * ResultsCount Component
 *
 * Displays the total number of politicians in current results.
 * Provides context for pagination.
 */

interface ResultsCountProps {
  total: number;
  searchQuery?: string;
}

export default function ResultsCount({ total, searchQuery }: ResultsCountProps) {
  // Handle pluralization
  const politicianText = total === 1 ? "politician" : "politicians";

  return (
    <div className="text-sm text-gray-600">
      {searchQuery ? (
        <p>
          Found <span className="font-semibold">{total}</span> {politicianText} matching{" "}
          <span className="font-semibold">&quot;{searchQuery}&quot;</span>
        </p>
      ) : (
        <p>
          Showing <span className="font-semibold">{total}</span> {politicianText}
        </p>
      )}
    </div>
  );
}
