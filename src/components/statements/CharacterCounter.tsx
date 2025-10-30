/**
 * CharacterCounter Component
 *
 * Displays character count and limit for statement textarea.
 * Shows warning when approaching limit.
 */

interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
  id?: string;
}

export default function CharacterCounter({ current, max, warningThreshold = 4800, id }: CharacterCounterProps) {
  const isNearLimit = current >= warningThreshold;
  const isAtLimit = current >= max;

  const colorClass = isAtLimit
    ? "text-red-600 font-semibold"
    : isNearLimit
      ? "text-orange-600 font-medium"
      : "text-muted-foreground";

  return (
    <span id={id} className={`text-xs ${colorClass}`} role="status" aria-live="polite" aria-atomic="true">
      {current} / {max}
    </span>
  );
}
