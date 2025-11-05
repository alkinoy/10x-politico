/**
 * API Route: GET /api/politicians, POST /api/politicians
 *
 * GET: Retrieves a list of politicians with optional search and filtering (public endpoint)
 * POST: Creates a new politician (requires authentication)
 */

import type { APIRoute } from "astro";
import { PoliticianService } from "@/lib/services/politician-service";
import { PartyService } from "@/lib/services/party-service";
import { getAuthenticatedUser } from "@/lib/utils/auth";
import { isValidUUID } from "@/lib/utils/validation";
import type { PoliticiansQueryParams, CreatePoliticianCommand, ErrorResponse } from "@/types";

/**
 * GET handler for politicians list endpoint
 *
 * Query Parameters:
 *   - page: page number (default: 1, min: 1)
 *   - limit: results per page (default: 50, min: 1, max: 100)
 *   - search: full-text search by politician name
 *   - party_id: filter by party UUID
 *   - sort: 'last_name' | 'created_at' (default: 'last_name')
 *   - order: 'asc' | 'desc' (default: 'asc')
 *
 * Success Response (200):
 *   - PaginatedResponse<PoliticianDTO>
 *
 * Error Responses:
 *   - 400: Invalid query parameters
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const runtime = locals.runtime?.env;
    // ========================================================================
    // 1. Extract Query Parameters
    // ========================================================================

    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");
    const searchParam = url.searchParams.get("search");
    const partyIdParam = url.searchParams.get("party_id");
    const sortParam = url.searchParams.get("sort");
    const orderParam = url.searchParams.get("order");

    // Parse numeric parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const search = searchParam || undefined;
    const party_id = partyIdParam || undefined;
    const sort = sortParam || "last_name";
    const order = orderParam || "asc";

    // ========================================================================
    // 2. Validate Query Parameters
    // ========================================================================

    // Validate page
    if (isNaN(page) || page < 1) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid page number. Must be >= 1",
          code: "VALIDATION_ERROR",
          details: { field: "page", value: pageParam },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid limit. Must be >= 1",
          code: "VALIDATION_ERROR",
          details: { field: "limit", value: limitParam },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (limit > 100) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Limit exceeds maximum (100)",
          code: "VALIDATION_ERROR",
          details: { field: "limit", value: limit },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate party_id if provided
    if (party_id && !isValidUUID(party_id)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid party_id format",
          code: "VALIDATION_ERROR",
          details: { field: "party_id", value: party_id },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate sort field
    if (!["last_name", "created_at"].includes(sort)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid sort field. Must be one of: last_name, created_at",
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

    const queryParams: PoliticiansQueryParams = {
      page,
      limit,
      search,
      party_id,
      sort: sort as "last_name" | "created_at",
      order: order as "asc" | "desc",
    };

    // ========================================================================
    // 4. Fetch Politicians from Service
    // ========================================================================

    const politicianService = new PoliticianService(runtime);
    const result = await politicianService.getAllPoliticians(queryParams);

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching politicians:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve politicians",
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
 * POST handler for creating a new politician
 *
 * Request Headers:
 *   - Authorization: Bearer <jwt_token> (required)
 *
 * Request Body:
 *   - first_name: string (required)
 *   - last_name: string (required)
 *   - party_id: uuid (required)
 *   - biography: string (optional)
 *
 * Success Response (201):
 *   - SingleResponse<PoliticianDTO>
 *
 * Error Responses:
 *   - 400: Invalid request data
 *   - 401: Authentication required
 *   - 404: Party not found
 *   - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
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

    let body: CreatePoliticianCommand;
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

    // Validate first_name (required)
    if (!body.first_name || typeof body.first_name !== "string" || body.first_name.trim().length === 0) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "First name is required",
          code: "VALIDATION_ERROR",
          details: { field: "first_name" },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate first_name length
    if (body.first_name.length > 100) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "First name cannot exceed 100 characters",
          code: "VALIDATION_ERROR",
          details: { field: "first_name", maxLength: 100 },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate last_name (required)
    if (!body.last_name || typeof body.last_name !== "string" || body.last_name.trim().length === 0) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Last name is required",
          code: "VALIDATION_ERROR",
          details: { field: "last_name" },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate last_name length
    if (body.last_name.length > 100) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Last name cannot exceed 100 characters",
          code: "VALIDATION_ERROR",
          details: { field: "last_name", maxLength: 100 },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate party_id (required)
    if (!body.party_id || !isValidUUID(body.party_id)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Valid party ID is required",
          code: "VALIDATION_ERROR",
          details: { field: "party_id", value: body.party_id },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate biography length (if provided)
    if (body.biography && body.biography.length > 5000) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Biography cannot exceed 5000 characters",
          code: "VALIDATION_ERROR",
          details: { field: "biography", maxLength: 5000 },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify party exists
    const partyService = new PartyService(runtime);
    const partyExists = await partyService.verifyPartyExists(body.party_id);

    if (!partyExists) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Party not found",
          code: "NOT_FOUND",
          details: { field: "party_id", value: body.party_id },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 4. Create Politician
    // ========================================================================

    const politicianService = new PoliticianService(runtime);
    const politician = await politicianService.createPolitician(body);

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================

    return new Response(
      JSON.stringify({
        data: politician,
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

    console.error("Error creating politician:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to create politician",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
