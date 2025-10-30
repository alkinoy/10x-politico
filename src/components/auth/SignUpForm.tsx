/**
 * SignUpForm Component
 * Form for new users to create an account
 * Includes email, password, and optional display name fields
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import DisplayNameInput from "./DisplayNameInput";
import { Loader2 } from "lucide-react";

interface SignUpFormState {
  email: string;
  password: string;
  displayName: string;
  errors: {
    email?: string;
    password?: string;
    displayName?: string;
  };
}

interface SignUpFormProps {
  onSubmit: (email: string, password: string, displayName?: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Validates email format
 */
function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
}

/**
 * Validates password for sign-up (minimum length check)
 */
function validatePassword(password: string): string | null {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

/**
 * Validates display name (optional, but max length if provided)
 */
function validateDisplayName(displayName: string): string | null {
  // Optional field - empty is ok
  if (!displayName || displayName.trim() === "") {
    return null;
  }

  if (displayName.length > 100) {
    return "Display name cannot exceed 100 characters";
  }

  return null;
}

export default function SignUpForm({ onSubmit, isLoading }: SignUpFormProps) {
  const [formState, setFormState] = useState<SignUpFormState>({
    email: "",
    password: "",
    displayName: "",
    errors: {},
  });

  /**
   * Handle email field change
   */
  const handleEmailChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      email: value,
      errors: { ...prev.errors, email: undefined },
    }));
  };

  /**
   * Handle password field change
   */
  const handlePasswordChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      password: value,
      errors: { ...prev.errors, password: undefined },
    }));
  };

  /**
   * Handle display name field change
   */
  const handleDisplayNameChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      displayName: value,
      errors: { ...prev.errors, displayName: undefined },
    }));
  };

  /**
   * Handle email blur event - validate on blur
   */
  const handleEmailBlur = () => {
    const error = validateEmail(formState.email);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, email: error },
      }));
    }
  };

  /**
   * Handle password blur event - validate on blur
   */
  const handlePasswordBlur = () => {
    const error = validatePassword(formState.password);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, password: error },
      }));
    }
  };

  /**
   * Handle display name blur event - validate on blur
   */
  const handleDisplayNameBlur = () => {
    const error = validateDisplayName(formState.displayName);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, displayName: error },
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const displayNameError = validateDisplayName(formState.displayName);

    if (emailError || passwordError || displayNameError) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          email: emailError || undefined,
          password: passwordError || undefined,
          displayName: displayNameError || undefined,
        },
      }));
      return;
    }

    // Submit form
    await onSubmit(formState.email, formState.password, formState.displayName || undefined);
  };

  const hasErrors = Object.values(formState.errors).some((error) => error);
  const isFormValid = formState.email && formState.password && !hasErrors;

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4">
      <EmailInput
        id="signup-email"
        value={formState.email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        error={formState.errors.email}
        disabled={isLoading}
      />

      <PasswordInput
        id="signup-password"
        value={formState.password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        error={formState.errors.password}
        disabled={isLoading}
        showHint={true}
        minLength={6}
      />

      <DisplayNameInput
        id="signup-displayname"
        value={formState.displayName}
        onChange={handleDisplayNameChange}
        onBlur={handleDisplayNameBlur}
        error={formState.errors.displayName}
        disabled={isLoading}
      />

      <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
