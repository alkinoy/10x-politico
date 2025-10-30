/**
 * PasswordInput Component
 * Controlled password input field with visibility toggle, label, and validation error display
 */

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ValidationError from "./ValidationError";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  showHint?: boolean;
  minLength?: number;
  label?: string;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  showHint = false,
  minLength = 6,
  label = "Password",
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={label === "Password" ? "current-password" : "new-password"}
          required
          minLength={minLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : showHint ? `${id}-hint` : undefined}
          className={`
            w-full px-3 py-2 pr-10 border rounded-md text-sm
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
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showHint && !error && (
        <p id={`${id}-hint`} className="text-xs text-neutral-600">
          Minimum {minLength} characters
        </p>
      )}
      {error && <ValidationError message={error} fieldId={id} />}
    </div>
  );
}
