/**
 * API Route: GET /api/statements, POST /api/statements
 * 
 * GET: Retrieves recent statements feed with optional filtering and pagination
 * POST: Creates a new statement (requires authentication)
 */

import type { APIRoute } from 'astro';
import { StatementService } from '@/lib/services/statement-service';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { isValidUUID } from '@/lib/utils/validation';
import type { StatementsQueryParams, CreateStatementCommand, ErrorResponse } from '@/types';

/**
 * GET handler for statements list endpoint (Recent Statements Feed)
 * 
 * Query Parameters:
 *   - page: page number (default: 1, min: 1)
 *   - limit: results per page (default: 50, min: 1, max: 100)
 *   - politician_id: filter by politician UUID (optional)
 *   - sort_by: 'created_at' | 'statement_timestamp' (default: 'created_at')
 *   - order: 'asc' | 'desc' (default: 'desc')
 * 
 * Success Response (200):
 *   - PaginatedResponse<StatementDTO>
 * 
 * Error Responses:
 *   - 400: Invalid query parameters
 *   - 500: Internal server error
 */
export const GET: APIRoute = async ({ url, request }) => {
  try {
    // ========================================================================
    // 1. Extract Query Parameters
    // ========================================================================
    
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const politicianIdParam = url.searchParams.get('politician_id');
    const sortByParam = url.searchParams.get('sort_by');
    const orderParam = url.searchParams.get('order');

    // Parse numeric parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const politician_id = politicianIdParam || undefined;
    const sortBy = sortByParam || 'created_at';
    const order = orderParam || 'desc';

    // ========================================================================
    // 2. Validate Query Parameters
    // ========================================================================
    
    // Validate page
    if (isNaN(page) || page < 1) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid page number. Must be >= 1',
          code: 'VALIDATION_ERROR',
          details: { field: 'page', value: pageParam },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid limit. Must be >= 1',
          code: 'VALIDATION_ERROR',
          details: { field: 'limit', value: limitParam },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (limit > 100) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Limit exceeds maximum (100)',
          code: 'VALIDATION_ERROR',
          details: { field: 'limit', value: limit },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate politician_id if provided
    if (politician_id && !isValidUUID(politician_id)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid politician_id format',
          code: 'VALIDATION_ERROR',
          details: { field: 'politician_id', value: politician_id },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate sort_by
    if (!['created_at', 'statement_timestamp'].includes(sortBy)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid sort_by field. Must be one of: created_at, statement_timestamp',
          code: 'VALIDATION_ERROR',
          details: { field: 'sort_by', value: sortBy },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate order
    if (!['asc', 'desc'].includes(order)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid order value. Must be one of: asc, desc',
          code: 'VALIDATION_ERROR',
          details: { field: 'order', value: order },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // 3. Extract Authenticated User (Optional)
    // ========================================================================
    
    const authHeader = request.headers.get('Authorization');
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

    // ========================================================================
    // 4. Build Query Parameters Object
    // ========================================================================
    
    const queryParams: StatementsQueryParams = {
      page,
      limit,
      politician_id,
      sort_by: sortBy as 'created_at' | 'statement_timestamp',
      order: order as 'asc' | 'desc',
    };

    // ========================================================================
    // 5. Fetch Statements from Service
    // ========================================================================
    
    const statementService = new StatementService();
    const result = await statementService.getAllStatements(queryParams, authenticatedUserId);

    // ========================================================================
    // 6. Return Success Response
    // ========================================================================
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================
    
    console.error('Error fetching statements:', error);

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Failed to retrieve statements',
        code: 'INTERNAL_ERROR',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST handler for creating a new statement
 * 
 * Request Headers:
 *   - Authorization: Bearer <jwt_token> (required)
 * 
 * Request Body:
 *   - politician_id: uuid (required)
 *   - statement_text: string (required, min: 10 chars, max: 5000 chars)
 *   - statement_timestamp: timestamp (required, cannot be in future)
 * 
 * Success Response (201):
 *   - SingleResponse<StatementDetailDTO>
 * 
 * Error Responses:
 *   - 400: Invalid request data
 *   - 401: Authentication required
 *   - 404: Politician not found
 *   - 500: Internal server error
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // ========================================================================
    // 1. Authenticate User
    // ========================================================================
    
    const authHeader = request.headers.get('Authorization');
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

    if (!authenticatedUserId) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // 2. Parse Request Body
    // ========================================================================
    
    let body: CreateStatementCommand;
    try {
      body = await request.json();
    } catch (parseError) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid JSON in request body',
          code: 'VALIDATION_ERROR',
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // 3. Validate Request Data
    // ========================================================================
    
    // Validate politician_id
    if (!body.politician_id || !isValidUUID(body.politician_id)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Politician ID is required and must be a valid UUID',
          code: 'VALIDATION_ERROR',
          details: { field: 'politician_id' },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate statement_text
    if (!body.statement_text || typeof body.statement_text !== 'string') {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Statement text is required',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_text' },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedText = body.statement_text.trim();

    if (trimmedText.length < 10) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Statement text must be at least 10 characters',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_text', length: trimmedText.length },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (body.statement_text.length > 5000) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Statement text cannot exceed 5000 characters',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_text', length: body.statement_text.length },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate statement_timestamp
    if (!body.statement_timestamp || typeof body.statement_timestamp !== 'string') {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Statement timestamp is required',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_timestamp' },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if timestamp is valid
    const timestamp = new Date(body.statement_timestamp);
    if (isNaN(timestamp.getTime())) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid statement timestamp format',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_timestamp' },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if timestamp is not in the future
    if (timestamp.getTime() > Date.now()) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Statement timestamp cannot be in the future',
          code: 'VALIDATION_ERROR',
          details: { field: 'statement_timestamp' },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // 4. Create Statement
    // ========================================================================
    
    const statementService = new StatementService();
    
    try {
      const statement = await statementService.createStatement(body, authenticatedUserId);

      if (!statement) {
        throw new Error('Failed to create statement');
      }

      // ========================================================================
      // 5. Return Success Response
      // ========================================================================
      
      return new Response(
        JSON.stringify({
          data: statement,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (serviceError) {
      // Check if it's a "Politician not found" error
      if (serviceError instanceof Error && serviceError.message === 'Politician not found') {
        const errorResponse: ErrorResponse = {
          error: {
            message: 'Politician not found',
            code: 'NOT_FOUND',
          },
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Re-throw for general error handler
      throw serviceError;
    }
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================
    
    console.error('Error creating statement:', error);

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Failed to create statement',
        code: 'INTERNAL_ERROR',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

