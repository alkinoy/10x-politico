/**
 * DEBUG ENDPOINT - Test Supabase connection
 * Remove after debugging
 */

import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Try to get credentials from runtime (Cloudflare way)
    const runtime = locals.runtime?.env;

    let supabaseUrl: string | undefined;
    let anonKey: string | undefined;

    if (runtime) {
      // Cloudflare
      supabaseUrl = runtime.SUPABASE_URL;
      anonKey = runtime.SUPABASE_ANON_KEY;
    } else {
      // Node.js
      supabaseUrl = import.meta.env.SUPABASE_URL;
      anonKey = import.meta.env.SUPABASE_ANON_KEY;
    }

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify(
          {
            error: "Missing credentials",
            has_runtime: !!runtime,
            has_supabaseUrl: !!supabaseUrl,
            has_anonKey: !!anonKey,
            supabaseUrl_preview: supabaseUrl?.substring(0, 30),
          },
          null,
          2
        ),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Try to create a client and test it
    const supabase = createClient(supabaseUrl, anonKey);

    // Simple test query
    const { data, error } = await supabase.from("parties").select("count").limit(1);

    return new Response(
      JSON.stringify(
        {
          success: !error,
          connection: "works",
          platform: runtime ? "cloudflare" : "node",
          error: error?.message,
          data_received: !!data,
        },
        null,
        2
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify(
        {
          error: err instanceof Error ? err.message : "Unknown error",
        },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
