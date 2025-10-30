/**
 * EditStatementForm Component
 *
 * Main form component for editing existing political statements within grace period.
 * Pre-fills form with existing data, manages validation, submission, and handles grace period.
 * Coordinates child components and handles Supabase API integration.
 */

import { useState, useEffect } from "react";
import type { StatementDetailDTO, UpdateStatementCommand, SingleResponse, ErrorResponse } from "@/types";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import PageHeader from "./PageHeader";
import FormContainer from "./FormContainer";
import PoliticianDisplay from "./PoliticianDisplay";
import DateTimePicker from "./DateTimePicker";
import StatementTextarea from "./StatementTextarea";
import FormActions from "./FormActions";
import FormErrorAlert from "./FormErrorAlert";
import GracePeriodIndicator from "@/components/GracePeriodIndicator";

interface EditStatementFormProps {
  statement: StatementDetailDTO;
  currentUserId: string;
}

interface EditStatementFormState {
  // Editable fields
  statementText: string;
  statementTimestamp: string; // ISO timestamp

  // UI state
  isSubmitting: boolean;
  submitError: string | null;

  // Validation errors
  errors: {
    statementText?: string;
    statementTimestamp?: string;
  };

  // Grace period
  gracePeriodExpired: boolean;
}

export default function EditStatementForm({ statement }: EditStatementFormProps) {
  const [formState, setFormState] = useState<EditStatementFormState>({
    statementText: statement.statement_text,
    statementTimestamp: statement.statement_timestamp,
    isSubmitting: false,
    submitError: null,
    errors: {},
    gracePeriodExpired: false,
  });

  // Check if initial data has grace period expired
  useEffect(() => {
    if (!statement.can_edit) {
      setFormState((prev) => ({ ...prev, gracePeriodExpired: true }));
    }
  }, [statement.can_edit]);

  // Monitor grace period expiration
  useEffect(() => {
    const checkGracePeriod = () => {
      const createdAtMs = new Date(statement.created_at).getTime();
      const gracePeriodMs = 15 * 60 * 1000; // 15 minutes
      const expiresAtMs = createdAtMs + gracePeriodMs;
      const remainingMs = expiresAtMs - Date.now();

      if (remainingMs <= 0) {
        setFormState((prev) => ({ ...prev, gracePeriodExpired: true }));
      }
    };

    // Check immediately
    checkGracePeriod();

    // Check every minute
    const interval = setInterval(checkGracePeriod, 60000);

    return () => clearInterval(interval);
  }, [statement.created_at]);

  // Warn user about unsaved changes when trying to leave page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasChanges =
        formState.statementText !== statement.statement_text ||
        formState.statementTimestamp !== statement.statement_timestamp;

      if (hasChanges && !formState.isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formState.statementText, formState.statementTimestamp, formState.isSubmitting, statement]);

  const handleTextChange = (text: string) => {
    setFormState((prev) => ({
      ...prev,
      statementText: text,
      errors: { ...prev.errors, statementText: undefined },
    }));
  };

  const handleDateTimeChange = (timestamp: string) => {
    setFormState((prev) => ({
      ...prev,
      statementTimestamp: timestamp,
      errors: { ...prev.errors, statementTimestamp: undefined },
    }));
  };

  const validateForm = (): boolean => {
    const errors: EditStatementFormState["errors"] = {};

    // Statement text validation
    const trimmedText = formState.statementText.trim();
    if (!trimmedText) {
      errors.statementText = "Statement text is required";
    } else if (trimmedText.length < 10) {
      errors.statementText = `Statement must be at least 10 characters (currently ${trimmedText.length})`;
    } else if (formState.statementText.length > 5000) {
      errors.statementText = "Statement cannot exceed 5000 characters";
    }

    // Timestamp validation
    if (!formState.statementTimestamp) {
      errors.statementTimestamp = "Please select when the statement was made";
    } else {
      const statementDate = new Date(formState.statementTimestamp);
      const now = new Date();
      if (statementDate.getTime() > now.getTime()) {
        errors.statementTimestamp = "Statement date cannot be in the future";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      // Focus first error field for better UX
      setTimeout(() => {
        const firstErrorField = document.querySelector("[aria-invalid='true']") as HTMLElement;
        if (firstErrorField) {
          firstErrorField.focus();
          firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if grace period expired
    if (formState.gracePeriodExpired) {
      setFormState((prev) => ({
        ...prev,
        submitError:
          "The grace period has expired while you were editing. You can no longer save changes to this statement.",
      }));
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Check if there are actual changes
    const hasChanges =
      formState.statementText.trim() !== statement.statement_text ||
      formState.statementTimestamp !== statement.statement_timestamp;

    if (!hasChanges) {
      // No changes, just redirect back
      window.location.href = `/politicians/${statement.politician_id}`;
      return;
    }

    // Submit to API
    setFormState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const command: UpdateStatementCommand = {};

      // Only include changed fields
      if (formState.statementText.trim() !== statement.statement_text) {
        command.statement_text = formState.statementText.trim();
      }
      if (formState.statementTimestamp !== statement.statement_timestamp) {
        command.statement_timestamp = formState.statementTimestamp;
      }

      const response = await fetch(`/api/statements/${statement.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json();

        // Handle specific error codes
        if (error.error.code === "GRACE_PERIOD_EXPIRED" || error.error.code === "PERMISSION_DENIED") {
          setFormState((prev) => ({
            ...prev,
            isSubmitting: false,
            submitError: error.error.message,
            gracePeriodExpired: true,
          }));
          return;
        }

        throw new Error(error.error.message);
      }

      const result: SingleResponse<StatementDetailDTO> = await response.json();
      const updatedStatement = result.data;

      // Redirect to politician page showing updated statement
      window.location.href = `/politicians/${updatedStatement.politician_id}`;
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : "Failed to update statement",
      }));
    }
  };

  const handleCancel = () => {
    // Check if form has changes and confirm before leaving
    const hasChanges =
      formState.statementText !== statement.statement_text ||
      formState.statementTimestamp !== statement.statement_timestamp;

    if (hasChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }

    // Navigate to politician page
    window.location.href = `/politicians/${statement.politician_id}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <PageHeader
          title="Edit Statement"
          description="Update your statement within the grace period. The politician cannot be changed."
        />
        <div className="mt-3">
          <GracePeriodIndicator createdAt={statement.created_at} gracePeriodMinutes={15} />
        </div>
      </div>

      <FormContainer>
        {formState.submitError && (
          <FormErrorAlert
            message={formState.submitError}
            onClose={() => setFormState((prev) => ({ ...prev, submitError: null }))}
          />
        )}

        {formState.gracePeriodExpired && !formState.submitError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800" role="alert">
            <p className="font-semibold">Grace Period Expired</p>
            <p className="text-sm mt-1">
              The 15-minute grace period has expired. You can no longer edit this statement.
            </p>
          </div>
        )}

        {/* Read-only Politician Display */}
        <PoliticianDisplay politician={statement.politician} />

        {/* Date and Time Picker */}
        <DateTimePicker
          value={formState.statementTimestamp}
          onChange={handleDateTimeChange}
          error={formState.errors.statementTimestamp}
          disabled={formState.isSubmitting || formState.gracePeriodExpired}
        />

        {/* Statement Text */}
        <StatementTextarea
          value={formState.statementText}
          onChange={handleTextChange}
          error={formState.errors.statementText}
          disabled={formState.isSubmitting || formState.gracePeriodExpired}
        />

        {/* Form actions */}
        <FormActions
          onCancel={handleCancel}
          isSubmitting={formState.isSubmitting}
          submitText="Save Changes"
          isDisabled={formState.gracePeriodExpired}
        />
      </FormContainer>
    </form>
  );
}
