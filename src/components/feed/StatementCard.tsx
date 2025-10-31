/**
 * StatementCard Component
 *
 * The core reusable component displaying a single statement with all metadata,
 * politician information, and available actions. Handles text truncation/expansion,
 * displays party badges, and conditionally shows edit/delete controls for statement
 * owners within the grace period.
 */

import type { StatementDTO } from "@/types";
import PoliticianHeader from "./PoliticianHeader";

interface StatementCardProps {
  statement: StatementDTO;
}

export default function StatementCard({ statement }: StatementCardProps) {
  // Format timestamps
  const statementDate = new Date(statement.statement_timestamp);
  const submittedDate = new Date(statement.created_at);

  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate relative time for submission
  const getRelativeTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  return (
    <article
      data-testid="statement-card"
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      {/* Politician Header */}
      <div className="mb-4">
        <PoliticianHeader politician={statement.politician} />
      </div>

      {/* Statement Content */}
      <div className="mb-4">
        {/* Statement timestamp */}
        <time
          data-testid="statement-timestamp"
          dateTime={statement.statement_timestamp}
          className="text-sm font-medium text-gray-700 block mb-2"
        >
          Statement made on {formatDate(statementDate)}
        </time>

        {/* Statement text */}
        <p data-testid="statement-text" className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {statement.statement_text}
        </p>
      </div>

      {/* Statement Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span>Added by</span>
          <span className="font-medium text-gray-700">{statement.created_by.display_name}</span>
          <span>·</span>
          <time dateTime={statement.created_at}>{getRelativeTime(submittedDate)}</time>
        </div>

        {/* Action buttons placeholder */}
        <div className="flex items-center gap-2">
          {/* TODO: Add edit/delete buttons for owners within grace period */}
          {/* TODO: Add report button */}
        </div>
      </div>
    </article>
  );
}
