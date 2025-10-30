/**
 * API Route: GET /api/politicians/:id
 *
 * Retrieves a single politician by ID with full party details and statement count.
 * Public endpoint - no authentication required.
 */

import type { APIRoute } from "astro";
import { PoliticianService } from "@/lib/services/politician-service";
import { isValidUUID } from "@/lib/utils/validation";
import type { ErrorResponse } from "@/types";

/**
 * GET handler for single politician endpoint
 *
 * Path Parameters:
 *   - id: politician UUID
 *
 * Success Response (200):
 *   - SingleResponse<PoliticianDetailDTO>
 *
 * Error Responses:
 *   - 400: Invalid politician ID format
 *   - 404: Politician not found
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const politicianId = params.id;

    if (!politicianId || !isValidUUID(politicianId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid politician ID format",
          code: "VALIDATION_ERROR",
          details: { field: "id", value: politicianId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Fetch Politician from Service
    // ========================================================================

    const politicianService = new PoliticianService();
    const politician = await politicianService.getPoliticianById(politicianId);

    // ========================================================================
    // 3. Handle Not Found
    // ========================================================================

    if (!politician) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Politician not found",
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
        data: politician,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching politician:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve politician",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
