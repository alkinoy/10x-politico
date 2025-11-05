/**
 * API Route: GET /api/parties/:id
 *
 * Retrieves a single party by ID.
 * Public endpoint - no authentication required.
 */

import type { APIRoute } from "astro";
import { PartyService } from "@/lib/services/party-service";
import { isValidUUID } from "@/lib/utils/validation";
import type { ErrorResponse } from "@/types";

/**
 * GET handler for single party endpoint
 *
 * Path Parameters:
 *   - id: party UUID
 *
 * Success Response (200):
 *   - SingleResponse<PartyDTO>
 *
 * Error Responses:
 *   - 400: Invalid party ID format
 *   - 404: Party not found
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const runtime = locals.runtime?.env;
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const partyId = params.id;

    if (!partyId || !isValidUUID(partyId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid party ID format",
          code: "VALIDATION_ERROR",
          details: { field: "id", value: partyId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Fetch Party from Service
    // ========================================================================

    const partyService = new PartyService(runtime);
    const party = await partyService.getPartyById(partyId);

    // ========================================================================
    // 3. Handle Not Found
    // ========================================================================

    if (!party) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Party not found",
          code: "NOT_FOUND",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 4. Return Success Response
    // ========================================================================

    return new Response(
      JSON.stringify({
        data: party,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching party:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve party",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
