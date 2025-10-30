/**
 * AuthenticationContainer Component
 * Main container managing authentication state, tab switching, and Supabase auth integration
 * Orchestrates the entire authentication flow for both sign-in and sign-up
 */

import React, { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { mapAuthError } from "@/lib/auth-errors";
import AuthTabs from "./auth/AuthTabs";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";
import AlertMessage from "./auth/AlertMessage";

/**
 * Active tab type - determines which authentication form is displayed
 */
type ActiveTab = "signin" | "signup";

/**
 * Authentication state interface
 */
interface AuthState {
  activeTab: ActiveTab;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

/**
 * Component props interface
 */
interface AuthenticationContainerProps {
  initialTab?: ActiveTab;
  returnUrl?: string | null;
}

/**
 * AuthenticationContainer component
 * Provides unified entry point for user authentication with tabbed sign-in/sign-up interface
 */
export default function AuthenticationContainer({
  initialTab = "signin",
  returnUrl = null,
}: AuthenticationContainerProps) {
  // Initialize state
  const [authState, setAuthState] = useState<AuthState>({
    activeTab: initialTab,
    isLoading: false,
    error: null,
    success: null,
  });

  // Initialize Supabase client
  const supabase = createBrowserSupabaseClient();

  // Parse URL hash on mount to determine initial tab
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash === "signup" || hash === "signin") {
      setAuthState((prev) => ({ ...prev, activeTab: hash as ActiveTab }));
    }
  }, []);

  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = authState.activeTab;
  }, [authState.activeTab]);

  /**
   * Handle tab switching
   * Clears error/success messages when switching tabs
   */
  const handleTabChange = (tab: ActiveTab) => {
    setAuthState((prev) => ({
      ...prev,
      activeTab: tab,
      error: null,
      success: null,
    }));
  };

  /**
   * Handle sign-in form submission
   */
  const handleSignIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: mapAuthError(error.message),
        }));
        return;
      }

      if (data.session) {
        // Store session token in cookie for server-side validation
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      }

      // Success - redirect to return URL or home
      const redirectUrl = returnUrl || "/";
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred. Please try again.",
      }));
    }
  };

  /**
   * Handle sign-up form submission
   */
  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
          },
        },
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: mapAuthError(error.message),
        }));
        return;
      }

      if (data.session) {
        // Store session token in cookie
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;

        // Success - show message and redirect after delay
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          success: "Account created successfully! Redirecting...",
        }));

        setTimeout(() => {
          const redirectUrl = returnUrl || "/";
          window.location.href = redirectUrl;
        }, 2000);
      } else if (data.user && !data.session) {
        // Email confirmation required
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          success: "Account created! Please check your email to verify your account.",
        }));
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred. Please try again.",
      }));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
        {/* Page Header */}
        <header className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            {authState.activeTab === "signin" ? "Sign In to SpeechKarma" : "Sign Up for SpeechKarma"}
          </h1>
        </header>

        {/* Alert Messages */}
        {authState.error && (
          <div className="mb-4">
            <AlertMessage
              type="error"
              message={authState.error}
              onClose={() => setAuthState((prev) => ({ ...prev, error: null }))}
            />
          </div>
        )}

        {authState.success && (
          <div className="mb-4">
            <AlertMessage type="success" message={authState.success} autoDismiss={false} />
          </div>
        )}

        {/* Tabs and Forms */}
        <AuthTabs
          activeTab={authState.activeTab}
          onTabChange={handleTabChange}
          signInContent={<SignInForm onSubmit={handleSignIn} isLoading={authState.isLoading} />}
          signUpContent={<SignUpForm onSubmit={handleSignUp} isLoading={authState.isLoading} />}
        />
      </div>
    </div>
  );
}
