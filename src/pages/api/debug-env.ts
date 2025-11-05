/**
 * DEBUG ENDPOINT - Remove after debugging
 *
 * This endpoint helps verify which environment variables are available
 */

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  // Check what's available in different contexts
  const debug = {
    // Cloudflare runtime env
    cloudflare_runtime: locals.runtime?.env
      ? {
          has_SUPABASE_URL: !!locals.runtime.env.SUPABASE_URL,
          has_SUPABASE_ANON_KEY: !!locals.runtime.env.SUPABASE_ANON_KEY,
          has_SUPABASE_SERVICE_ROLE_KEY: !!locals.runtime.env.SUPABASE_SERVICE_ROLE_KEY,
          // Show first 10 chars for verification (safe)
          SUPABASE_URL_preview: locals.runtime.env.SUPABASE_URL?.substring(0, 20) + "...",
          SUPABASE_ANON_KEY_preview: locals.runtime.env.SUPABASE_ANON_KEY?.substring(0, 20) + "...",
        }
      : "runtime.env not available",

    // import.meta.env
    import_meta_env: {
      has_SUPABASE_URL: !!import.meta.env.SUPABASE_URL,
      has_SUPABASE_ANON_KEY: !!import.meta.env.SUPABASE_ANON_KEY,
      has_PUBLIC_SUPABASE_URL: !!import.meta.env.PUBLIC_SUPABASE_URL,
      SUPABASE_URL_preview: import.meta.env.SUPABASE_URL?.substring(0, 20) + "...",
      PUBLIC_SUPABASE_URL_preview: import.meta.env.PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
    },

    // process.env (might not work in Cloudflare)
    process_env:
      typeof process !== "undefined"
        ? {
            has_SUPABASE_URL: !!process.env.SUPABASE_URL,
            has_SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
          }
        : "process.env not available",

    platform: locals.runtime?.env ? "cloudflare" : "node",
  };

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
