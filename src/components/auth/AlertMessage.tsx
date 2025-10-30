/**
 * AlertMessage Component
 * Alert banner displaying success, error, or info messages at page level
 * Auto-dismissible or manually closable
 */

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type AlertType = "success" | "error" | "info";

interface AlertMessageProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const alertStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: CheckCircle,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: AlertCircle,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
  },
};

export default function AlertMessage({
  type,
  message,
  onClose,
  autoDismiss = false,
  duration = 5000,
}: AlertMessageProps) {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-3 border rounded-md text-sm
        ${styles.container}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="
            flex-shrink-0 p-0.5 rounded-md hover:bg-black/10
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1
            transition-colors duration-200
          "
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
