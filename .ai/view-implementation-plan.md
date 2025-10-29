# API Endpoint Implementation Plan: GET /api/politicians/:politician_id/statements

<analysis>

## Analysis

### 1. API Specification Summary
- **Endpoint**: GET /api/politicians/:politician_id/statements
- **Purpose**: Retrieve statements for a specific politician with time-based filtering (Politician Timeline - US-003)
- **Authentication**: Optional (affects can_edit/can_delete flags in response)
- **Primary Use Case**: Display politician's statement timeline with filtering capabilities

### 2. Required and Optional Parameters

**Path Parameters:**
- `politician_id` (required): UUID of the politician

**Query Parameters:**
- `page` (optional): Page number, default: 1, min: 1
- `limit` (optional): Results per page, default: 50, min: 1, max: 100
- `time_range` (optional): Values: `7d`, `30d`, `365d`, `all`, default: `all`
- `sort_by` (optional): Values: `created_at`, `statement_timestamp`, default: `created_at`
- `order` (optional): Values: `asc`, `desc`, default: `desc`

### 3. DTO Types and Command Models

**Response DTOs:**
- `StatementDetailDTO`: Main response type with permission flags
- `PoliticianInStatementDTO`: Nested politician information
- `PartyInStatementDTO`: Nested party information
- `CreatedByDTO`: Creator information
- `PaginationDTO`: Pagination metadata
- `PaginatedResponse<StatementDetailDTO>`: Wrapper for paginated response

**Query Params Type:**
- `PoliticianTimelineQueryParams`: Type-safe query parameter validation

**Error Response:**
- `ErrorResponse`: Standard error structure

### 4. Service Layer Extraction

**New Service**: `src/lib/services/statement-service.ts`

Key responsibilities:
- Fetch statements for a specific politician
- Apply time range filtering
- Calculate pagination
- Compute can_edit/can_delete permissions
- Join with politician and party data

**Existing Services** (if they exist):
- Auth service: Extract and validate JWT tokens
- Validation service: Input validation utilities

### 5. Input Validation Plan

**Path Parameters:**
- Validate `politician_id` is a valid UUID format
- Verify politician exists in database

**Query Parameters:**
- `page`: Must be a positive integer
- `limit`: Must be between 1 and 100
- `time_range`: Must be one of the allowed enum values
- `sort_by`: Must be one of the allowed fields
- `order`: Must be 'asc' or 'desc'

**Database Constraints:**
- Filter out soft-deleted statements (deleted_at IS NULL)
- Apply time range constraints based on statement_timestamp or created_at

### 6. Error Logging

Since this is a read operation with no mutations, error logging should focus on:
- Invalid politician_id lookups
- Database query failures
- Invalid query parameters
- Performance issues (slow queries)

Log to console in development, structured logging in production.

### 7. Security Considerations

**Potential Threats:**
- **Enumeration attacks**: UUID politician_id mitigates this
- **SQL Injection**: Use parameterized queries via Supabase client
- **Data exposure**: Only show non-deleted statements
- **Performance abuse**: Limit max results to 100, pagination required
- **JWT token exposure**: Validate but don't require authentication for public access

**Mitigations:**
- Validate all inputs before database queries
- Use Supabase client's built-in parameterization
- Apply partial indexes for performance
- Rate limiting (application-level, not in this endpoint)
- Optional authentication for permission flags

### 8. Error Scenarios and Status Codes

**400 Bad Request:**
- Invalid time range value
- Invalid page number (< 1)
- Limit exceeds maximum (> 100)
- Invalid politician_id format (not UUID)

**404 Not Found:**
- Politician not found

**500 Internal Server Error:**
- Database connection failure
- Unexpected query errors
- Failed to retrieve statements

</analysis>

---

## 1. Endpoint Overview

**Purpose**: Retrieve paginated statements for a specific politician with optional time-based filtering and sorting. This endpoint powers the Politician Timeline view (US-003), allowing users to review a politician's statement history over different time periods.

**Key Features**:
- Time range filtering (last 7 days, 30 days, 365 days, or all time)
- Pagination support with configurable page size
- Flexible sorting by creation date or statement timestamp
- Permission flags (can_edit, can_delete) based on authenticated user
- Excludes soft-deleted statements
- Includes nested politician and party information

