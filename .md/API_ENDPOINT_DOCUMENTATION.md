# API Endpoint: GET /api/politicians/:politician_id/statements

## Overview

This endpoint retrieves paginated statements for a specific politician with optional time-based filtering and sorting capabilities. It supports optional authentication to calculate user-specific permission flags.

## Implementation Status

✅ **COMPLETED** - All components implemented and ready for testing

## Endpoint Details

### HTTP Method
`GET`

### URL Structure
```
/api/politicians/:politician_id/statements
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `politician_id` | UUID | Yes | Unique identifier of the politician |

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

## Example Requests

### Basic Request (No Authentication)
```bash
curl http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements
```

### With Pagination
```bash
curl "http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements?page=1&limit=20"
```

### With Time Range Filter (Last 30 Days)
```bash
curl "http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements?time_range=30d"
```

### With Sorting
```bash
curl "http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements?sort_by=statement_timestamp&order=asc"
```

### With Authentication (For Permission Flags)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements?time_range=7d&limit=10"
```

### Complex Query
```bash
curl "http://localhost:3000/api/politicians/550e8400-e29b-41d4-a716-446655440000/statements?page=2&limit=25&time_range=365d&sort_by=statement_timestamp&order=desc"
```

## Response Examples

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "politician_id": "550e8400-e29b-41d4-a716-446655440000",
      "statement_text": "We must invest in renewable energy for our future.",
      "statement_timestamp": "2025-10-25T14:30:00Z",
      "created_by_user_id": "f1e2d3c4-b5a6-4958-8c7d-6e5f4a3b2c1d",
      "created_by": {
        "id": "f1e2d3c4-b5a6-4958-8c7d-6e5f4a3b2c1d",
        "display_name": "John Doe"
      },
      "created_at": "2025-10-25T15:00:00Z",
      "updated_at": "2025-10-25T15:00:00Z",
      "politician": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "first_name": "Jane",
        "last_name": "Smith",
        "party": {
          "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
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

### Error Response: 400 Bad Request

```json
{
  "error": {
    "message": "Invalid politician_id format",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "politician_id",
      "value": "invalid-id"
    }
  }
}
```

**Possible Validation Errors:**
- Invalid politician_id format (not a valid UUID)
- Invalid page number (< 1)
- Limit exceeds maximum (> 100)
- Invalid time_range value
- Invalid sort_by field
- Invalid order value

### Error Response: 404 Not Found

```json
{
  "error": {
    "message": "Politician not found",
    "code": "NOT_FOUND"
  }
}
```

### Error Response: 500 Internal Server Error

```json
{
  "error": {
    "message": "Failed to retrieve statements",
    "code": "INTERNAL_ERROR"
  }
}
```

## Implementation Architecture

### File Structure

```
src/
├── pages/
│   └── api/
│       └── politicians/
│           └── [id]/
│               └── statements.ts          # API route handler
├── lib/
│   ├── services/
│   │   └── statement-service.ts          # Business logic layer
│   └── utils/
│       ├── validation.ts                 # Input validation utilities
│       └── auth.ts                       # Authentication utilities
└── db/
    ├── client.ts                         # Supabase client factory
    └── database.types.ts                 # Database type definitions
```

### Component Responsibilities

#### 1. API Route Handler (`statements.ts`)
- **Purpose**: HTTP request/response handling
- **Responsibilities**:
  - Extract and validate path parameters
  - Extract and validate query parameters
  - Handle authentication (optional)
  - Call service layer
  - Format responses with proper HTTP status codes
  - Error handling and logging

#### 2. Statement Service (`statement-service.ts`)
- **Purpose**: Business logic for statement operations
- **Responsibilities**:
  - Database query construction
  - Time range filtering logic
  - Pagination calculation
  - Permission flag computation (15-minute grace period)
  - Data transformation to DTOs
  - Politician existence validation

#### 3. Validation Utils (`validation.ts`)
- **Purpose**: Input validation helpers
- **Functions**:
  - `isValidUUID()` - UUID format validation
  - `validatePaginationParams()` - Page/limit validation
  - `validateTimeRange()` - Time range enum validation
  - `validateSortField()` - Sort field validation
  - `validateSortOrder()` - Sort order validation
  - `isValidISODate()` - ISO date validation
  - `isValidString()` - String validation

#### 4. Authentication Utils (`auth.ts`)
- **Purpose**: Authentication and authorization
- **Functions**:
  - `getAuthenticatedUser()` - JWT token validation
  - `canUserModifyResource()` - Permission checking
  - `getUserFromLocals()` - Extract user from Astro context

#### 5. Supabase Client (`client.ts`)
- **Purpose**: Centralized database client management
- **Functions**:
  - `getSupabaseClient()` - Service role client (server-side)
  - `getSupabaseClientAnon()` - Anon key client (client-side)
  - `getSupabaseClientForUser()` - User-specific client

## Business Logic

### Time Range Filtering

The endpoint supports filtering statements by the following time ranges:

- **7d**: Statements created in the last 7 days
- **30d**: Statements created in the last 30 days
- **365d**: Statements created in the last 365 days (1 year)
- **all**: All statements (no time filter)

Time range is calculated from the current timestamp backwards.

### Permission Flags

The `can_edit` and `can_delete` flags are calculated based on:

1. **Authentication**: User must be authenticated
2. **Ownership**: User must be the creator of the statement
3. **Grace Period**: Statement must be within 15 minutes of creation
4. **Not Deleted**: Statement must not be soft-deleted

Both flags have the same value (either both true or both false).

### Pagination

- Default page size: 50 statements
- Maximum page size: 100 statements
- Minimum page size: 1 statement
- Page numbering starts at 1
- Total pages calculated as: `Math.ceil(total / limit)`

### Sorting

Statements can be sorted by:
- `created_at`: When the statement was added to the database
- `statement_timestamp`: When the statement was actually made by the politician

Both support ascending (`asc`) or descending (`desc`) order.

## Database Queries

### Query 1: Verify Politician Exists
```typescript
SELECT id FROM politicians WHERE id = $politician_id LIMIT 1
```

### Query 2: Count Total Statements
```typescript
SELECT COUNT(*) FROM statements
WHERE politician_id = $politician_id
  AND deleted_at IS NULL
  AND created_at >= $time_filter  -- if time_range specified
```

### Query 3: Fetch Paginated Statements
```typescript
SELECT 
  s.id, s.politician_id, s.statement_text, s.statement_timestamp,
  s.created_by_user_id, s.created_at, s.updated_at,
  p.id, p.first_name, p.last_name,
  party.id, party.name, party.abbreviation, party.color_hex,
  profile.id, profile.display_name
FROM statements s
INNER JOIN politicians p ON s.politician_id = p.id
INNER JOIN parties party ON p.party_id = party.id
INNER JOIN profiles profile ON s.created_by_user_id = profile.id
WHERE s.politician_id = $politician_id
  AND s.deleted_at IS NULL
  AND s.created_at >= $time_filter  -- if time_range specified
ORDER BY s.$sort_by $order
LIMIT $limit OFFSET $offset
```

## Performance Considerations

### Recommended Database Indexes

```sql
-- Primary index for politician timeline queries
CREATE INDEX idx_statements_politician_timeline 
ON statements(politician_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Alternative index for statement_timestamp sorting
CREATE INDEX idx_statements_politician_statement_time 
ON statements(politician_id, statement_timestamp DESC) 
WHERE deleted_at IS NULL;
```

### Expected Performance
- Target response time: < 300ms for 50-100 records
- Database query: < 100ms
- Data transformation: < 50ms
- Response serialization: < 50ms
- Network overhead: < 100ms

## Security

### Input Validation
- All inputs validated before database queries
- UUID format strictly enforced
- Enum values validated against allowed sets
- Numeric ranges enforced (page >= 1, limit <= 100)

### SQL Injection Prevention
- All queries use Supabase client's parameterized queries
- No raw SQL string concatenation
- Type-safe query builder

### Data Access
- Public endpoint (no authentication required for read access)
- Soft-deleted statements always excluded
- Permission flags only show edit/delete rights
- No sensitive data exposed in responses

### Rate Limiting
- Application-level rate limiting recommended (not implemented in this endpoint)
- Suggested: 1000 requests/hour per IP

## Testing Checklist

- [ ] Test with valid politician_id and default parameters
- [ ] Test pagination (page 1, 2, 3)
- [ ] Test time_range filtering (7d, 30d, 365d, all)
- [ ] Test sorting (created_at vs statement_timestamp, asc vs desc)
- [ ] Test with authenticated user (verify can_edit/can_delete)
- [ ] Test with non-existent politician_id (404)
- [ ] Test with invalid query parameters (400)
- [ ] Test edge cases (page=0, limit=101, invalid UUID)
- [ ] Verify performance (< 300ms response time)
- [ ] Test with large datasets (many statements)

## Dependencies

```json
{
  "@supabase/supabase-js": "latest",
  "astro": "^5.13.7",
  "typescript": "^5.x"
}
```

## Environment Variables

See `ENV_SETUP.md` for detailed configuration instructions.

Required variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `NOT_FOUND` | 404 | Politician not found |
| `INTERNAL_ERROR` | 500 | Server error during processing |

## Future Enhancements

1. **Cursor-based pagination**: Replace LIMIT/OFFSET for better performance
2. **Response caching**: Add HTTP caching headers for unauthenticated requests
3. **Full-text search**: Add search within politician's statements
4. **Export functionality**: CSV/JSON export for statement timeline
5. **Real-time updates**: WebSocket support for live statement updates
6. **GraphQL alternative**: Provide GraphQL endpoint alongside REST

