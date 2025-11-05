/**
 * API Endpoint: /api/profiles/:id
 *
 * GET - Retrieve a public profile by user ID
 */

import type { APIRoute } from "astro";
import { isValidUUID } from "../../../lib/utils/validation";
import { getPublicProfile } from "../../../lib/services/profile-service";

/**
 * GET /api/profiles/:id
 * Retrieve a public profile by user ID
 *
 * Public endpoint - no authentication required
 * Returns minimal profile information (id, display_name, created_at)
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const runtime = locals.runtime?.env;
    const { id } = params;

    // Validate profile ID
    if (!id || !isValidUUID(id)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid profile ID format",
            code: "VALIDATION_ERROR",
            details: {
              field: "id",
              value: id,
            },
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch public profile
    const profile = await getPublicProfile(id, runtime);

    if (!profile) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Profile not found",
            code: "NOT_FOUND",
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ data: profile }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache public profiles for 5 minutes
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to retrieve profile",
          code: "INTERNAL_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
