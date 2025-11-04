/**
 * API Route: GET /api/parties, POST /api/parties
 *
 * GET: Retrieves a list of all political parties with optional sorting (public endpoint)
 * POST: Creates a new party (requires authentication)
 */

import type { APIRoute } from "astro";
import { PartyService } from "@/lib/services/party-service";
import { getAuthenticatedUser } from "@/lib/utils/auth";
import type { PartiesQueryParams, CreatePartyCommand, ErrorResponse } from "@/types";

/**
 * GET handler for parties list endpoint
 *
 * Query Parameters:
 *   - sort: 'name' | 'created_at' (default: 'name')
 *   - order: 'asc' | 'desc' (default: 'asc')
 *
 * Success Response (200):
 *   - ListResponse<PartyDTO>
 *
 * Error Responses:
 *   - 400: Invalid query parameters
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Get runtime environment (for Cloudflare) or undefined (for Node)
    const runtime = locals.runtime?.env;

    // ========================================================================
    // 1. Extract Query Parameters
    // ========================================================================

    const sortParam = url.searchParams.get("sort");
    const orderParam = url.searchParams.get("order");

    // ========================================================================
    // 2. Validate Query Parameters
    // ========================================================================

    const sort = sortParam || "name";
    const order = orderParam || "asc";

    // Validate sort field
    if (!["name", "created_at"].includes(sort)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid sort field. Must be one of: name, created_at",
          code: "VALIDATION_ERROR",
          details: { field: "sort", value: sort },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate order
    if (!["asc", "desc"].includes(order)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid order value. Must be one of: asc, desc",
          code: "VALIDATION_ERROR",
          details: { field: "order", value: order },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 3. Build Query Parameters Object
    // ========================================================================

    const queryParams: PartiesQueryParams = {
      sort: sort as "name" | "created_at",
      order: order as "asc" | "desc",
    };

    // ========================================================================
    // 4. Fetch Parties from Service
    // ========================================================================

    const partyService = new PartyService(runtime);
    const result = await partyService.getAllParties(queryParams);

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes (parties don't change often)
      },
    });
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching parties:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve parties",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST handler for creating a new party
 *
 * Request Headers:
 *   - Authorization: Bearer <jwt_token> (required)
 *
 * Request Body:
 *   - name: string (required)
 *   - abbreviation: string (optional)
 *   - description: string (optional)
 *   - color_hex: string (optional, format: #RRGGBB)
 *
 * Success Response (201):
 *   - SingleResponse<PartyDTO>
 *
 * Error Responses:
 *   - 400: Invalid request data
 *   - 401: Authentication required
 *   - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get runtime environment (for Cloudflare) or undefined (for Node)
    const runtime = locals.runtime?.env;

    // ========================================================================
    // 1. Authenticate User
    // ========================================================================

    const authHeader = request.headers.get("Authorization");
    const authenticatedUserId = await getAuthenticatedUser(authHeader, runtime);

    if (!authenticatedUserId) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Authentication required",
          code: "AUTHENTICATION_REQUIRED",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Parse Request Body
    // ========================================================================

    let body: CreatePartyCommand;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid JSON in request body",
          code: "VALIDATION_ERROR",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 3. Validate Request Body
    // ========================================================================

    // Validate name (required)
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Party name is required",
          code: "VALIDATION_ERROR",
          details: { field: "name" },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate name length
    if (body.name.length > 100) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Party name cannot exceed 100 characters",
          code: "VALIDATION_ERROR",
          details: { field: "name", maxLength: 100 },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate abbreviation length (if provided)
    if (body.abbreviation && body.abbreviation.length > 20) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Party abbreviation cannot exceed 20 characters",
          code: "VALIDATION_ERROR",
          details: { field: "abbreviation", maxLength: 20 },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate color_hex format (if provided)
    if (body.color_hex && !/^#[0-9A-Fa-f]{6}$/.test(body.color_hex)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid color format. Must be in #RRGGBB format (e.g., #0000FF)",
          code: "VALIDATION_ERROR",
          details: { field: "color_hex" },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 4. Create Party
    // ========================================================================

    const partyService = new PartyService(runtime);
    const party = await partyService.createParty(body);

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================

    return new Response(
      JSON.stringify({
        data: party,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error creating party:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to create party",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
