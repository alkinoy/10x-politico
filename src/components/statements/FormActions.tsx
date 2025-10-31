/**
 * FormActions Component
 *
 * Container for form action buttons (submit and cancel),
 * providing consistent spacing and layout.
 */

import LoadingSpinner from "./LoadingSpinner";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isDisabled?: boolean;
  submitText?: string;
}

export default function FormActions({
  onCancel,
  isSubmitting,
  isDisabled = false,
  submitText = "Submit Statement",
}: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end sm:gap-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting || isDisabled}
        className="w-full rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Cancel
      </button>
      <button
        type="submit"
        data-testid="submit-button"
        disabled={isSubmitting || isDisabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting && <LoadingSpinner size="sm" data-testid="loading-indicator" />}
        {isSubmitting ? "Submitting..." : submitText}
      </button>
    </div>
  );
}
