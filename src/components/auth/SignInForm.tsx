/**
 * SignInForm Component
 * Form for existing users to sign in with email and password
 * Includes validation and submission logic
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import { Loader2 } from "lucide-react";

interface SignInFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
  };
}

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
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
 * Validates password for sign-in (just required check)
 */
function validatePassword(password: string): string | null {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  return null;
}

export default function SignInForm({ onSubmit, isLoading }: SignInFormProps) {
  const [formState, setFormState] = useState<SignInFormState>({
    email: "",
    password: "",
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
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);

    if (emailError || passwordError) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          email: emailError || undefined,
          password: passwordError || undefined,
        },
      }));
      return;
    }

    // Submit form
    await onSubmit(formState.email, formState.password);
  };

  const hasErrors = Object.values(formState.errors).some((error) => error);
  const isFormValid = formState.email && formState.password && !hasErrors;

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4">
      <EmailInput
        id="signin-email"
        value={formState.email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        error={formState.errors.email}
        disabled={isLoading}
      />

      <PasswordInput
        id="signin-password"
        value={formState.password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        error={formState.errors.password}
        disabled={isLoading}
      />

      <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
