/**
 * EditProfileForm Component
 *
 * Inline form to edit user's display name with validation.
 * Shows edit/save buttons and handles form submission.
 */

import { useState, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";

interface EditProfileFormProps {
  currentDisplayName: string;
  onSave: (newDisplayName: string) => Promise<void>;
  onCancel?: () => void;
}

export default function EditProfileForm({ currentDisplayName, onSave, onCancel }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputId = useId();
  const errorId = useId();

  // Validate display name
  const validateDisplayName = useCallback((value: string): string | null => {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return "Display name cannot be empty";
    }

    if (trimmed.length > 100) {
      return "Display name cannot exceed 100 characters";
    }

    return null;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validate
      const validationError = validateDisplayName(displayName);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Don't save if unchanged
      if (displayName.trim() === currentDisplayName.trim()) {
        onCancel?.();
        return;
      }

      setIsLoading(true);

      try {
        await onSave(displayName.trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile");
      } finally {
        setIsLoading(false);
      }
    },
    [displayName, currentDisplayName, validateDisplayName, onSave, onCancel]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayName(e.target.value);
      // Clear error on change
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setDisplayName(currentDisplayName);
    setError(null);
    onCancel?.();
  }, [currentDisplayName, onCancel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Display Name
        </label>
        <input
          id={inputId}
          type="text"
          value={displayName}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
          maxLength={100}
          required
        />
        {error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{displayName.length} / 100 characters</p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isLoading} aria-busy={isLoading} size="sm">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} size="sm">
          Cancel
        </Button>
      </div>
    </form>
  );
}
