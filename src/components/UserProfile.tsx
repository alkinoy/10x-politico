/**
 * UserProfile Component
 *
 * Main container for the user profile page. Manages state for profile data,
 * user's statements, and handles all profile-related interactions.
 */

import { useState, useEffect, useCallback } from "react";
import type { ProfileDTO } from "@/types";
import ProfileHeader from "@/components/ProfileHeader";
import UserStatementsSection from "@/components/UserStatementsSection";
import SignOutButton from "@/components/SignOutButton";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface UserProfileState {
  profile: ProfileDTO | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  authError: boolean;
}

export default function UserProfile() {
  const [state, setState] = useState<UserProfileState>({
    profile: null,
    isLoadingProfile: true,
    profileError: null,
    authError: false,
  });

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingProfile: true, profileError: null }));

    try {
      // Get the current session for authentication
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setState((prev) => ({ ...prev, authError: true, isLoadingProfile: false }));
        return;
      }

      const response = await fetch("/api/profiles/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setState((prev) => ({ ...prev, authError: true, isLoadingProfile: false }));
          return;
        }
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        profile: data.data,
        isLoadingProfile: false,
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState((prev) => ({
        ...prev,
        profileError: "Failed to load profile. Please try again.",
        isLoadingProfile: false,
      }));
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle profile update
  const handleProfileUpdate = useCallback((updatedProfile: ProfileDTO) => {
    setState((prev) => ({ ...prev, profile: updatedProfile }));
  }, []);

  // Show authentication error
  if (state.authError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-destructive">Authentication Required</h2>
        <p className="mb-4 text-muted-foreground">You need to be signed in to view your profile.</p>
        <a
          href="/auth"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header Section */}
      <section>
        {state.isLoadingProfile ? (
          <div className="animate-pulse">
            <div className="h-48 rounded-xl border bg-card shadow-sm" />
          </div>
        ) : state.profileError ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
            <p className="text-sm text-destructive">{state.profileError}</p>
            <button onClick={fetchProfile} className="mt-4 text-sm font-medium text-primary hover:underline">
              Try Again
            </button>
          </div>
        ) : state.profile ? (
          <ProfileHeader profile={state.profile} onUpdate={handleProfileUpdate} />
        ) : null}
      </section>

      {/* User Statements Section */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">My Statements</h2>
        {state.profile ? <UserStatementsSection userId={state.profile.id} /> : null}
      </section>

      {/* Sign Out Section */}
      <section>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Account Actions</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sign out of your account. You can sign back in at any time.</p>
            <SignOutButton variant="destructive" />
          </div>
        </div>
      </section>
    </div>
  );
}
