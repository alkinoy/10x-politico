/**
 * PoliticianHeader Component
 *
 * Profile information card displaying comprehensive politician details.
 * Shows avatar, name, party affiliation, biography, and statement count in a
 * visually prominent layout.
 */

import type { PoliticianDetailDTO } from "@/types";
import PoliticianAvatar from "@/components/feed/PoliticianAvatar";
import PartyBadge from "@/components/feed/PartyBadge";
import Biography from "./Biography";
import StatementCountBadge from "./StatementCountBadge";

interface PoliticianHeaderProps {
  politician: PoliticianDetailDTO;
}

export default function PoliticianHeader({ politician }: PoliticianHeaderProps) {
  const fullName = `${politician.first_name} ${politician.last_name}`;

  return (
    <header className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar - larger size for detail page */}
        <div className="flex-shrink-0">
          <PoliticianAvatar
            name={fullName}
            firstName={politician.first_name}
            lastName={politician.last_name}
            size="xl"
          />
        </div>

        {/* Politician Information */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Name and Party */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{fullName}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <PartyBadge party={politician.party} variant="default" />
              <StatementCountBadge count={politician.statements_count} />
            </div>
          </div>

          {/* Biography */}
          <Biography biography={politician.biography} />
        </div>
      </div>
    </header>
  );
}
