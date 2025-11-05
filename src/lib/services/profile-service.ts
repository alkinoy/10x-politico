/**
 * Profile Service
 *
 * Handles business logic for user profile operations including:
 * - Fetching authenticated user's profile
 * - Updating user profile
 * - Fetching public profiles
 */

import { getSupabaseClient } from "../../db/client";
import type { ProfileDTO, PublicProfileDTO, UpdateProfileCommand } from "../../types";

/**
 * Get the authenticated user's full profile
 *
 * @param userId - The authenticated user's ID
 * @returns The user's complete profile or null if not found
 */
export async function getAuthenticatedProfile(userId: string): Promise<ProfileDTO | null> {
  const supabase = getSupabaseClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return null;
  }

  // Get email from auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  return {
    id: profile.id,
    display_name: profile.display_name,
    is_admin: profile.is_admin,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    email: authUser?.user?.email || null,
  };
}

/**
 * Update the authenticated user's profile
 *
 * @param userId - The authenticated user's ID
 * @param command - The update command with fields to update
 * @returns The updated profile or null if not found
 * @throws Error if validation fails
 */
export async function updateProfile(userId: string, command: UpdateProfileCommand): Promise<ProfileDTO | null> {
  const supabase = getSupabaseClient();

  // Validate display_name if provided
  if (command.display_name !== undefined) {
    const trimmed = command.display_name.trim();

    if (trimmed.length === 0) {
      throw new Error("Display name cannot be empty");
    }

    if (trimmed.length > 100) {
      throw new Error("Display name cannot exceed 100 characters");
    }
  }

  // Build update object (only include provided fields)
  const updates: { display_name?: string } = {};

  if (command.display_name !== undefined) {
    updates.display_name = command.display_name.trim();
  }

  // If no updates, just return current profile
  if (Object.keys(updates).length === 0) {
    return getAuthenticatedProfile(userId);
  }

  // Update the profile
  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id, display_name, is_admin, created_at, updated_at")
    .single();

  if (error || !updatedProfile) {
    throw new Error("Failed to update profile");
  }

  // Get email from auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  return {
    id: updatedProfile.id,
    display_name: updatedProfile.display_name,
    is_admin: updatedProfile.is_admin,
    created_at: updatedProfile.created_at,
    updated_at: updatedProfile.updated_at,
    email: authUser?.user?.email || null,
  };
}

/**
 * Get a public profile by user ID
 *
 * @param userId - The user ID to fetch
 * @returns The public profile or null if not found
 */
export async function getPublicProfile(userId: string): Promise<PublicProfileDTO | null> {
  const supabase = getSupabaseClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    id: profile.id,
    display_name: profile.display_name,
    created_at: profile.created_at,
  };
}

/**
 * Verify that a profile exists
 *
 * @param userId - The user ID to check
 * @returns true if profile exists, false otherwise
 */
export async function verifyProfileExists(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).single();

  return !error && !!data;
}
