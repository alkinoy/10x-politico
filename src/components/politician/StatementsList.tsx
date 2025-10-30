/**
 * StatementsList Component
 *
 * Container for statement cards in the timeline with pagination.
 * Displays statements in reverse chronological order.
 */

import type { StatementDetailDTO, PaginationDTO } from "@/types";
import StatementCard from "@/components/feed/StatementCard";
import PaginationControls from "./PaginationControls";

interface StatementsListProps {
  statements: StatementDetailDTO[];
  pagination: PaginationDTO;
  currentPage: number;
  currentUserId?: string | null;
  onStatementDeleted: (statementId: string) => void;
  onPageChange: (page: number) => void;
}

export default function StatementsList({
  statements,
  pagination,
  currentPage,
  currentUserId,
  onStatementDeleted,
  onPageChange,
}: StatementsListProps) {
  return (
    <div className="space-y-6">
      {/* Statement Cards */}
      <div className="space-y-4">
        {statements.map((statement) => (
          <StatementCard
            key={statement.id}
            statement={statement}
            currentUserId={currentUserId}
            onDeleted={onStatementDeleted}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.total_pages > 1 && (
        <PaginationControls currentPage={currentPage} totalPages={pagination.total_pages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
