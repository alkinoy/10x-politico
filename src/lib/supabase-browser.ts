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
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set (or SUPABASE_URL and SUPABASE_ANON_KEY)."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
}
