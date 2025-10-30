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
  // Use PUBLIC_ prefix for variables available in the browser
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set."
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
