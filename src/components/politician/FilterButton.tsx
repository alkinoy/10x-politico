/**
 * FilterButton Component
 *
 * Individual filter option button within TimeRangeFilter.
 * Shows active/inactive state clearly with proper accessibility attributes.
 */

import { Button } from "@/components/ui/button";

type TimeRange = "7d" | "30d" | "365d" | "all";

interface FilterButtonProps {
  timeRange: TimeRange;
  label: string;
  isActive: boolean;
  onClick: (timeRange: TimeRange) => void;
  ariaDescription?: string;
}

export default function FilterButton({ timeRange, label, isActive, onClick, ariaDescription }: FilterButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(timeRange)}
      aria-pressed={isActive}
      aria-label={ariaDescription || label}
      className="transition-all"
    >
      {label}
    </Button>
  );
}
