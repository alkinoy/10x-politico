# REST API Plan for SpeechKarma

## 1. Resources

The API exposes the following resources based on the database schema:

| Resource | Database Table | Description |
|----------|---------------|-------------|
| Parties | `parties` | Political party information |
| Politicians | `politicians` | Politician profiles with biographical data |
| Statements | `statements` | Political statements attributed to politicians |
| Profiles | `profiles` | User profile information (extends Supabase auth.users) |
| Reports | N/A (future table) | Statement reports/flags for moderation |

---

## 2. Endpoints

### 2.1 Parties

#### GET /api/parties
**Description:** Retrieve a list of all political parties.

**Query Parameters:**
- `sort` (optional): Sort field. Values: `name`, `created_at`. Default: `name`
- `order` (optional): Sort order. Values: `asc`, `desc`. Default: `asc`

**Request Payload:** None

**Response Payload:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "abbreviation": "string | null",
      "description": "string | null",
      "color_hex": "string | null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "count": "number"
}
```

**Success Response:**
- Status: 200 OK
- Message: "Parties retrieved successfully"

**Error Responses:**
- Status: 500 Internal Server Error
- Message: "Failed to retrieve parties"

---

#### GET /api/parties/:id
**Description:** Retrieve a single party by ID.

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "abbreviation": "string | null",
    "description": "string | null",
    "color_hex": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Party retrieved successfully"

**Error Responses:**
- Status: 404 Not Found
- Message: "Party not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve party"

---

#### POST /api/parties
**Description:** Create a new political party. (Admin only, post-MVP)

**Authentication:** Required (Admin only)

**Query Parameters:** None

**Request Payload:**
```json
{
  "name": "string (required, unique)",
  "abbreviation": "string (optional)",
  "description": "string (optional)",
  "color_hex": "string (optional, format: #RRGGBB)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "abbreviation": "string | null",
    "description": "string | null",
    "color_hex": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 201 Created
- Message: "Party created successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid party data" (details in response body)
  - "Party name is required"
  - "Party name already exists"
  - "Invalid color hex format (must be #RRGGBB)"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Admin access required"
- Status: 500 Internal Server Error
- Message: "Failed to create party"

---

#### PATCH /api/parties/:id
**Description:** Update an existing party. (Admin only, post-MVP)

**Authentication:** Required (Admin only)

**Query Parameters:** None

**Request Payload:**
```json
{
  "name": "string (optional)",
  "abbreviation": "string (optional)",
  "description": "string (optional)",
  "color_hex": "string (optional, format: #RRGGBB)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "abbreviation": "string | null",
    "description": "string | null",
    "color_hex": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Party updated successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid party data"
  - "Invalid color hex format (must be #RRGGBB)"
  - "Party name already exists"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Admin access required"
- Status: 404 Not Found
- Message: "Party not found"
- Status: 500 Internal Server Error
- Message: "Failed to update party"

---

### 2.2 Politicians

#### GET /api/politicians
**Description:** Retrieve a list of politicians with optional search and filtering.

**Query Parameters:**
- `search` (optional): Full-text search by politician name (first or last)
- `party_id` (optional): Filter by party UUID
- `sort` (optional): Sort field. Values: `last_name`, `created_at`. Default: `last_name`
- `order` (optional): Sort order. Values: `asc`, `desc`. Default: `asc`
- `page` (optional): Page number for pagination. Default: 1
- `limit` (optional): Results per page. Default: 50, max: 100

**Request Payload:** None

**Response Payload:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "party_id": "uuid",
      "party": {
        "id": "uuid",
        "name": "string",
        "abbreviation": "string | null",
        "color_hex": "string | null"
      },
      "biography": "string | null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "total_pages": "number"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Politicians retrieved successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid query parameters"
  - "Invalid page number"
  - "Limit exceeds maximum (100)"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve politicians"

---

#### GET /api/politicians/:id
**Description:** Retrieve a single politician by ID with party information.

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "party_id": "uuid",
    "party": {
      "id": "uuid",
      "name": "string",
      "abbreviation": "string | null",
      "description": "string | null",
      "color_hex": "string | null"
    },
    "biography": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "statements_count": "number"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Politician retrieved successfully"

**Error Responses:**
- Status: 404 Not Found
- Message: "Politician not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve politician"

---

#### POST /api/politicians
**Description:** Create a new politician. (Admin only, post-MVP)

**Authentication:** Required (Admin only)

**Query Parameters:** None

**Request Payload:**
```json
{
  "first_name": "string (required, min length: 1 after trim)",
  "last_name": "string (required, min length: 1 after trim)",
  "party_id": "uuid (required)",
  "biography": "string (optional)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "party_id": "uuid",
    "party": {
      "id": "uuid",
      "name": "string",
      "abbreviation": "string | null",
      "color_hex": "string | null"
    },
    "biography": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 201 Created
- Message: "Politician created successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid politician data"
  - "First name is required and cannot be empty"
  - "Last name is required and cannot be empty"
  - "Party ID is required"
  - "Politician with this name already exists in this party"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Admin access required"
- Status: 404 Not Found
- Message: "Party not found"
- Status: 500 Internal Server Error
- Message: "Failed to create politician"

---

#### PATCH /api/politicians/:id
**Description:** Update an existing politician. (Admin only, post-MVP)

**Authentication:** Required (Admin only)

**Query Parameters:** None

**Request Payload:**
```json
{
  "first_name": "string (optional, min length: 1 after trim)",
  "last_name": "string (optional, min length: 1 after trim)",
  "party_id": "uuid (optional)",
  "biography": "string (optional)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "party_id": "uuid",
    "party": {
      "id": "uuid",
      "name": "string",
      "abbreviation": "string | null",
      "color_hex": "string | null"
    },
    "biography": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Politician updated successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid politician data"
  - "First name cannot be empty"
  - "Last name cannot be empty"
  - "Politician with this name already exists in this party"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Admin access required"
- Status: 404 Not Found
- Message: "Politician not found" or "Party not found"
- Status: 500 Internal Server Error
- Message: "Failed to update politician"

---

### 2.3 Statements

#### GET /api/statements
**Description:** Retrieve recent statements with pagination (Recent Statements Feed - US-001).

**Query Parameters:**
- `page` (optional): Page number for pagination. Default: 1
- `limit` (optional): Results per page. Default: 50, max: 100
- `politician_id` (optional): Filter by politician UUID
- `sort_by` (optional): Sort by field. Values: `created_at`, `statement_timestamp`. Default: `created_at`
- `order` (optional): Sort order. Values: `asc`, `desc`. Default: `desc`

**Request Payload:** None

**Response Payload:**
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
      "statement_timestamp": "timestamp",
      "created_by_user_id": "uuid",
      "created_by": {
        "id": "uuid",
        "display_name": "string"
      },
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "total_pages": "number"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Statements retrieved successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid query parameters"
  - "Invalid page number"
  - "Limit exceeds maximum (100)"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve statements"

---

#### GET /api/politicians/:politician_id/statements
**Description:** Retrieve statements for a specific politician with time-based filtering (Politician Timeline - US-003).

**Query Parameters:**
- `page` (optional): Page number for pagination. Default: 1
- `limit` (optional): Results per page. Default: 50, max: 100
- `time_range` (optional): Filter by time range. Values: `7d`, `30d`, `365d`, `all`. Default: `all`
- `sort_by` (optional): Sort by field. Values: `created_at`, `statement_timestamp`. Default: `created_at`
- `order` (optional): Sort order. Values: `asc`, `desc`. Default: `desc`

**Request Payload:** None

**Response Payload:**
```json
{
  "data": [
    {
      "id": "uuid",
      "politician_id": "uuid",
      "statement_text": "string",
      "statement_timestamp": "timestamp",
      "created_by_user_id": "uuid",
      "created_by": {
        "id": "uuid",
        "display_name": "string"
      },
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "can_edit": "boolean",
      "can_delete": "boolean"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "total_pages": "number"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Statements retrieved successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid query parameters"
  - "Invalid time range"
  - "Invalid page number"
- Status: 404 Not Found
- Message: "Politician not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve statements"

---

#### GET /api/statements/:id
**Description:** Retrieve a single statement by ID with full details.

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
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
    "statement_timestamp": "timestamp",
    "created_by_user_id": "uuid",
    "created_by": {
      "id": "uuid",
      "display_name": "string"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "can_edit": "boolean",
    "can_delete": "boolean"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Statement retrieved successfully"

**Error Responses:**
- Status: 404 Not Found
- Message: "Statement not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve statement"

---

#### POST /api/statements
**Description:** Create a new statement (Add Statement - US-005).

**Authentication:** Required

**Query Parameters:** None

**Request Payload:**
```json
{
  "politician_id": "uuid (required)",
  "statement_text": "string (required, min: 10 chars after trim, max: 5000 chars)",
  "statement_timestamp": "timestamp (required, cannot be in the future)"
}
```

**Response Payload:**
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
    "statement_timestamp": "timestamp",
    "created_by_user_id": "uuid",
    "created_by": {
      "id": "uuid",
      "display_name": "string"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 201 Created
- Message: "Statement created successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid statement data"
  - "Politician ID is required"
  - "Statement text is required and must be at least 10 characters"
  - "Statement text cannot exceed 5000 characters"
  - "Statement timestamp is required"
  - "Statement timestamp cannot be in the future"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 404 Not Found
- Message: "Politician not found"
- Status: 500 Internal Server Error
- Message: "Failed to create statement"

---

#### PATCH /api/statements/:id
**Description:** Update a statement within the grace period (Edit Statement - US-006).

**Authentication:** Required (must be statement owner)

**Query Parameters:** None

**Request Payload:**
```json
{
  "statement_text": "string (optional, min: 10 chars after trim, max: 5000 chars)",
  "statement_timestamp": "timestamp (optional, cannot be in the future)"
}
```

**Response Payload:**
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
    "statement_timestamp": "timestamp",
    "created_by_user_id": "uuid",
    "created_by": {
      "id": "uuid",
      "display_name": "string"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Statement updated successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid statement data"
  - "Statement text must be at least 10 characters"
  - "Statement text cannot exceed 5000 characters"
  - "Statement timestamp cannot be in the future"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Cannot edit statement" (reasons below)
  - "You do not own this statement"
  - "Grace period (15 minutes) has expired"
  - "Statement has been deleted"
- Status: 404 Not Found
- Message: "Statement not found"
- Status: 500 Internal Server Error
- Message: "Failed to update statement"

---

#### DELETE /api/statements/:id
**Description:** Soft-delete a statement within the grace period (Delete Statement - US-007).

**Authentication:** Required (must be statement owner)

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "deleted_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Statement deleted successfully"

**Error Responses:**
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 403 Forbidden
- Message: "Cannot delete statement" (reasons below)
  - "You do not own this statement"
  - "Grace period (15 minutes) has expired"
  - "Statement has already been deleted"
- Status: 404 Not Found
- Message: "Statement not found"
- Status: 500 Internal Server Error
- Message: "Failed to delete statement"

---

### 2.4 Profiles

#### GET /api/profiles/me
**Description:** Retrieve the authenticated user's profile.

**Authentication:** Required

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "string",
    "is_admin": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "email": "string"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Profile retrieved successfully"

**Error Responses:**
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 404 Not Found
- Message: "Profile not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve profile"

---

#### PATCH /api/profiles/me
**Description:** Update the authenticated user's profile.

**Authentication:** Required

**Query Parameters:** None

**Request Payload:**
```json
{
  "display_name": "string (optional, min: 1 char after trim, max: 100 chars)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "string",
    "is_admin": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Profile updated successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid profile data"
  - "Display name cannot be empty"
  - "Display name cannot exceed 100 characters"
- Status: 401 Unauthorized
- Message: "Authentication required"
- Status: 404 Not Found
- Message: "Profile not found"
- Status: 500 Internal Server Error
- Message: "Failed to update profile"

---

#### GET /api/profiles/:id
**Description:** Retrieve a public profile by user ID.

**Query Parameters:** None

**Request Payload:** None

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "string",
    "created_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 200 OK
- Message: "Profile retrieved successfully"

**Error Responses:**
- Status: 404 Not Found
- Message: "Profile not found"
- Status: 500 Internal Server Error
- Message: "Failed to retrieve profile"

---

### 2.5 Reports

#### POST /api/statements/:statement_id/reports
**Description:** Report/flag a statement for moderation (Report Statement - US-008).

**Authentication:** Optional (can be anonymous)

**Query Parameters:** None

**Request Payload:**
```json
{
  "reason": "string (required, enum: 'spam', 'inaccurate', 'inappropriate', 'off_topic', 'other')",
  "comment": "string (optional, max: 500 chars)"
}
```

**Response Payload:**
```json
{
  "data": {
    "id": "uuid",
    "statement_id": "uuid",
    "reason": "string",
    "comment": "string | null",
    "reported_by_user_id": "uuid | null",
    "created_at": "timestamp"
  }
}
```

**Success Response:**
- Status: 201 Created
- Message: "Report submitted successfully"

**Error Responses:**
- Status: 400 Bad Request
- Message: "Invalid report data"
  - "Reason is required"
  - "Invalid reason value"
  - "Comment cannot exceed 500 characters"
- Status: 404 Not Found
- Message: "Statement not found"
- Status: 429 Too Many Requests
- Message: "Rate limit exceeded. Please try again later."
- Status: 500 Internal Server Error
- Message: "Failed to submit report"

---

### 2.6 Authentication

**Note:** Authentication is handled by Supabase Auth. The following endpoints are provided by Supabase and don't require custom implementation.

#### POST /auth/v1/signup
**Description:** Sign up a new user (US-004).

**Request Payload:**
```json
{
  "email": "string (required)",
  "password": "string (required, min: 6 chars)",
  "options": {
    "data": {
      "display_name": "string (optional)"
    }
  }
}
```

**Response:** Supabase Auth response with session token

---

#### POST /auth/v1/token?grant_type=password
**Description:** Sign in an existing user (US-004).

**Request Payload:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** Supabase Auth response with session token

---

#### POST /auth/v1/logout
**Description:** Sign out the current user (US-004).

**Authentication:** Required

**Response:** Success message

---

## 3. Authentication and Authorization

### 3.1 Authentication Mechanism

**Provider:** Supabase Auth

**Method:** JWT-based authentication

**Implementation:**
1. Users authenticate via Supabase Auth endpoints (`/auth/v1/signup`, `/auth/v1/token`)
2. Upon successful authentication, Supabase returns a JWT access token
3. Client includes the JWT in the `Authorization` header for protected requests:
   ```
   Authorization: Bearer <jwt_token>
   ```
4. Server validates JWT on each protected request using Supabase client
5. JWT contains user ID (`sub` claim) used for authorization checks

**Session Management:**
- Access tokens expire after 1 hour (Supabase default)
- Refresh tokens are used to obtain new access tokens
- Client automatically refreshes tokens using Supabase client SDK

---

### 3.2 Authorization Rules

**Public Endpoints (No Authentication Required):**
- `GET /api/parties`
- `GET /api/parties/:id`
- `GET /api/politicians`
- `GET /api/politicians/:id`
- `GET /api/statements`
- `GET /api/politicians/:politician_id/statements`
- `GET /api/statements/:id`
- `GET /api/profiles/:id`

**Authenticated Endpoints (Require Valid JWT):**
- `GET /api/profiles/me`
- `PATCH /api/profiles/me`
- `POST /api/statements`
- `PATCH /api/statements/:id` (ownership check required)
- `DELETE /api/statements/:id` (ownership check required)

**Admin-Only Endpoints (Require Admin Role - Post-MVP):**
- `POST /api/parties`
- `PATCH /api/parties/:id`
- `POST /api/politicians`
- `PATCH /api/politicians/:id`

---

### 3.3 Ownership Validation

For statement edit/delete operations:
1. Extract user ID from JWT token
2. Query statement from database
3. Compare `created_by_user_id` with authenticated user ID
4. Return 403 Forbidden if ownership check fails
5. Additionally validate grace period (15 minutes from `created_at`)

---

### 3.4 Grace Period Enforcement

**Business Rule:** Users can only edit or delete their own statements within 15 minutes of creation (US-006, US-007).

**Implementation:**
1. On `PATCH /api/statements/:id` or `DELETE /api/statements/:id`:
2. Retrieve statement's `created_at` timestamp
3. Calculate time difference: `now() - created_at`
4. If difference > 15 minutes, return 403 Forbidden with message "Grace period (15 minutes) has expired"
5. If within grace period and user is owner, allow operation

**Response Fields:**
- `can_edit`: boolean (calculated based on ownership + grace period)
- `can_delete`: boolean (calculated based on ownership + grace period)

---

## 4. Validation and Business Logic

### 4.1 Party Validation

**Database Constraints:**
- `name`: NOT NULL, UNIQUE
- `color_hex`: Must match regex `^#[0-9A-Fa-f]{6}$`

**API Validation:**
- `name`: Required, non-empty string
- `color_hex`: If provided, must be valid hex color format (#RRGGBB)
- Uniqueness check before insert/update

**Business Logic:**
- Cannot delete party if politicians reference it (ON DELETE RESTRICT)

---

### 4.2 Politician Validation

**Database Constraints:**
- `first_name`: NOT NULL, min length 1 after trim
- `last_name`: NOT NULL, min length 1 after trim
- `party_id`: NOT NULL, must reference existing party
- UNIQUE constraint on `(first_name, last_name, party_id)`

**API Validation:**
- `first_name`: Required, non-empty after trimming whitespace
- `last_name`: Required, non-empty after trimming whitespace
- `party_id`: Required, must be valid UUID of existing party
- Uniqueness check for (first_name, last_name, party_id) combination

**Business Logic:**
- Cannot delete politician if statements reference it (ON DELETE RESTRICT)
- When retrieving politician, include current party information
- Statement count can be calculated and returned in detail view

---

### 4.3 Statement Validation

**Database Constraints:**
- `politician_id`: NOT NULL, must reference existing politician
- `statement_text`: NOT NULL, min length 10 after trim, max length 5000
- `statement_timestamp`: NOT NULL, must be <= `created_at`
- `created_by_user_id`: NOT NULL, must reference existing user
- `deleted_at`: NULL for active statements

**API Validation:**
- `politician_id`: Required, must be valid UUID of existing politician
- `statement_text`: Required, min 10 characters after trim, max 5000 characters
- `statement_timestamp`: Required, valid timestamp, cannot be in future
- User must be authenticated for create/edit/delete operations

**Business Logic:**
1. **Create Statement:**
   - Validate all required fields
   - Set `created_by_user_id` from authenticated user's JWT
   - Set `created_at` to current timestamp
   - Verify `statement_timestamp <= created_at`

2. **Edit Statement:**
   - Verify user owns statement (`created_by_user_id` matches authenticated user)
   - Verify statement not deleted (`deleted_at IS NULL`)
   - Verify within 15-minute grace period (`created_at > now() - interval '15 minutes'`)
   - Update `updated_at` timestamp automatically via trigger
   - If updating `statement_timestamp`, verify it's not in future

3. **Delete Statement:**
   - Verify user owns statement
   - Verify statement not already deleted
   - Verify within 15-minute grace period
   - Soft delete: set `deleted_at = now()`
   - Keep record in database for audit purposes

4. **List Statements:**
   - Always filter out deleted statements: `WHERE deleted_at IS NULL`
   - Support pagination to prevent large result sets
   - Default sort by `created_at DESC` for Recent Feed
   - For politician timeline, support time range filters (7d, 30d, 365d, all)

5. **Calculate Edit/Delete Permissions:**
   - Return `can_edit` and `can_delete` boolean fields
   - Logic: `(created_by_user_id = auth.uid()) AND (deleted_at IS NULL) AND (created_at > now() - interval '15 minutes')`

---

### 4.4 Profile Validation

**Database Constraints:**
- `id`: Must reference existing user in auth.users
- `display_name`: NOT NULL, min length 1 after trim, max length 100
- `is_admin`: NOT NULL, default false

**API Validation:**
- `display_name`: Required for updates, non-empty after trim, max 100 characters
- `is_admin`: Cannot be modified by users (admin-only field)

**Business Logic:**
- Profile automatically created on user signup via trigger
- Default `display_name` extracted from email or metadata
- Users can only update their own profile
- Public profile endpoints only expose minimal information (id, display_name, created_at)

---

### 4.5 Report Validation

**API Validation:**
- `reason`: Required, must be one of predefined values
- `comment`: Optional, max 500 characters
- Statement must exist and not be deleted

**Business Logic:**
- Anonymous reporting allowed (MVP)
- If user authenticated, link report to user ID
- Implement rate limiting to prevent spam (e.g., max 10 reports per IP per hour)
- Store all reports for admin review (post-MVP moderation console)

---

### 4.6 Pagination

**Standard Pagination Parameters:**
- `page`: Page number (default: 1, min: 1)
- `limit`: Results per page (default: 50, min: 1, max: 100)

**Pagination Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1523,
    "total_pages": 31
  }
}
```

**Applied to:**
- `GET /api/politicians`
- `GET /api/statements`
- `GET /api/politicians/:politician_id/statements`

---

### 4.7 Filtering and Sorting

**Politicians:**
- Filter: `party_id`, full-text `search`
- Sort: `last_name`, `created_at`
- Order: `asc`, `desc`

**Statements:**
- Filter: `politician_id`, `time_range` (7d, 30d, 365d, all)
- Sort: `created_at`, `statement_timestamp`
- Order: `asc`, `desc`

---

### 4.8 Performance Requirements

Based on US-013:
- Recent Statements page load: < 2 seconds
- Politician detail page load: < 2 seconds
- Paginated loads: < 1 second

**Optimization Strategies:**
1. Use database indexes optimized for query patterns:
   - `idx_statements_recent_feed` for recent statements
   - `idx_statements_politician_timeline` for politician timelines
   - `idx_politicians_fulltext_search` for politician search
2. Limit result sets via pagination (max 100 items per page)
3. Use partial indexes to exclude deleted records
4. Join party information efficiently in politician queries
5. Cache static data (parties list) on client side

---

### 4.9 Error Handling

**Standard Error Response Format:**
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "Additional context (optional)"
    }
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: No valid JWT provided
- `PERMISSION_DENIED`: User lacks required permissions
- `NOT_FOUND`: Resource not found
- `GRACE_PERIOD_EXPIRED`: Edit/delete window has passed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

**HTTP Status Code Mapping:**
- 400: Validation errors, invalid input
- 401: Authentication required
- 403: Permission denied (ownership, grace period, admin)
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Internal server error

---

### 4.10 Rate Limiting

**MVP Rate Limits:**
- Report submission: 10 per IP per hour
- Statement creation: 20 per user per hour
- API requests (general): 1000 per IP per hour

**Implementation:**
- Use in-memory cache or Redis to track request counts
- Return 429 status with `Retry-After` header
- Include rate limit info in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

---

## 5. Additional Considerations

### 5.1 CORS Configuration

**Allowed Origins:**
- Production domain (e.g., `https://speechkarma.com`)
- Development domains (e.g., `http://localhost:4321`, `http://localhost:3000`)

**Allowed Methods:**
- GET, POST, PATCH, DELETE, OPTIONS

**Allowed Headers:**
- `Authorization`, `Content-Type`, `Accept`

**Exposed Headers:**
- `X-RateLimit-*` headers

---

### 5.2 Content Security

**Input Sanitization:**
- Escape HTML in user-submitted text to prevent XSS
- Use parameterized queries to prevent SQL injection
- Validate all UUIDs before using in database queries

**Output Encoding:**
- Encode statement text when rendering to prevent script injection
- Use Content Security Policy headers

---

### 5.3 Monitoring and Logging

**Metrics to Track:**
- API endpoint response times
- Error rates by endpoint
- Authentication failures
- Rate limit hits
- Database query performance

**Logging:**
- Log all API requests with timestamp, endpoint, user ID, status code
- Log errors with stack traces for debugging
- Log grace period violations
- Log failed authentication attempts

---

### 5.4 Future API Enhancements (Post-MVP)

1. **Advanced Search:**
   - `GET /api/statements/search?q={query}` - Full-text search across statement text
   - Filter by date range, party, multiple politicians

2. **Moderation Endpoints:**
   - `GET /api/admin/reports` - List all reports
   - `PATCH /api/admin/reports/:id` - Resolve report
   - `DELETE /api/admin/statements/:id` - Admin hard delete

3. **Bulk Operations:**
   - `POST /api/statements/bulk` - Create multiple statements
   - `GET /api/statements/export` - Export statements as CSV/JSON

4. **Analytics:**
   - `GET /api/politicians/:id/stats` - Statement count, activity timeline
   - `GET /api/stats` - Overall platform statistics

5. **Subscriptions:**
   - `POST /api/subscriptions` - Subscribe to politician updates
   - `GET /api/subscriptions` - List user subscriptions

6. **Source Verification:**
   - Add `source_url` field to statements
   - Add `verified` boolean flag
   - Implement verification workflow

---

## 6. Implementation Notes for Astro

Since the tech stack uses Astro 5 with API endpoints:

1. **API Route Structure:**
   ```
   src/pages/api/
     parties/
       index.ts          → GET /api/parties (list)
       [id].ts           → GET /api/parties/:id (detail)
     politicians/
       index.ts          → GET /api/politicians (list)
       [id].ts           → GET /api/politicians/:id (detail)
       [id]/statements.ts → GET /api/politicians/:id/statements
     statements/
       index.ts          → GET/POST /api/statements
       [id].ts           → GET/PATCH/DELETE /api/statements/:id
       [id]/reports.ts   → POST /api/statements/:id/reports
     profiles/
       me.ts             → GET/PATCH /api/profiles/me
       [id].ts           → GET /api/profiles/:id
   ```

2. **Supabase Integration:**
   - Use `@supabase/supabase-js` client for database operations
   - Initialize client with service role key for server-side operations
   - Use `supabase.auth.getUser()` to validate JWT from Authorization header

3. **Type Safety:**
   - Use generated TypeScript types from Supabase schema
   - Define request/response DTOs for each endpoint
   - Share types between frontend and API routes

4. **Error Handling:**
   - Create utility functions for standard error responses
   - Centralize validation logic
   - Use try-catch blocks for database operations

5. **Middleware:**
   - Implement authentication middleware for protected routes
   - Implement admin check middleware
   - Add CORS headers via middleware

---

## 7. API Versioning Strategy

**Current Version:** v1 (implicit in `/api/` routes)

**Future Versioning:**
- When breaking changes needed, introduce `/api/v2/` routes
- Maintain v1 endpoints for backward compatibility
- Document deprecation timeline
- Use `API-Version` header for fine-grained versioning

---

## Conclusion

This REST API plan provides a comprehensive foundation for the SpeechKarma MVP. It aligns with the database schema, fulfills all user stories from the PRD, and is designed for implementation with Astro 5 and Supabase. The API prioritizes:

1. **Public access** for browsing and research (US-001, US-002, US-003)
2. **Authenticated contributions** with proper ownership controls (US-005)
3. **Grace period enforcement** for edits and deletes (US-006, US-007)
4. **Search and filtering** for findability (US-009, US-003)
5. **Performance** through indexed queries and pagination (US-013)
6. **Security** via JWT authentication and input validation
7. **Extensibility** for post-MVP features without breaking changes

The API is ready for implementation following the project structure guidelines and coding practices outlined in the workspace rules.

