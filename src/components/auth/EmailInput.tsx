/**
 * EmailInput Component
 * Controlled email input field with label and validation error display
 */

import React from "react";
import ValidationError from "./ValidationError";

interface EmailInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
}

export default function EmailInput({ id, value, onChange, onBlur, error, disabled = false }: EmailInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        Email
      </label>
      <input
        type="email"
        id={id}
        name="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete="email"
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 border rounded-md text-sm
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1
          disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-300 bg-red-50 focus-visible:ring-red-500"
              : "border-neutral-300 bg-white hover:border-neutral-400"
          }
        `}
      />
      {error && <ValidationError message={error} fieldId={id} />}
    </div>
  );
}
