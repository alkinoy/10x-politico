/**
 * PoliticianHeader Component
 *
 * Displays politician identification information at the top of each statement card,
 * including avatar, full name as a clickable link, and party affiliation badge.
 */

import type { PoliticianInStatementDTO } from "@/types";
import PoliticianAvatar from "./PoliticianAvatar";
import PartyBadge from "./PartyBadge";

interface PoliticianHeaderProps {
  politician: PoliticianInStatementDTO;
}

export default function PoliticianHeader({ politician }: PoliticianHeaderProps) {
  const fullName = `${politician.first_name} ${politician.last_name}`;

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <PoliticianAvatar
        name={fullName}
        firstName={politician.first_name}
        lastName={politician.last_name}
        imageUrl={null}
        size="md"
      />

      {/* Name and party info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Politician name as link */}
          <a
            href={`/politicians/${politician.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {fullName}
          </a>

          {/* Party badge */}
          {politician.party && <PartyBadge party={politician.party} />}
        </div>
      </div>
    </div>
  );
}
