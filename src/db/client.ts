/**
 * Supabase Client Utilities
 * Provides centralized Supabase client creation with proper typing
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Type alias for Supabase client with Database types
 */
export type SupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Creates a Supabase client with service role key
 * Used for server-side operations that bypass RLS policies
 *
 * @param runtime - Optional runtime environment (for Cloudflare)
 * @returns Supabase client with service role privileges
 */
export function getSupabaseClient(runtime?: Record<string, string>): SupabaseClient {
  // Try runtime env (Cloudflare), then import.meta.env (Node), then process.env
  const supabaseUrl =
    runtime?.SUPABASE_URL ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_URL);

  const serviceRoleKey =
    runtime?.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_SERVICE_ROLE_KEY) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client with anon key
 * Used for client-side operations and authentication
 *
 * @param runtime - Optional runtime environment (for Cloudflare)
 * @returns Supabase client with anon key
 */
export function getSupabaseClientAnon(runtime?: Record<string, string>): SupabaseClient {
  // Try runtime env (Cloudflare), then import.meta.env (Node), then process.env
  const supabaseUrl =
    runtime?.SUPABASE_URL ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_URL);

  const anonKey =
    runtime?.SUPABASE_ANON_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY);

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set."
    );
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

/**
 * Creates a Supabase client for a specific user using their access token
 * Used for operations that need to respect RLS policies for a specific user
 *
 * @param accessToken - User's JWT access token
 * @param runtime - Optional runtime environment (for Cloudflare)
 * @returns Supabase client authenticated with user's token
 */
export function getSupabaseClientForUser(accessToken: string, runtime?: Record<string, string>): SupabaseClient {
  // Try runtime env (Cloudflare), then import.meta.env (Node), then process.env
  const supabaseUrl =
    runtime?.SUPABASE_URL ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_URL);

  const anonKey =
    runtime?.SUPABASE_ANON_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY);

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set."
    );
  }

  const client = createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return client;
}
