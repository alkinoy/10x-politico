/**
 * ValidationError Component
 * Displays validation or API error messages near form fields
 */

import React from "react";
import { AlertCircle } from "lucide-react";

interface ValidationErrorProps {
  message: string;
  fieldId?: string;
}

export default function ValidationError({ message, fieldId }: ValidationErrorProps) {
  return (
    <div
      id={fieldId ? `${fieldId}-error` : undefined}
      className="flex items-start gap-1.5 mt-1.5 text-sm text-red-600"
      role="alert"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
