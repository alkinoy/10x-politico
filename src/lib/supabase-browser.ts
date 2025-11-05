/**
 * Browser-side Supabase Client Utility
 * Creates a Supabase client configured for browser-based authentication
 * This client should be used in React components for auth operations
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

/**
 * Creates a browser-compatible Supabase client with anon key
 * Configured for automatic session refresh and persistence
 *
 * @returns Supabase client instance for browser-side auth operations
 */
export function createBrowserSupabaseClient() {
  // Try PUBLIC_ prefix first (standard Astro pattern)
  // Fall back to non-prefixed if PUBLIC_ not available (Cloudflare workaround)
  // On server-side (Cloudflare), these will be undefined but that's ok - they'll be available client-side
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

  // Only throw error if we're actually in a browser context
  if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set (or SUPABASE_URL and SUPABASE_ANON_KEY)."
    );
  }

  // For SSR, use placeholder values - the real values will be used client-side
  const url = supabaseUrl || "https://placeholder.supabase.co";
  const key = supabaseAnonKey || "placeholder-key";

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
}
