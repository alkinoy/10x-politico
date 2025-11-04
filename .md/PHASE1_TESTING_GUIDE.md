# Phase 1 API Testing Guide

Quick reference for testing the newly implemented statement endpoints.

## Endpoints Implemented

### 1. GET /api/statements - Recent Statements Feed

**Purpose**: Retrieve recent statements with pagination and filtering

**Example Requests**:

```bash
# Get first page of recent statements (default 50 per page)
curl http://localhost:4321/api/statements

# Get statements with custom pagination
curl "http://localhost:4321/api/statements?page=1&limit=10"

# Filter statements by politician
curl "http://localhost:4321/api/statements?politician_id=<politician-uuid>"

# Sort by statement timestamp (oldest first)
curl "http://localhost:4321/api/statements?sort_by=statement_timestamp&order=asc"

# Complex query - paginated, filtered, sorted
curl "http://localhost:4321/api/statements?politician_id=<uuid>&page=2&limit=25&sort_by=created_at&order=desc"
```

**Expected Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "politician_id": "uuid",
      "politician": {
        "id": "uuid",
        "first_name": "string",
        "last_name": "string",
        "party": {
          "id": "uuid",
          "name": "string",
          "abbreviation": "string | null",
          "color_hex": "string | null"
        }
      },
      "statement_text": "string",
      "statement_timestamp": "2025-10-29T...",
      "created_by_user_id": "uuid",
      "created_by": {
        "id": "uuid",
        "display_name": "string"
      },
      "created_at": "2025-10-29T...",
      "updated_at": "2025-10-29T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 123,
    "total_pages": 3
  }
}
```

---

### 2. GET /api/statements/:id - Single Statement

**Purpose**: Retrieve a single statement by ID with permission flags

**Example Requests**:

```bash
# Get statement (unauthenticated)
curl http://localhost:4321/api/statements/<statement-uuid>

# Get statement (authenticated - shows permission flags)
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:4321/api/statements/<statement-uuid>
```

**Expected Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "politician_id": "uuid",
    "politician": {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "party": {
        "id": "uuid",
        "name": "string",
        "abbreviation": "string | null",
        "color_hex": "string | null"
      }
    },
    "statement_text": "string",
    "statement_timestamp": "2025-10-29T...",
    "created_by_user_id": "uuid",
    "created_by": {
      "id": "uuid",
      "display_name": "string"
    },
    "created_at": "2025-10-29T...",
    "updated_at": "2025-10-29T...",
    "can_edit": true,
    "can_delete": true
  }
}
```

**Permission Flags Logic**:
- `can_edit`: true if authenticated user is owner AND within 15-minute grace period
- `can_delete`: true if authenticated user is owner AND within 15-minute grace period
- Both false if unauthenticated or not owner or past grace period

---

### 3. POST /api/statements - Create Statement

**Purpose**: Create a new statement (requires authentication)

**Example Requests**:

```bash
# Create a statement
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "<politician-uuid>",
    "statement_text": "This is a political statement that must be at least 10 characters long.",
    "statement_timestamp": "2025-10-29T10:30:00.000Z"
  }'
```

**Request Body Requirements**:
- `politician_id`: Valid UUID of existing politician (required)
- `statement_text`: String, 10-5000 characters after trim (required)
- `statement_timestamp`: Valid ISO 8601 timestamp, not in future (required)

**Expected Response** (201 Created):
```json
{
  "data": {
    "id": "uuid",
    "politician_id": "uuid",
    "politician": {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "party": {
        "id": "uuid",
        "name": "string",
        "abbreviation": "string | null",
        "color_hex": "string | null"
      }
    },
    "statement_text": "This is a political statement...",
    "statement_timestamp": "2025-10-29T10:30:00.000Z",
    "created_by_user_id": "<your-user-id>",
    "created_by": {
      "id": "<your-user-id>",
      "display_name": "Your Name"
    },
    "created_at": "2025-10-29T...",
    "updated_at": "2025-10-29T...",
    "can_edit": true,
    "can_delete": true
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": {
    "message": "Invalid politician_id format",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "politician_id",
      "value": "invalid-uuid"
    }
  }
}
```

### 401 Unauthorized - Authentication Required
```json
{
  "error": {
    "message": "Authentication required",
    "code": "AUTHENTICATION_REQUIRED"
  }
}
```

