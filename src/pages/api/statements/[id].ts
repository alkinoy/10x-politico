/**
 * API Route: GET/PATCH/DELETE /api/statements/:id
 *
 * GET: Retrieves a single statement by ID with full details and permission flags
 * PATCH: Updates a statement within grace period (requires authentication and ownership)
 * DELETE: Soft-deletes a statement within grace period (requires authentication and ownership)
 */

import type { APIRoute } from "astro";
import { StatementService } from "@/lib/services/statement-service";
import { getAuthenticatedUser } from "@/lib/utils/auth";
import { isValidUUID } from "@/lib/utils/validation";
import type { ErrorResponse, UpdateStatementCommand } from "@/types";

/**
 * GET handler for single statement endpoint
 *
 * Path Parameters:
 *   - id: statement UUID
 *
 * Headers:
 *   - Authorization: Bearer <jwt_token> (optional)
 *
 * Success Response (200):
 *   - SingleResponse<StatementDetailDTO>
 *
 * Error Responses:
 *   - 400: Invalid statement ID format
 *   - 404: Statement not found
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ params, request }) => {
  try {
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const statementId = params.id;

    if (!statementId || !isValidUUID(statementId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid statement ID format",
          code: "VALIDATION_ERROR",
          details: { field: "id", value: statementId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Extract Authenticated User (Optional)
    // ========================================================================

    const authHeader = request.headers.get("Authorization");
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

    // ========================================================================
    // 3. Fetch Statement from Service
    // ========================================================================

    const statementService = new StatementService();
    const statement = await statementService.getStatementById(statementId, authenticatedUserId);

    // ========================================================================
    // 4. Handle Not Found
    // ========================================================================

    if (!statement) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Statement not found",
          code: "NOT_FOUND",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================

    return new Response(
      JSON.stringify({
        data: statement,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error fetching statement:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to retrieve statement",
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
 * PATCH handler for updating a statement
 *
 * Path Parameters:
 *   - id: statement UUID
 *
 * Headers:
 *   - Authorization: Bearer <jwt_token> (required)
 *
 * Request Body:
 *   - statement_text: string (optional, min: 10 chars, max: 5000 chars)
 *   - statement_timestamp: timestamp (optional, cannot be in future)
 *
 * Success Response (200):
 *   - SingleResponse<StatementDetailDTO>
 *
 * Error Responses:
 *   - 400: Invalid request data
 *   - 401: Authentication required
 *   - 403: Permission denied (ownership, grace period, or deleted)
 *   - 404: Statement not found
 *   - 500: Internal server error
 */
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const statementId = params.id;

    if (!statementId || !isValidUUID(statementId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid statement ID format",
          code: "VALIDATION_ERROR",
          details: { field: "id", value: statementId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Authenticate User (Required)
    // ========================================================================

    const authHeader = request.headers.get("Authorization");
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

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
    // 3. Parse Request Body
    // ========================================================================

    let body: UpdateStatementCommand;
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
    // 4. Validate Request Data
    // ========================================================================

    // Validate statement_text if provided
    if (body.statement_text !== undefined) {
      if (typeof body.statement_text !== "string") {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Statement text must be a string",
            code: "VALIDATION_ERROR",
            details: { field: "statement_text" },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const trimmedText = body.statement_text.trim();

      if (trimmedText.length < 10) {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Statement text must be at least 10 characters",
            code: "VALIDATION_ERROR",
            details: { field: "statement_text", length: trimmedText.length },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (body.statement_text.length > 5000) {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Statement text cannot exceed 5000 characters",
            code: "VALIDATION_ERROR",
            details: { field: "statement_text", length: body.statement_text.length },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Validate statement_timestamp if provided
    if (body.statement_timestamp !== undefined) {
      if (typeof body.statement_timestamp !== "string") {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Statement timestamp must be a string",
            code: "VALIDATION_ERROR",
            details: { field: "statement_timestamp" },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const timestamp = new Date(body.statement_timestamp);
      if (isNaN(timestamp.getTime())) {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Invalid statement timestamp format",
            code: "VALIDATION_ERROR",
            details: { field: "statement_timestamp" },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (timestamp.getTime() > Date.now()) {
        const errorResponse: ErrorResponse = {
          error: {
            message: "Statement timestamp cannot be in the future",
            code: "VALIDATION_ERROR",
            details: { field: "statement_timestamp" },
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // ========================================================================
    // 5. Update Statement
    // ========================================================================

    const statementService = new StatementService();

    try {
      const updatedStatement = await statementService.updateStatement(statementId, body, authenticatedUserId);

      // ========================================================================
      // 6. Return Success Response
      // ========================================================================

      return new Response(
        JSON.stringify({
          data: updatedStatement,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (serviceError) {
      // Handle specific service errors
      if (serviceError instanceof Error) {
        const message = serviceError.message;

        // Statement not found
        if (message === "Statement not found") {
          const errorResponse: ErrorResponse = {
            error: {
              message: "Statement not found",
              code: "NOT_FOUND",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Permission errors (ownership, grace period, deleted)
        if (
          message === "You do not own this statement" ||
          message === "Grace period (15 minutes) has expired" ||
          message === "Statement has been deleted"
        ) {
          const errorResponse: ErrorResponse = {
            error: {
              message,
              code: "PERMISSION_DENIED",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Re-throw for general error handler
      throw serviceError;
    }
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error updating statement:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to update statement",
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
 * DELETE handler for soft-deleting a statement
 *
 * Path Parameters:
 *   - id: statement UUID
 *
 * Headers:
 *   - Authorization: Bearer <jwt_token> (required)
 *
 * Success Response (200):
 *   - SingleResponse<DeletedStatementDTO>
 *
 * Error Responses:
 *   - 400: Invalid statement ID format
 *   - 401: Authentication required
 *   - 403: Permission denied (ownership, grace period, or already deleted)
 *   - 404: Statement not found
 *   - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    // ========================================================================
    // 1. Extract and Validate Path Parameters
    // ========================================================================

    const statementId = params.id;

    if (!statementId || !isValidUUID(statementId)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: "Invalid statement ID format",
          code: "VALIDATION_ERROR",
          details: { field: "id", value: statementId },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ========================================================================
    // 2. Authenticate User (Required)
    // ========================================================================

    const authHeader = request.headers.get("Authorization");
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

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
    // 3. Delete Statement
    // ========================================================================

    const statementService = new StatementService();

    try {
      const deletedStatement = await statementService.deleteStatement(statementId, authenticatedUserId);

      // ========================================================================
      // 4. Return Success Response
      // ========================================================================

      return new Response(
        JSON.stringify({
          data: deletedStatement,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (serviceError) {
      // Handle specific service errors
      if (serviceError instanceof Error) {
        const message = serviceError.message;

        // Statement not found
        if (message === "Statement not found") {
          const errorResponse: ErrorResponse = {
            error: {
              message: "Statement not found",
              code: "NOT_FOUND",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Permission errors (ownership, grace period, already deleted)
        if (
          message === "You do not own this statement" ||
          message === "Grace period (15 minutes) has expired" ||
          message === "Statement has already been deleted"
        ) {
          const errorResponse: ErrorResponse = {
            error: {
              message,
              code: "PERMISSION_DENIED",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Re-throw for general error handler
      throw serviceError;
    }
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    console.error("Error deleting statement:", error);

    const errorResponse: ErrorResponse = {
      error: {
        message: "Failed to delete statement",
        code: "INTERNAL_ERROR",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
