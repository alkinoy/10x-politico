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
  // Use PUBLIC_ prefixed vars - Astro automatically includes these in client bundle
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Only throw error if we're in browser context and vars are missing
  if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
    console.error("Available env vars:", Object.keys(import.meta.env));
    console.error("Values:", { supabaseUrl, supabaseAnonKey });
    throw new Error(
      "Missing Supabase environment variables. PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set at build time."
    );
  }

  // For SSR, use placeholder values - will be replaced client-side
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
