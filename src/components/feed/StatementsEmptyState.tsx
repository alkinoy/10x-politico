/**
 * StatementsEmptyState Component
 *
 * Empty state displayed when no statements exist in the system.
 * Provides context and optional call-to-action for authenticated users.
 */

interface StatementsEmptyStateProps {
  isAuthenticated: boolean;
}

export default function StatementsEmptyState({ isAuthenticated }: StatementsEmptyStateProps) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
      {/* Empty State Icon */}
      <div className="flex justify-center mb-4">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>

      {/* Empty State Message */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Statements Yet</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Be the first to contribute! Add a political statement to help track what politicians say over time.
      </p>

      {/* Call to Action (Authenticated Users Only) */}
      {isAuthenticated ? (
        <a
          href="/statements/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add the First Statement
        </a>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Sign in to add your first statement</p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </a>
        </div>
      )}
    </div>
  );
}
