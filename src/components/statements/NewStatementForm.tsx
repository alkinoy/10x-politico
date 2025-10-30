/**
 * NewStatementForm Component
 *
 * Main form component for creating new political statements.
 * Manages all form state, validation, submission logic, and user feedback.
 * Coordinates child components and handles Supabase API integration.
 */

import { useState, useEffect } from "react";
import type { PoliticianDTO, CreateStatementCommand, StatementDetailDTO, SingleResponse, ErrorResponse } from "@/types";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import PageHeader from "./PageHeader";
import FormContainer from "./FormContainer";
import PoliticianSelector from "./PoliticianSelector";
import DateTimePicker from "./DateTimePicker";
import StatementTextarea from "./StatementTextarea";
import FormActions from "./FormActions";
import FormErrorAlert from "./FormErrorAlert";

interface NewStatementFormProps {
  politicians: PoliticianDTO[];
  currentUserId: string;
}

interface NewStatementFormState {
  // Field values
  politicianId: string | null;
  statementText: string;
  statementTimestamp: string | null; // ISO timestamp

  // UI state
  isSubmitting: boolean;
  submitError: string | null;

  // Validation errors
  errors: {
    politicianId?: string;
    statementText?: string;
    statementTimestamp?: string;
  };
}

export default function NewStatementForm({ politicians }: NewStatementFormProps) {
  const [formState, setFormState] = useState<NewStatementFormState>({
    politicianId: null,
    statementText: "",
    statementTimestamp: null,
    isSubmitting: false,
    submitError: null,
    errors: {},
  });

  // Warn user about unsaved changes when trying to leave page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = formState.politicianId || formState.statementText.trim() || formState.statementTimestamp;

      if (hasData && !formState.isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formState.politicianId, formState.statementText, formState.statementTimestamp, formState.isSubmitting]);

  const handlePoliticianChange = (politicianId: string) => {
    setFormState((prev) => ({
      ...prev,
      politicianId,
      errors: { ...prev.errors, politicianId: undefined },
    }));
  };

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
    const errors: NewStatementFormState["errors"] = {};

    // Politician ID validation
    if (!formState.politicianId) {
      errors.politicianId = "Please select a politician";
    }

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

    // Validate all fields
    if (!validateForm()) {
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

      // Validate required fields
      if (!formState.politicianId || !formState.statementTimestamp) {
        throw new Error("Missing required fields");
      }

      const command: CreateStatementCommand = {
        politician_id: formState.politicianId,
        statement_text: formState.statementText.trim(),
        statement_timestamp: formState.statementTimestamp,
      };

      const response = await fetch("/api/statements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.error.message);
      }

      const result: SingleResponse<StatementDetailDTO> = await response.json();
      const createdStatement = result.data;

      // Redirect to politician page showing new statement
      window.location.href = `/politicians/${createdStatement.politician_id}`;
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : "Failed to create statement",
      }));
    }
  };

  const handleCancel = () => {
    // Check if form has data and confirm before leaving
    const hasData = formState.politicianId || formState.statementText.trim() || formState.statementTimestamp;

    if (hasData) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }

    // Navigate back or to home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader title="Add New Statement" description="Submit a new political statement. All fields are required." />

      <FormContainer>
        {formState.submitError && (
          <FormErrorAlert
            message={formState.submitError}
            onClose={() => setFormState((prev) => ({ ...prev, submitError: null }))}
          />
        )}

        {/* Politician Selector */}
        <PoliticianSelector
          politicians={politicians}
          value={formState.politicianId}
          onChange={handlePoliticianChange}
          error={formState.errors.politicianId}
          disabled={formState.isSubmitting}
        />

        {/* Date and Time Picker */}
        <DateTimePicker
          value={formState.statementTimestamp}
          onChange={handleDateTimeChange}
          error={formState.errors.statementTimestamp}
          disabled={formState.isSubmitting}
        />

        {/* Statement Text */}
        <StatementTextarea
          value={formState.statementText}
          onChange={handleTextChange}
          error={formState.errors.statementText}
          disabled={formState.isSubmitting}
        />

        {/* Form actions */}
        <FormActions onCancel={handleCancel} isSubmitting={formState.isSubmitting} />
      </FormContainer>
    </form>
  );
}
