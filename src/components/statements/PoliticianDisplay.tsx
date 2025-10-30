/**
 * PoliticianDisplay Component
 *
 * Displays the selected politician in read-only mode for the edit statement form.
 * Shows politician name with party badge and a hint that it cannot be changed.
 */

import type { PoliticianInStatementDTO } from "@/types";
import PartyBadge from "@/components/feed/PartyBadge";

interface PoliticianDisplayProps {
  politician: PoliticianInStatementDTO;
}

export default function PoliticianDisplay({ politician }: PoliticianDisplayProps) {
  const fullName = `${politician.first_name} ${politician.last_name}`;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium leading-none">Politician</div>

      <div className="rounded-md border border-input bg-muted/50 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium text-base">{fullName}</p>
            <div className="mt-1">
              <PartyBadge party={politician.party} size="sm" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">The politician cannot be changed after statement creation</p>
      </div>
    </div>
  );
}
