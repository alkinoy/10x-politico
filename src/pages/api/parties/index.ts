/**
 * API Route: GET /api/parties
 * 
 * Retrieves a list of all political parties with optional sorting.
 * Public endpoint - no authentication required.
 */

import type { APIRoute } from 'astro';
import { PartyService } from '@/lib/services/party-service';
import type { PartiesQueryParams, ErrorResponse } from '@/types';

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
export const GET: APIRoute = async ({ url }) => {
  try {
    // ========================================================================
    // 1. Extract Query Parameters
    // ========================================================================
    
    const sortParam = url.searchParams.get('sort');
    const orderParam = url.searchParams.get('order');

    // ========================================================================
    // 2. Validate Query Parameters
    // ========================================================================
    
    const sort = sortParam || 'name';
    const order = orderParam || 'asc';

    // Validate sort field
    if (!['name', 'created_at'].includes(sort)) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid sort field. Must be one of: name, created_at',
          code: 'VALIDATION_ERROR',
          details: { field: 'sort', value: sort },
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
    // 3. Build Query Parameters Object
    // ========================================================================
    
    const queryParams: PartiesQueryParams = {
      sort: sort as 'name' | 'created_at',
      order: order as 'asc' | 'desc',
    };

    // ========================================================================
    // 4. Fetch Parties from Service
    // ========================================================================
    
    const partyService = new PartyService();
    const result = await partyService.getAllParties(queryParams);

    // ========================================================================
    // 5. Return Success Response
    // ========================================================================
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes (parties don't change often)
      },
    });
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================
    
    console.error('Error fetching parties:', error);

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Failed to retrieve parties',
        code: 'INTERNAL_ERROR',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