**User Stories Addressed**:
- US-003: Politician Timeline
- US-006: Edit Statement (permission calculation)
- US-007: Delete Statement (permission calculation)

---

## 2. Request Details

### HTTP Method
`GET`

### URL Structure
```
/api/politicians/:politician_id/statements
```

### Path Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `politician_id` | UUID | Yes | Valid UUID format | Unique identifier of the politician |

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `page` | number | No | 1 | >= 1 | Page number for pagination |
| `limit` | number | No | 50 | 1-100 | Results per page |
| `time_range` | string | No | 'all' | '7d', '30d', '365d', 'all' | Filter statements by time period |
| `sort_by` | string | No | 'created_at' | 'created_at', 'statement_timestamp' | Field to sort by |
| `order` | string | No | 'desc' | 'asc', 'desc' | Sort order |

### Request Headers
```
Authorization: Bearer <jwt_token> (optional)
```

### Request Body
None

---

## 3. Used Types

### Response DTOs

```typescript
// Main response wrapper
type Response = PaginatedResponse<StatementDetailDTO>;

// Statement with permission flags
type StatementDetailDTO = {
  id: string;
  politician_id: string;
  statement_text: string;
  statement_timestamp: string;
  created_by_user_id: string;
  created_by: CreatedByDTO;
  created_at: string;
  updated_at: string;
  politician: PoliticianInStatementDTO;
  can_edit: boolean;
  can_delete: boolean;
};

// Nested types
type PoliticianInStatementDTO = {
  id: string;
  first_name: string;
  last_name: string;
  party: PartyInStatementDTO;
};

type PartyInStatementDTO = {
  id: string;
  name: string;
  abbreviation: string | null;
  color_hex: string | null;
};

type CreatedByDTO = {
  id: string;
  display_name: string;
};

type PaginationDTO = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};
```

### Query Parameter Type

```typescript
type PoliticianTimelineQueryParams = {
  page?: number;
  limit?: number;
  time_range?: '7d' | '30d' | '365d' | 'all';
  sort_by?: 'created_at' | 'statement_timestamp';
  order?: SortOrder;
};
```

---

