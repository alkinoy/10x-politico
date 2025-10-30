/**
 * StatementCountBadge Component
 *
 * Badge displaying total number of statements attributed to politician.
 * Provides quick overview of politician's activity level.
 */

interface StatementCountBadgeProps {
  count: number;
}

export default function StatementCountBadge({ count }: StatementCountBadgeProps) {
  const statementText = count === 1 ? "statement" : "statements";

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span>
        {count} {statementText}
      </span>
    </span>
  );
}
