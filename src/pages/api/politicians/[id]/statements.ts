/**
 * API Route: GET /api/politicians/:politician_id/statements
 *
 * Retrieves paginated statements for a specific politician with optional
 * time-based filtering and sorting. Supports optional authentication for
 * permission flag calculation.
 */

import type { APIRoute } from "astro";
import { StatementService } from "@/lib/services/statement-service";
import { getAuthenticatedUser } from "@/lib/utils/auth";
import { isValidUUID } from "@/lib/utils/validation";
import type { PoliticianTimelineQueryParams, ErrorResponse } from "@/types";

/**
 * GET handler for politician statements endpoint
 *
 * Path Parameters:
 *   - id: politician UUID
 *
 * Query Parameters:
 *   - page: page number (default: 1, min: 1)
 *   - limit: results per page (default: 50, min: 1, max: 100)
 *   - time_range: '7d' | '30d' | '365d' | 'all' (default: 'all')
 *   - sort_by: 'created_at' | 'statement_timestamp' (default: 'created_at')
 *   - order: 'asc' | 'desc' (default: 'desc')
 *
 * Headers:
 *   - Authorization: Bearer <jwt_token> (optional)
 *
 * Success Response (200):
 *   - PaginatedResponse<StatementDetailDTO>
 *
 * Error Responses:
 *   - 400: Invalid parameters
 *   - 404: Politician not found
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ params, request, url }) => {
  try {
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const politicianId = params.id;

    if (!politicianId || !isValidUUID(politicianId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid politician_id format",
          code: "VALIDATION_ERROR",
          details: { field: "politician_id", value: politicianId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Extract Query Parameters
    // ========================================================================

    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");
    const timeRangeParam = url.searchParams.get("time_range");
    const sortByParam = url.searchParams.get("sort_by");
    const orderParam = url.searchParams.get("order");

    // Parse numeric parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const timeRange = timeRangeParam || "all";
    const sortBy = sortByParam || "created_at";
    const order = orderParam || "desc";

    // ========================================================================
    // 3. Validate Query Parameters
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

    // Validate time_range
    if (!["7d", "30d", "365d", "all"].includes(timeRange)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid time range value. Must be one of: 7d, 30d, 365d, all",
          code: "VALIDATION_ERROR",
          details: { field: "time_range", value: timeRange },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate sort_by
    if (!["created_at", "statement_timestamp"].includes(sortBy)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid sort_by field. Must be one of: created_at, statement_timestamp",
          code: "VALIDATION_ERROR",
          details: { field: "sort_by", value: sortBy },
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
    // 4. Extract Authenticated User (Optional)
    // ========================================================================

    const authHeader = request.headers.get("Authorization");
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

    // ========================================================================
    // 5. Verify Politician Exists
    // ========================================================================

    const statementService = new StatementService();
    const politicianExists = await statementService.verifyPoliticianExists(politicianId);

    if (!politicianExists) {
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
    // 6. Build Query Parameters Object
    // ========================================================================

    const queryParams: PoliticianTimelineQueryParams = {
      page,
      limit,
      time_range: timeRange as "7d" | "30d" | "365d" | "all",
      sort_by: sortBy as "created_at" | "statement_timestamp",
      order: order as "asc" | "desc",
    };

    // ========================================================================
    // 7. Fetch Statements from Service
    // ========================================================================

    const result = await statementService.getStatementsForPolitician(politicianId, queryParams, authenticatedUserId);

    // ========================================================================
    // 8. Return Success Response
    // ========================================================================

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching politician statements:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve statements",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