## 4. Response Details

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "politician_id": "uuid",
      "statement_text": "string",
      "statement_timestamp": "2025-01-15T14:30:00Z",
      "created_by_user_id": "uuid",
      "created_by": {
        "id": "uuid",
        "display_name": "John Doe"
      },
      "created_at": "2025-01-15T15:00:00Z",
      "updated_at": "2025-01-15T15:00:00Z",
      "politician": {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith",
        "party": {
          "id": "uuid",
          "name": "Democratic Party",
          "abbreviation": "DEM",
          "color_hex": "#0000FF"
        }
      },
      "can_edit": false,
      "can_delete": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": {
    "message": "Invalid query parameters",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "time_range",
      "issue": "Invalid time range value. Must be one of: 7d, 30d, 365d, all"
    }
  }
}
```

**Possible validation errors:**
- "Invalid page number. Must be >= 1"
- "Limit exceeds maximum (100)"
- "Invalid time range value"
- "Invalid politician_id format"
- "Invalid sort_by field"
- "Invalid order value"

#### 404 Not Found
```json
{
  "error": {
    "message": "Politician not found",
    "code": "NOT_FOUND"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "message": "Failed to retrieve statements",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## 5. Data Flow

### Request Processing Flow

```
1. Client Request
   ↓
2. Astro API Route Handler (/api/politicians/[id]/statements.ts)
   ↓
3. Extract & Validate Path Parameters (politician_id)
   ↓
4. Extract & Validate Query Parameters (page, limit, time_range, etc.)
   ↓
5. Optional: Extract & Validate JWT Token (for permission flags)
   ↓
6. Service Layer: StatementService.getStatementsForPolitician()
   ↓
7. Database Query via Supabase Client
   │
   ├─→ Verify politician exists
   │
   ├─→ Build filtered query:
   │   - WHERE politician_id = $1
   │   - AND deleted_at IS NULL
   │   - AND time_range filter (if applicable)
   │   - ORDER BY sort_by + order
   │   - LIMIT/OFFSET for pagination
   │
   ├─→ Execute count query for total
   │
   └─→ Execute data query with joins:
       - JOIN politicians
       - JOIN parties
       - JOIN profiles (for created_by)
   ↓
8. Transform Database Results to DTOs
   ↓
9. Calculate Permission Flags (can_edit, can_delete)
   - Check if authenticated user matches created_by_user_id
   - Check if within 15-minute grace period
   - Check if not deleted
   ↓
10. Build Paginated Response
   ↓
11. Return 200 OK with JSON Response
```

### Database Interactions

**Query 1: Verify Politician Exists**
```typescript
const politician = await supabase
  .from('politicians')
  .select('id')
  .eq('id', politician_id)
  .single();
```

**Query 2: Count Total Statements**
```typescript
const { count } = await supabase
  .from('statements')
  .select('*', { count: 'exact', head: true })
  .eq('politician_id', politician_id)
  .is('deleted_at', null)
  .gte('created_at', timeRangeFilter); // If time_range specified
```

**Query 3: Fetch Paginated Statements with Joins**
```typescript
const { data } = await supabase
  .from('statements')
  .select(`
    id,
    politician_id,
    statement_text,
    statement_timestamp,
    created_by_user_id,
    created_at,
    updated_at,
    politicians!inner (
      id,
      first_name,
      last_name,
      parties!inner (
        id,
        name,
        abbreviation,
        color_hex
      )
    ),
    profiles!inner (
      id,
      display_name
    )
  `)
  .eq('politician_id', politician_id)
  .is('deleted_at', null)
  .gte('created_at', timeRangeFilter) // Conditional
  .order(sort_by, { ascending: order === 'asc' })
  .range(offset, offset + limit - 1);
```

### Time Range Filter Calculation

```typescript
function getTimeRangeFilter(time_range: string): Date | null {
  const now = new Date();
  switch (time_range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '365d':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}
```

### Permission Flags Calculation

```typescript
function calculatePermissions(
  statement: Statement,
  authenticatedUserId: string | null
): { can_edit: boolean; can_delete: boolean } {
  if (!authenticatedUserId) {
    return { can_edit: false, can_delete: false };
  }

  const isOwner = statement.created_by_user_id === authenticatedUserId;
  const gracePeriodMs = 15 * 60 * 1000; // 15 minutes
  const timeSinceCreation = Date.now() - new Date(statement.created_at).getTime();
  const withinGracePeriod = timeSinceCreation <= gracePeriodMs;
  const notDeleted = statement.deleted_at === null;

  const canModify = isOwner && withinGracePeriod && notDeleted;

  return {
    can_edit: canModify,
    can_delete: canModify
  };
}
```

---

## 6. Security Considerations

### Authentication
- **Optional Authentication**: Endpoint is publicly accessible without JWT
- **JWT Validation**: If Authorization header present, validate token using Supabase client
- **User Context**: Extract user ID from JWT for permission calculations

### Authorization
- **No Ownership Required**: Any user can view statements (public data)
- **Permission Calculation**: can_edit/can_delete flags only set for statement owners

### Input Validation
1. **politician_id**: Validate UUID format before database query
2. **page**: Ensure positive integer, default to 1
3. **limit**: Enforce max 100, default to 50
4. **time_range**: Validate against enum values
5. **sort_by**: Validate against allowed fields
6. **order**: Validate against 'asc'/'desc'

### Data Protection
- **No Sensitive Data**: All returned data is public
- **Soft Delete Enforcement**: Never return statements where deleted_at IS NOT NULL
- **SQL Injection Prevention**: Use Supabase client parameterized queries
- **XSS Prevention**: statement_text should be sanitized on output (client-side)

### Rate Limiting
- Apply application-level rate limiting (1000 requests/hour per IP)
- Not implemented in this endpoint directly

### Performance Security
- **Max Limit Enforcement**: Prevent excessive data retrieval
- **Pagination Required**: Force pagination for large datasets
- **Index Usage**: Ensure queries use idx_statements_politician_timeline

---

## 7. Error Handling

### Validation Errors (400 Bad Request)

| Scenario | Error Message | Details |
|----------|---------------|---------|
| Invalid UUID format | "Invalid politician_id format" | politician_id not a valid UUID |
| Page < 1 | "Invalid page number. Must be >= 1" | page parameter validation |
| Limit > 100 | "Limit exceeds maximum (100)" | limit parameter validation |
| Invalid time_range | "Invalid time range value" | time_range not in enum |
| Invalid sort_by | "Invalid sort_by field" | sort_by not in allowed fields |
| Invalid order | "Invalid order value" | order not 'asc' or 'desc' |

### Not Found Errors (404 Not Found)

| Scenario | Error Message |
|----------|---------------|
| Politician doesn't exist | "Politician not found" |

### Server Errors (500 Internal Server Error)

| Scenario | Error Message | Logging |
|----------|---------------|---------|
| Database connection failure | "Failed to retrieve statements" | Log full error + stack trace |
| Unexpected query error | "Failed to retrieve statements" | Log query + error details |
| Supabase client error | "Failed to retrieve statements" | Log Supabase error response |

### Error Handling Pattern

```typescript
try {
  // Validation
  if (!isValidUUID(politician_id)) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid politician_id format",
          code: "VALIDATION_ERROR",
          details: { field: "politician_id" }
        }
      }),
      { status: 400 }
    );
  }

  // Business logic
  const politician = await verifyPoliticianExists(politician_id);
  if (!politician) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Politician not found",
          code: "NOT_FOUND"
        }
      }),
      { status: 404 }
    );
  }

  // ... rest of implementation

} catch (error) {
  console.error("Error fetching statements:", error);
  return new Response(
    JSON.stringify({
      error: {
        message: "Failed to retrieve statements",
        code: "INTERNAL_ERROR"
      }
    }),
    { status: 500 }
  );
}
```

---

## 8. Performance Considerations

### Database Optimization

**Index Usage**:
- Primary: `idx_statements_politician_timeline` (politician_id, created_at DESC)
- Alternative: `idx_statements_politician_statement_time` (if sorting by statement_timestamp)
- Partial index excludes deleted_at IS NOT NULL for faster queries

**Query Optimization**:
- Use selective fields in JOIN instead of SELECT *
- Leverage Supabase's query builder for optimized SQL generation
- Count query uses head: true to avoid fetching data

**Expected Performance**:
- Target: < 300ms for 50-100 records (per US-013 requirement)
- Database query: < 100ms
- Data transformation: < 50ms
- Response serialization: < 50ms
- Network/API overhead: < 100ms

### Pagination Strategy

**Benefits**:
- Prevents memory exhaustion from large result sets
- Improves response time
- Reduces database load

**Implementation**:
- Use LIMIT/OFFSET for simplicity in MVP
- Consider cursor-based pagination post-MVP for better performance

**Offset Calculation**:
```typescript
const offset = (page - 1) * limit;
const range = { start: offset, end: offset + limit - 1 };
```

### Caching Opportunities

**Not Recommended for MVP**:
- Data changes frequently (new statements)
- User-specific permissions (can_edit/can_delete)
- Pagination complicates cache invalidation

**Post-MVP Considerations**:
- Cache politician data (changes infrequently)
- Cache party data (static)
- CDN caching for unauthenticated requests

### Bottleneck Prevention

**Potential Bottlenecks**:
1. Database joins across 4 tables (statements, politicians, parties, profiles)
2. Permission calculation for each statement
3. Large time_range='all' with popular politicians

**Mitigations**:
1. Indexes optimize join performance
2. Permission calculation is simple boolean logic
3. Max limit of 100 enforces reasonable result size

---

## 9. Implementation Steps

### Step 1: Create Validation Utilities

**File**: `src/lib/utils/validation.ts`

```typescript
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validatePaginationParams(page?: number, limit?: number) {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(100, Math.max(1, limit || 50));
  return { page: validatedPage, limit: validatedLimit };
}

export function validateTimeRange(timeRange?: string): '7d' | '30d' | '365d' | 'all' {
  if (!timeRange || !['7d', '30d', '365d', 'all'].includes(timeRange)) {
    return 'all';
  }
  return timeRange as '7d' | '30d' | '365d' | 'all';
}
```

### Step 2: Create Authentication Utility

**File**: `src/lib/utils/auth.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';

export async function getAuthenticatedUser(authHeader?: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = createClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user.id;
}
```

### Step 3: Create Statement Service

**File**: `src/lib/services/statement-service.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { 
  StatementDetailDTO, 
  PaginatedResponse,
  PoliticianTimelineQueryParams 
} from '@/types';

export class StatementService {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getStatementsForPolitician(
    politicianId: string,
    queryParams: PoliticianTimelineQueryParams,
    authenticatedUserId: string | null
  ): Promise<PaginatedResponse<StatementDetailDTO>> {
    const { page = 1, limit = 50, time_range = 'all', sort_by = 'created_at', order = 'desc' } = queryParams;

    // Calculate time range filter
    const timeFilter = this.getTimeRangeFilter(time_range);

    // Build base query
    let query = this.supabase
      .from('statements')
      .select(`
        id,
        politician_id,
        statement_text,
        statement_timestamp,
        created_by_user_id,
        created_at,
        updated_at,
        politicians!inner (
          id,
          first_name,
          last_name,
          parties!inner (
            id,
            name,
            abbreviation,
            color_hex
          )
        ),
        profiles!inner (
          id,
          display_name
        )
      `)
      .eq('politician_id', politicianId)
      .is('deleted_at', null);

    // Apply time filter if not 'all'
    if (timeFilter) {
      query = query.gte('created_at', timeFilter.toISOString());
    }

    // Get total count
    const { count } = await this.supabase
      .from('statements')
      .select('*', { count: 'exact', head: true })
      .eq('politician_id', politicianId)
      .is('deleted_at', null)
      .gte('created_at', timeFilter?.toISOString() || '1970-01-01');

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Apply sorting and pagination
    const offset = (page - 1) * limit;
    const { data, error } = await query
      .order(sort_by, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Transform to DTOs with permission flags
    const statements: StatementDetailDTO[] = (data || []).map(stmt => ({
      id: stmt.id,
      politician_id: stmt.politician_id,
      statement_text: stmt.statement_text,
      statement_timestamp: stmt.statement_timestamp,
      created_by_user_id: stmt.created_by_user_id,
      created_at: stmt.created_at,
      updated_at: stmt.updated_at,
      politician: {
        id: stmt.politicians.id,
        first_name: stmt.politicians.first_name,
        last_name: stmt.politicians.last_name,
        party: {
          id: stmt.politicians.parties.id,
          name: stmt.politicians.parties.name,
          abbreviation: stmt.politicians.parties.abbreviation,
          color_hex: stmt.politicians.parties.color_hex
        }
      },
      created_by: {
        id: stmt.profiles.id,
        display_name: stmt.profiles.display_name
      },
      ...this.calculatePermissions(stmt, authenticatedUserId)
    }));

    return {
      data: statements,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages
      }
    };
  }

  private getTimeRangeFilter(timeRange: string): Date | null {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '365d':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private calculatePermissions(
    statement: any,
    authenticatedUserId: string | null
  ): { can_edit: boolean; can_delete: boolean } {
    if (!authenticatedUserId) {
      return { can_edit: false, can_delete: false };
    }

    const isOwner = statement.created_by_user_id === authenticatedUserId;
    const gracePeriodMs = 15 * 60 * 1000; // 15 minutes
    const timeSinceCreation = Date.now() - new Date(statement.created_at).getTime();
    const withinGracePeriod = timeSinceCreation <= gracePeriodMs;

    const canModify = isOwner && withinGracePeriod;

    return {
      can_edit: canModify,
      can_delete: canModify
    };
  }

  async verifyPoliticianExists(politicianId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('politicians')
      .select('id')
      .eq('id', politicianId)
      .single();

    return !error && !!data;
  }
}
```

### Step 4: Create API Route Handler

**File**: `src/pages/api/politicians/[id]/statements.ts`

```typescript
import type { APIRoute } from 'astro';
import { StatementService } from '@/lib/services/statement-service';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { isValidUUID, validatePaginationParams, validateTimeRange } from '@/lib/utils/validation';
import type { PoliticianTimelineQueryParams } from '@/types';

export const GET: APIRoute = async ({ params, request, url }) => {
  try {
    // Extract path parameter
    const politicianId = params.id;

    // Validate politician_id format
    if (!politicianId || !isValidUUID(politicianId)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid politician_id format",
            code: "VALIDATION_ERROR",
            details: { field: "politician_id" }
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract and validate query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const timeRange = url.searchParams.get('time_range') || 'all';
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const order = url.searchParams.get('order') || 'desc';

    // Validate query parameters
    if (page < 1) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid page number. Must be >= 1",
            code: "VALIDATION_ERROR",
            details: { field: "page" }
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (limit > 100) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Limit exceeds maximum (100)",
            code: "VALIDATION_ERROR",
            details: { field: "limit" }
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['7d', '30d', '365d', 'all'].includes(timeRange)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid time range value. Must be one of: 7d, 30d, 365d, all",
            code: "VALIDATION_ERROR",
            details: { field: "time_range" }
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['created_at', 'statement_timestamp'].includes(sortBy)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid sort_by field. Must be one of: created_at, statement_timestamp",
            code: "VALIDATION_ERROR",
            details: { field: "sort_by" }
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['asc', 'desc'].includes(order)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid order value. Must be one of: asc, desc",
            code: "VALIDATION_ERROR",
            details: { field: "order" }
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract authenticated user (optional)
    const authHeader = request.headers.get('Authorization');
    const authenticatedUserId = await getAuthenticatedUser(authHeader);

    // Verify politician exists
    const statementService = new StatementService();
    const politicianExists = await statementService.verifyPoliticianExists(politicianId);

    if (!politicianExists) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Politician not found",
            code: "NOT_FOUND"
          }
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Build query params object
    const queryParams: PoliticianTimelineQueryParams = {
      page,
      limit,
      time_range: timeRange as '7d' | '30d' | '365d' | 'all',
      sort_by: sortBy as 'created_at' | 'statement_timestamp',
      order: order as 'asc' | 'desc'
    };

    // Fetch statements
    const result = await statementService.getStatementsForPolitician(
      politicianId,
      queryParams,
      authenticatedUserId
    );

    // Return success response
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching politician statements:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to retrieve statements",
          code: "INTERNAL_ERROR"
        }
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
```

### Step 5: Add Environment Variables

**File**: `.env` (if not exists)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 6: Update Astro Config (if needed)

**File**: `astro.config.mjs`

Ensure API routes are properly configured and environment variables are accessible.

### Step 7: Create Supabase Client Utility

**File**: `src/db/client.ts` (if not exists)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function getSupabaseClient() {
  return createClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseClientAnon() {
  return createClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  );
}
```

### Step 8: Add Unit Tests (Post-MVP)

**File**: `src/lib/services/__tests__/statement-service.test.ts`

Test cases:
- Verify politician exists validation
- Time range filter calculation
- Permission flag calculation
- Pagination logic
- Error handling

### Step 9: Integration Testing

1. Test with valid politician_id and default parameters
2. Test pagination (page 1, 2, 3)
3. Test time_range filtering (7d, 30d, 365d, all)
4. Test sorting (created_at vs statement_timestamp, asc vs desc)
5. Test with authenticated user (verify can_edit/can_delete)
6. Test with non-existent politician_id (404)
7. Test with invalid query parameters (400)
8. Test edge cases (page=0, limit=101)

### Step 10: Performance Testing

1. Verify database query uses correct index
2. Measure response time with 50, 100 statements
3. Test with popular politician (many statements)
4. Ensure < 300ms response time (per US-013)

### Step 11: Documentation

1. Add JSDoc comments to service methods
2. Document query parameter validation rules
3. Add examples to API documentation
4. Update README with endpoint details

---

## Additional Notes

### Future Enhancements

1. **Cursor-Based Pagination**: Replace LIMIT/OFFSET with cursor-based approach for better performance with large datasets
2. **Response Caching**: Add HTTP caching headers for unauthenticated requests
3. **Search Filtering**: Add full-text search within politician's statements
4. **Export Functionality**: Add CSV/JSON export for statement timeline
5. **Real-time Updates**: WebSocket support for live statement updates

### Monitoring

Track the following metrics:
- Average response time by page number
- Most requested politicians
- Time range filter usage distribution
- Error rate by error type
- Database query execution time

### Dependencies

- `@supabase/supabase-js`: Supabase client library
- Astro 5: API route framework
- TypeScript 5: Type safety

### Related Endpoints

This endpoint is part of a family of statement endpoints:
- `GET /api/statements` - Recent statements feed
- `GET /api/statements/:id` - Single statement detail
- `POST /api/statements` - Create statement
- `PATCH /api/statements/:id` - Update statement
- `DELETE /api/statements/:id` - Delete statement

Consider code reuse for common functionality like permission calculation and DTO transformation.