### 404 Not Found - Resource Not Found
```json
{
  "error": {
    "message": "Statement not found",
    "code": "NOT_FOUND"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "message": "Failed to retrieve statements",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## Common Test Scenarios

### Scenario 1: View Recent Statements Feed (Public)
```bash
# No authentication needed
curl http://localhost:4321/api/statements
```
**Expected**: 200 OK with list of statements

---

### Scenario 2: Create Statement (Authenticated)
```bash
# Step 1: Get JWT token from Supabase Auth
# (Sign in via Supabase client or auth endpoint)

# Step 2: Create statement
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "<valid-politician-uuid>",
    "statement_text": "Example political statement here.",
    "statement_timestamp": "2025-10-29T12:00:00.000Z"
  }'
```
**Expected**: 201 Created with full statement details

---

### Scenario 3: View Your Own Statement (Within Grace Period)
```bash
# Get the statement you just created
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:4321/api/statements/<statement-uuid>
```
**Expected**: 200 OK with `can_edit: true` and `can_delete: true`

---

### Scenario 4: View Someone Else's Statement
```bash
# Get a statement created by another user
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:4321/api/statements/<other-statement-uuid>
```
**Expected**: 200 OK with `can_edit: false` and `can_delete: false`

---

### Scenario 5: Filter Statements by Politician
```bash
# Get all statements for a specific politician
curl "http://localhost:4321/api/statements?politician_id=<politician-uuid>"
```
**Expected**: 200 OK with filtered list

---

### Scenario 6: Validation Errors

**Too short statement text**:
```bash
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "<uuid>",
    "statement_text": "Short",
    "statement_timestamp": "2025-10-29T12:00:00.000Z"
  }'
```
**Expected**: 400 Bad Request - "Statement text must be at least 10 characters"

**Future timestamp**:
```bash
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "<uuid>",
    "statement_text": "This is a valid statement.",
    "statement_timestamp": "2030-01-01T12:00:00.000Z"
  }'
```
**Expected**: 400 Bad Request - "Statement timestamp cannot be in the future"

**Invalid politician ID**:
```bash
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "00000000-0000-0000-0000-000000000000",
    "statement_text": "This is a valid statement.",
    "statement_timestamp": "2025-10-29T12:00:00.000Z"
  }'
```
**Expected**: 404 Not Found - "Politician not found"

---

## Prerequisites for Testing

Before testing, ensure you have:

1. **Running Astro dev server**:
   ```bash
   npm run dev
   ```

2. **Supabase setup** with:
   - Database migrations applied
   - At least one party in `parties` table
   - At least one politician in `politicians` table
   - At least one user profile in `profiles` table

3. **Authentication token** (for POST requests):
   - Sign up or sign in via Supabase Auth
   - Get JWT token from auth response
   - Use in `Authorization: Bearer <token>` header

4. **Valid UUIDs** for testing:
   - Politician UUID (query from politicians table)
   - Statement UUID (after creating one)

---

## Database Setup Example

```sql
-- Create a test party
INSERT INTO parties (name, abbreviation, color_hex)
VALUES ('Test Party', 'TP', '#FF0000')
RETURNING id;

-- Create a test politician (use party id from above)
INSERT INTO politicians (first_name, last_name, party_id, biography)
VALUES ('John', 'Doe', '<party-uuid>', 'Test politician')
RETURNING id;

-- User profile should be created automatically on signup
-- Or manually:
INSERT INTO profiles (id, display_name, is_admin)
VALUES ('<user-uuid-from-auth>', 'Test User', false);
```

---

## Testing Tools

### Recommended Tools:
- **cURL**: Command-line HTTP client (examples above)
- **Postman**: GUI HTTP client
- **Insomnia**: Alternative GUI HTTP client
- **Bruno**: Open-source API client
- **HTTPie**: User-friendly command-line HTTP client

### HTTPie Examples:
```bash
# GET request
http GET http://localhost:4321/api/statements

# POST request
http POST http://localhost:4321/api/statements \
  Authorization:"Bearer <token>" \
  politician_id="<uuid>" \
  statement_text="Test statement" \
  statement_timestamp="2025-10-29T12:00:00.000Z"
```

---

## Next Phase Testing

After Phase 2 (User Management) is implemented:
- Test profile endpoints
- Use profile endpoint to verify created_by information
- Test profile updates

After Phase 3 (Edit/Delete) is implemented:
- Test editing statements within grace period
- Test editing statements after grace period (should fail)
- Test deleting statements (soft delete)

---

**Last Updated**: October 29, 2025  
**Status**: Ready for Testing

