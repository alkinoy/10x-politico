/**
 * PoliticiansGrid Component
 *
 * Grid container that displays politician cards in a responsive layout.
 * Adapts from single column on mobile to multi-column on desktop.
 */

import PoliticianCard from "./PoliticianCard";
import type { PoliticianDTO } from "@/types";

interface PoliticiansGridProps {
  politicians: PoliticianDTO[];
  statementCounts?: Record<string, number>;
}

export default function PoliticiansGrid({ politicians, statementCounts }: PoliticiansGridProps) {
  if (politicians.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Politicians directory">
      {politicians.map((politician) => (
        <PoliticianCard key={politician.id} politician={politician} statementCount={statementCounts?.[politician.id]} />
      ))}
    </section>
  );
}
