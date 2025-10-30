/**
 * PoliticianCard Component
 *
 * Card component displaying politician summary information.
 * Shows avatar, name, party, biography preview, and statement count.
 * Entire card is clickable and links to politician detail page.
 */

import PoliticianAvatar from "@/components/feed/PoliticianAvatar";
import PartyBadge from "@/components/feed/PartyBadge";
import BiographyPreview from "./BiographyPreview";
import StatementCount from "./StatementCount";
import type { PoliticianDTO } from "@/types";

interface PoliticianCardProps {
  politician: PoliticianDTO;
  statementCount?: number;
}

export default function PoliticianCard({ politician, statementCount }: PoliticianCardProps) {
  const fullName = `${politician.first_name} ${politician.last_name}`;

  return (
    <article className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <a
        href={`/politicians/${politician.id}`}
        className="block p-6 space-y-4"
        aria-label={`View ${fullName}'s profile and statements`}
      >
        {/* Header: Avatar + Name + Party */}
        <div className="flex items-start gap-3">
          <PoliticianAvatar
            name={fullName}
            firstName={politician.first_name}
            lastName={politician.last_name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {fullName}
            </h3>
            <div className="mt-1">
              <PartyBadge party={politician.party} variant="compact" />
            </div>
          </div>
        </div>

        {/* Biography Preview */}
        <BiographyPreview biography={politician.biography} maxLength={150} />

        {/* Footer: Statement Count */}
        {statementCount !== undefined && (
          <div className="pt-2 border-t border-gray-100">
            <StatementCount count={statementCount} />
          </div>
        )}
      </a>
    </article>
  );
}
