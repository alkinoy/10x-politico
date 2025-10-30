/**
 * GracePeriodIndicator Component
 *
 * Shows remaining time for edit/delete actions on statements.
 * Updates every minute to show current remaining time.
 */

import { useState, useEffect, useMemo } from "react";

interface GracePeriodIndicatorProps {
  createdAt: string;
  gracePeriodMinutes?: number;
}

export default function GracePeriodIndicator({ createdAt, gracePeriodMinutes = 15 }: GracePeriodIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time
  const remainingInfo = useMemo(() => {
    const createdAtMs = new Date(createdAt).getTime();
    const gracePeriodMs = gracePeriodMinutes * 60 * 1000;
    const expiresAtMs = createdAtMs + gracePeriodMs;
    const remainingMs = expiresAtMs - currentTime;

    if (remainingMs <= 0) {
      return { expired: true, minutes: 0, isWarning: false };
    }

    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const isWarning = remainingMinutes <= 5;

    return { expired: false, minutes: remainingMinutes, isWarning };
  }, [createdAt, gracePeriodMinutes, currentTime]);

  if (remainingInfo.expired) {
    return <span className="text-xs text-muted-foreground">Edit period expired</span>;
  }

  return (
    <span
      className={`text-xs ${
        remainingInfo.isWarning ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"
      }`}
      aria-live="polite"
    >
      {remainingInfo.minutes} {remainingInfo.minutes === 1 ? "minute" : "minutes"} remaining to edit
    </span>
  );
}
