/**
 * StatementTextarea Component
 *
 * Multi-line text input for statement text with real-time character counter.
 * Enforces minimum (10 chars) and maximum (5000 chars) limits.
 */

import { useId } from "react";
import CharacterCounter from "./CharacterCounter";

interface StatementTextareaProps {
  value: string;
  onChange: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
}

export default function StatementTextarea({
  value,
  onChange,
  error,
  disabled = false,
  minLength = 10,
  maxLength = 5000,
}: StatementTextareaProps) {
  const textareaId = useId();
  const errorId = `${textareaId}-error`;
  const counterId = `${textareaId}-counter`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Enforce max length
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={textareaId} className="block text-sm font-medium">
        Statement Text <span className="text-red-500">*</span>
      </label>

      <textarea
        id={textareaId}
        data-testid="statement-text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={`${error ? errorId : ""} ${counterId}`.trim()}
        aria-required="true"
        rows={6}
        placeholder="Enter the statement text here..."
        className={`w-full resize-y rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-red-500 focus:ring-red-500" : "border-input"
        }`}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Minimum {minLength} characters (after trimming whitespace)</p>
        <CharacterCounter current={value.length} max={maxLength} id={counterId} />
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
