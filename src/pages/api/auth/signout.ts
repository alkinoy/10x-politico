/**
 * API Route: POST /api/auth/signout
 *
 * Handles user sign-out by clearing the session and redirecting to home page.
 */

import type { APIRoute } from "astro";
import { getSupabaseClientAnon } from "@/db/client";

export const prerender = false;

/**
 * POST handler for user sign-out
 *
 * Clears the user's session and redirects to the home page.
 *
 * Success Response:
 *   - 303: Redirect to home page after successful sign-out
 *
 * Error Response:
 *   - 500: Internal server error (still redirects to home page)
 */
export const POST: APIRoute = async ({ cookies, redirect, locals }) => {
  try {
    // Get runtime environment for Cloudflare
    const runtime = locals.runtime?.env;

    // Create Supabase client
    const supabase = getSupabaseClientAnon(runtime);

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }

    // Clear all auth-related cookies
    // Supabase uses these cookie names by default
    const cookieNames = ["sb-access-token", "sb-refresh-token", "supabase-auth-token"];

    cookieNames.forEach((name) => {
      cookies.delete(name, { path: "/" });
    });

    // Redirect to home page after sign-out
    return redirect("/", 303);
  } catch (error) {
    console.error("Unexpected error during sign-out:", error);

    // Even if there's an error, redirect to home page
    // This ensures the user isn't stuck on an error page
    return redirect("/", 303);
  }
};
