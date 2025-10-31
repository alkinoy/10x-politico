/**
 * AddPoliticianForm Component
 *
 * Form component for creating new politicians.
 * Includes inline party creation functionality.
 */

import { useState, useEffect } from "react";
import type {
  PartyDTO,
  CreatePoliticianCommand,
  CreatePartyCommand,
  PoliticianDTO,
  SingleResponse,
  ErrorResponse,
} from "@/types";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddPoliticianFormProps {
  parties: PartyDTO[];
}

interface FormState {
  // Politician fields
  firstName: string;
  lastName: string;
  partyId: string;
  biography: string;

  // Party creation fields
  showPartyForm: boolean;
  newPartyName: string;
  newPartyAbbreviation: string;
  newPartyDescription: string;
  newPartyColor: string;

  // UI state
  isSubmitting: boolean;
  isCreatingParty: boolean;
  submitError: string | null;

  // Available parties (updates when new party is created)
  availableParties: PartyDTO[];

  // Validation errors
  errors: {
    firstName?: string;
    lastName?: string;
    partyId?: string;
    biography?: string;
    newPartyName?: string;
    newPartyColor?: string;
  };
}

export default function AddPoliticianForm({ parties }: AddPoliticianFormProps) {
  const [formState, setFormState] = useState<FormState>({
    firstName: "",
    lastName: "",
    partyId: "",
    biography: "",
    showPartyForm: false,
    newPartyName: "",
    newPartyAbbreviation: "",
    newPartyDescription: "",
    newPartyColor: "#0000FF",
    isSubmitting: false,
    isCreatingParty: false,
    submitError: null,
    availableParties: parties,
    errors: {},
  });

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = formState.firstName.trim() || formState.lastName.trim() || formState.biography.trim();

      if (hasData && !formState.isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formState.firstName, formState.lastName, formState.biography, formState.isSubmitting]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const handleCreateParty = async () => {
    // Validate party form
    const errors: FormState["errors"] = {};

    if (!formState.newPartyName.trim()) {
      errors.newPartyName = "Party name is required";
    } else if (formState.newPartyName.length > 100) {
      errors.newPartyName = "Party name cannot exceed 100 characters";
    }

    if (formState.newPartyColor && !/^#[0-9A-Fa-f]{6}$/.test(formState.newPartyColor)) {
      errors.newPartyColor = "Invalid color format. Use #RRGGBB format (e.g., #0000FF)";
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    setFormState((prev) => ({ ...prev, isCreatingParty: true, submitError: null }));

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFormState((prev) => ({
          ...prev,
          isCreatingParty: false,
          submitError: "You must be signed in to create a party",
        }));
        return;
      }

      const partyCommand: CreatePartyCommand = {
        name: formState.newPartyName.trim(),
        abbreviation: formState.newPartyAbbreviation.trim() || null,
        description: formState.newPartyDescription.trim() || null,
        color_hex: formState.newPartyColor || null,
      };

      const response = await fetch("/api/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(partyCommand),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error.message || "Failed to create party");
      }

      const result: SingleResponse<PartyDTO> = await response.json();
      const newParty = result.data;

      // Add new party to available parties and select it
      setFormState((prev) => ({
        ...prev,
        availableParties: [...prev.availableParties, newParty],
        partyId: newParty.id,
        showPartyForm: false,
        newPartyName: "",
        newPartyAbbreviation: "",
        newPartyDescription: "",
        newPartyColor: "#0000FF",
        isCreatingParty: false,
        errors: { ...prev.errors, partyId: undefined },
      }));
    } catch (error) {
      console.error("Error creating party:", error);
      setFormState((prev) => ({
        ...prev,
        isCreatingParty: false,
        submitError: error instanceof Error ? error.message : "Failed to create party",
      }));
    }
  };

  const validatePoliticianForm = (): boolean => {
    const errors: FormState["errors"] = {};

    if (!formState.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formState.firstName.length > 100) {
      errors.firstName = "First name cannot exceed 100 characters";
    }

    if (!formState.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formState.lastName.length > 100) {
      errors.lastName = "Last name cannot exceed 100 characters";
    }

    if (!formState.partyId) {
      errors.partyId = "Please select a party";
    }

    if (formState.biography && formState.biography.length > 5000) {
      errors.biography = "Biography cannot exceed 5000 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePoliticianForm()) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          submitError: "You must be signed in to create a politician",
        }));
        return;
      }

      const command: CreatePoliticianCommand = {
        first_name: formState.firstName.trim(),
        last_name: formState.lastName.trim(),
        party_id: formState.partyId,
        biography: formState.biography.trim() || null,
      };

      const response = await fetch("/api/politicians", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error.message || "Failed to create politician");
      }

      const result: SingleResponse<PoliticianDTO> = await response.json();

      // Redirect to politician detail page
      window.location.href = `/politicians/${result.data.id}`;
    } catch (error) {
      console.error("Error creating politician:", error);
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : "Failed to create politician",
      }));
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Politician</h1>
        <p className="mt-2 text-muted-foreground">Create a new politician profile to track their statements.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {formState.submitError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <strong className="font-medium">Error:</strong> {formState.submitError}
          </div>
        )}

        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="firstName"
            type="text"
            value={formState.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            aria-invalid={!!formState.errors.firstName}
            aria-describedby={formState.errors.firstName ? "firstName-error" : undefined}
            disabled={formState.isSubmitting}
            placeholder="Enter first name"
          />
          {formState.errors.firstName && (
            <p id="firstName-error" className="text-sm text-destructive" role="alert">
              {formState.errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="lastName"
            type="text"
            value={formState.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            aria-invalid={!!formState.errors.lastName}
            aria-describedby={formState.errors.lastName ? "lastName-error" : undefined}
            disabled={formState.isSubmitting}
            placeholder="Enter last name"
          />
          {formState.errors.lastName && (
            <p id="lastName-error" className="text-sm text-destructive" role="alert">
              {formState.errors.lastName}
            </p>
          )}
        </div>

        {/* Party Selection */}
        <div className="space-y-2">
          <label htmlFor="partyId" className="text-sm font-medium">
            Political Party <span className="text-destructive">*</span>
          </label>
          <select
            id="partyId"
            value={formState.partyId}
            onChange={(e) => handleFieldChange("partyId", e.target.value)}
            aria-invalid={!!formState.errors.partyId}
            aria-describedby={formState.errors.partyId ? "partyId-error" : undefined}
            disabled={formState.isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a party</option>
            {formState.availableParties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
                {party.abbreviation ? ` (${party.abbreviation})` : ""}
              </option>
            ))}
          </select>
          {formState.errors.partyId && (
            <p id="partyId-error" className="text-sm text-destructive" role="alert">
              {formState.errors.partyId}
            </p>
          )}

          {/* Add New Party Button */}
          {!formState.showPartyForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormState((prev) => ({ ...prev, showPartyForm: true }))}
              disabled={formState.isSubmitting}
            >
              + Add New Party
            </Button>
          )}
        </div>

        {/* Inline Party Creation Form */}
        {formState.showPartyForm && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Create New Party</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    showPartyForm: false,
                    newPartyName: "",
                    newPartyAbbreviation: "",
                    newPartyDescription: "",
                    newPartyColor: "#0000FF",
                    errors: { ...prev.errors, newPartyName: undefined, newPartyColor: undefined },
                  }))
                }
                disabled={formState.isCreatingParty}
              >
                Cancel
              </Button>
            </div>

            {/* Party Name */}
            <div className="space-y-2">
              <label htmlFor="newPartyName" className="text-sm font-medium">
                Party Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="newPartyName"
                type="text"
                value={formState.newPartyName}
                onChange={(e) => handleFieldChange("newPartyName", e.target.value)}
                aria-invalid={!!formState.errors.newPartyName}
                aria-describedby={formState.errors.newPartyName ? "newPartyName-error" : undefined}
                disabled={formState.isCreatingParty}
                placeholder="e.g., Democratic Party"
              />
              {formState.errors.newPartyName && (
                <p id="newPartyName-error" className="text-sm text-destructive" role="alert">
                  {formState.errors.newPartyName}
                </p>
              )}
            </div>

            {/* Party Abbreviation */}
            <div className="space-y-2">
              <label htmlFor="newPartyAbbreviation" className="text-sm font-medium">
                Abbreviation
              </label>
              <Input
                id="newPartyAbbreviation"
                type="text"
                value={formState.newPartyAbbreviation}
                onChange={(e) => handleFieldChange("newPartyAbbreviation", e.target.value)}
                disabled={formState.isCreatingParty}
                placeholder="e.g., DEM"
                maxLength={20}
              />
            </div>

            {/* Party Color */}
            <div className="space-y-2">
              <label htmlFor="newPartyColor" className="text-sm font-medium">
                Party Color
              </label>
              <div className="flex gap-2">
                <Input
                  id="newPartyColor"
                  type="color"
                  value={formState.newPartyColor}
                  onChange={(e) => handleFieldChange("newPartyColor", e.target.value)}
                  disabled={formState.isCreatingParty}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={formState.newPartyColor}
                  onChange={(e) => handleFieldChange("newPartyColor", e.target.value)}
                  aria-invalid={!!formState.errors.newPartyColor}
                  aria-describedby={formState.errors.newPartyColor ? "newPartyColor-error" : undefined}
                  disabled={formState.isCreatingParty}
                  placeholder="#0000FF"
                  className="flex-1"
                />
              </div>
              {formState.errors.newPartyColor && (
                <p id="newPartyColor-error" className="text-sm text-destructive" role="alert">
                  {formState.errors.newPartyColor}
                </p>
              )}
            </div>

            {/* Party Description */}
            <div className="space-y-2">
              <label htmlFor="newPartyDescription" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="newPartyDescription"
                value={formState.newPartyDescription}
                onChange={(e) => handleFieldChange("newPartyDescription", e.target.value)}
                disabled={formState.isCreatingParty}
                placeholder="Brief description of the party..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button type="button" onClick={handleCreateParty} disabled={formState.isCreatingParty} className="w-full">
              {formState.isCreatingParty ? "Creating Party..." : "Create Party"}
            </Button>
          </div>
        )}

        {/* Biography */}
        <div className="space-y-2">
          <label htmlFor="biography" className="text-sm font-medium">
            Biography
          </label>
          <textarea
            id="biography"
            value={formState.biography}
            onChange={(e) => handleFieldChange("biography", e.target.value)}
            aria-invalid={!!formState.errors.biography}
            aria-describedby={formState.errors.biography ? "biography-error" : undefined}
            disabled={formState.isSubmitting}
            placeholder="Enter a brief biography..."
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">{formState.biography.length}/5000 characters</p>
          {formState.errors.biography && (
            <p id="biography-error" className="text-sm text-destructive" role="alert">
              {formState.errors.biography}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={formState.isSubmitting} className="flex-1">
            {formState.isSubmitting ? "Creating..." : "Create Politician"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = "/politicians")}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
