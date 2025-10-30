/**
 * PoliticianNotFound Component
 *
 * 404 state displayed when politician ID is invalid or politician doesn't exist.
 * Provides navigation back to home/directory.
 */

import { Button } from "@/components/ui/button";

interface PoliticianNotFoundProps {
  politicianId: string;
}

export default function PoliticianNotFound({ politicianId }: PoliticianNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Error Icon */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politician Not Found</h1>
      <p className="text-gray-600 mb-2 max-w-md">
        We couldn&apos;t find a politician with the ID you&apos;re looking for.
      </p>
      <p className="text-sm text-gray-500 mb-8 font-mono">ID: {politicianId}</p>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => (window.location.href = "/")}>Go to Home</Button>
      </div>
    </div>
  );
}
