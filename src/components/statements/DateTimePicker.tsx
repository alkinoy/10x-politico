/**
 * DateTimePicker Component
 *
 * Date and time input component allowing users to specify when the statement was made.
 * Prevents future dates. Uses native HTML5 inputs for broad browser compatibility.
 * Combines date and time into ISO 8601 timestamp.
 */

import { useState, useEffect, useId } from "react";

interface DateTimePickerProps {
  value: string | null; // ISO timestamp
  onChange: (timestamp: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export default function DateTimePicker({ value, onChange, error, disabled = false }: DateTimePickerProps) {
  const dateId = useId();
  const timeId = useId();
  const errorId = `${dateId}-error`;

  // Parse ISO timestamp into date and time parts
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = dateObj.toTimeString().slice(0, 5); // HH:MM
      setDate(dateStr);
      setTime(timeStr);
    }
  }, [value]);

  // Get today's date for max attribute
  const today = new Date().toISOString().split("T")[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    updateTimestamp(newDate, time);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateTimestamp(date, newTime);
  };

  const updateTimestamp = (dateStr: string, timeStr: string) => {
    if (dateStr && timeStr) {
      // Combine date and time into ISO timestamp
      // Use local timezone
      const combinedStr = `${dateStr}T${timeStr}:00`;
      const dateObj = new Date(combinedStr);
      onChange(dateObj.toISOString());
    }
  };

  return (
    <div className="space-y-2">
      <div className="block text-sm font-medium">
        Statement Date & Time <span className="text-red-500">*</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={dateId} className="mb-1 block text-xs text-muted-foreground">
            Date
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            onChange={handleDateChange}
            max={today}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            aria-required="true"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? "border-red-500 focus:ring-red-500" : "border-input"
            }`}
          />
        </div>

        <div>
          <label htmlFor={timeId} className="mb-1 block text-xs text-muted-foreground">
            Time
          </label>
          <input
            id={timeId}
            type="time"
            value={time}
            onChange={handleTimeChange}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-required="true"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? "border-red-500 focus:ring-red-500" : "border-input"
            }`}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">When was this statement made? (Cannot be in the future)</p>

      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
