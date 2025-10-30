/**
 * TimeRangeFilter Component
 *
 * Segmented control allowing users to filter statements by time period.
 * Displays four options with clear visual indication of active selection.
 */

import FilterButton from "./FilterButton";

// Time range type
type TimeRange = "7d" | "30d" | "365d" | "all";

interface TimeRangeFilterProps {
  activeFilter: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

// Filter options configuration
const filterOptions = [
  { value: "7d" as TimeRange, label: "Last 7 Days", description: "Statements from the past week" },
  { value: "30d" as TimeRange, label: "Last 30 Days", description: "Statements from the past month" },
  { value: "365d" as TimeRange, label: "Last Year", description: "Statements from the past year" },
  { value: "all" as TimeRange, label: "All Time", description: "All statements ever made" },
];

export default function TimeRangeFilter({ activeFilter, onChange }: TimeRangeFilterProps) {
  return (
    <div role="group" aria-label="Filter statements by time range" className="flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <FilterButton
          key={option.value}
          timeRange={option.value}
          label={option.label}
          isActive={activeFilter === option.value}
          onClick={onChange}
          ariaDescription={option.description}
        />
      ))}
    </div>
  );
}
