/**
 * Authentication utilities for API endpoints
 * Handles JWT token validation and user authentication
 */

import { getSupabaseClientAnon } from "@/db/client";

/**
 * Extracts and validates JWT token from Authorization header
 * Returns the authenticated user ID if valid, null otherwise
 *
 * @param authHeader - Authorization header value (Bearer <token>)
 * @param runtime - Optional runtime environment (for Cloudflare)
 * @returns User ID if authenticated, null otherwise
 */
export async function getAuthenticatedUser(
  authHeader?: string | null,
  runtime?: Record<string, string>
): Promise<string | null> {
  // Check if auth header exists and has Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    // Extract token from "Bearer <token>" format
    const token = authHeader.substring(7);

    if (!token || token.trim().length === 0) {
      return null;
    }

    // Create Supabase client with anon key for token validation
    const supabase = getSupabaseClientAnon(runtime);

    // Validate token and get user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn("Failed to authenticate user:", error?.message);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error validating authentication token:", error);
    return null;
  }
}

/**
 * Validates if a user has permission to modify a resource
 * Based on ownership and grace period rules
 *
 * @param resourceOwnerId - ID of the user who owns the resource
 * @param authenticatedUserId - ID of the currently authenticated user
 * @param resourceCreatedAt - Timestamp when the resource was created
 * @param gracePeriodMinutes - Grace period in minutes (default: 15)
 * @returns true if user can modify, false otherwise
 */
export function canUserModifyResource(
  resourceOwnerId: string,
  authenticatedUserId: string | null,
  resourceCreatedAt: string,
  gracePeriodMinutes = 15
): boolean {
  // User must be authenticated
  if (!authenticatedUserId) {
    return false;
  }

  // User must be the owner
  if (resourceOwnerId !== authenticatedUserId) {
    return false;
  }

  // Check if within grace period
  const gracePeriodMs = gracePeriodMinutes * 60 * 1000;
  const timeSinceCreation = Date.now() - new Date(resourceCreatedAt).getTime();

  return timeSinceCreation <= gracePeriodMs;
}

/**
 * Extracts user ID from Astro context (middleware)
 * This is a helper for endpoints that use Astro middleware for auth
 *
 * @param locals - Astro locals object
 * @returns User ID if authenticated, null otherwise
 */
export function getUserFromLocals(locals: Record<string, unknown>): string | null {
  if (locals.user && typeof locals.user === "object" && "id" in locals.user) {
    return locals.user.id as string;
  }
  return null;
}
