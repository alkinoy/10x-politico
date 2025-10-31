/**
 * PartyBadge Component
 *
 * Displays political party affiliation with color accent and text label.
 * Ensures accessibility by not relying on color alone for meaning.
 */

import type { PartyInStatementDTO } from "@/types";

interface PartyBadgeProps {
  party: PartyInStatementDTO;
  variant?: "default" | "compact";
  "data-testid"?: string;
}

export default function PartyBadge({ party, variant = "default", "data-testid": dataTestId }: PartyBadgeProps) {
  const displayText = variant === "compact" && party.abbreviation ? party.abbreviation : party.name;

  // Generate background color with opacity for better contrast
  const backgroundColor = party.color_hex
    ? `${party.color_hex}20` // 20% opacity
    : "#e5e7eb"; // gray-200 fallback

  const borderColor = party.color_hex || "#d1d5db"; // gray-300 fallback
  const textColor = party.color_hex || "#374151"; // gray-700 fallback

  return (
    <span
      data-testid={dataTestId}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor,
        color: textColor,
        borderColor,
        borderWidth: "1px",
      }}
      aria-label={`Political party: ${party.name}`}
    >
      {displayText}
    </span>
  );
}
