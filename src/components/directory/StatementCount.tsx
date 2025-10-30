/**
 * StatementCount Component
 *
 * Displays the number of statements attributed to the politician.
 * Provides indicator of politician activity.
 */

interface StatementCountProps {
  count: number;
}

export default function StatementCount({ count }: StatementCountProps) {
  // Handle pluralization
  const statementText = count === 1 ? "statement" : "statements";

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
    </div>
  );
}
