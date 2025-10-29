# Profiles API Testing Guide

## Overview

This guide provides test scenarios for the Profiles API endpoints to ensure correct functionality.

**Prerequisites:**
- Supabase instance running (local or cloud)
- Authentication tokens for testing authenticated endpoints
- Test user accounts created

---

## Quick Test Setup

### 1. Get Authentication Token

First, sign up or sign in to get a JWT token:

```bash
# Sign up a new user
curl -X POST http://localhost:54321/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "options": {
      "data": {
        "display_name": "Test User"
      }
    }
  }'

# Or sign in existing user
curl -X POST "http://localhost:54321/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the access_token from the response
export TOKEN="<your_access_token>"
export USER_ID="<your_user_id>"
```

---

## Test Scenarios

### Scenario 1: GET /api/profiles/me

#### Test 1.1: Get Authenticated Profile ✅

**Expected**: 200 OK with full profile including email

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4321/api/profiles/me
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "Test User",
    "is_admin": false,
    "email": "test@example.com",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Verify:**
- ✅ Status code is 200
- ✅ Response includes email
- ✅ Response includes is_admin
- ✅ All fields are present

---

#### Test 1.2: Unauthenticated Request ❌

**Expected**: 401 Unauthorized

```bash
curl http://localhost:4321/api/profiles/me
```

**Expected Response:**
```json
{
  "error": {
    "message": "Authentication required",
    "code": "AUTHENTICATION_REQUIRED"
  }
}
```

**Verify:**
- ✅ Status code is 401
- ✅ Error message is clear

---

#### Test 1.3: Invalid Token ❌

**Expected**: 401 Unauthorized

```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:4321/api/profiles/me
```

**Verify:**
- ✅ Status code is 401

---

### Scenario 2: PATCH /api/profiles/me

#### Test 2.1: Update Display Name ✅

**Expected**: 200 OK with updated profile

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Updated Name"}'
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "Updated Name",
    "is_admin": false,
    "email": "test@example.com",
    "created_at": "timestamp",
    "updated_at": "timestamp (newer)"
  }
}
```

**Verify:**
- ✅ Status code is 200
- ✅ display_name changed to "Updated Name"
- ✅ updated_at timestamp is newer

---

#### Test 2.2: Empty Display Name ❌

**Expected**: 400 Bad Request

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "   "}'
```

**Expected Response:**
```json
{
  "error": {
    "message": "Display name cannot be empty",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "display_name"
    }
  }
}
```

**Verify:**
- ✅ Status code is 400
- ✅ Error indicates empty display name

---

#### Test 2.3: Display Name Too Long ❌

**Expected**: 400 Bad Request

```bash
# Generate 101 character string
LONG_NAME=$(python3 -c 'print("x" * 101)')

curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"display_name\": \"$LONG_NAME\"}"
```

**Expected Response:**
```json
{
  "error": {
    "message": "Display name cannot exceed 100 characters",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "display_name"
    }
  }
}
```

**Verify:**
- ✅ Status code is 400
- ✅ Error indicates length exceeded

---

#### Test 2.4: Whitespace Trimming ✅

**Expected**: 200 OK with trimmed name

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "  Trimmed Name  "}'
```

**Verify:**
- ✅ Status code is 200
- ✅ display_name is "Trimmed Name" (no leading/trailing spaces)

---

#### Test 2.5: Invalid JSON ❌

**Expected**: 400 Bad Request

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

**Expected Response:**
```json
{
  "error": {
    "message": "Invalid JSON in request body",
    "code": "VALIDATION_ERROR"
  }
}
```

**Verify:**
- ✅ Status code is 400

---

#### Test 2.6: Empty Body ✅

**Expected**: 200 OK with unchanged profile

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Verify:**
- ✅ Status code is 200
- ✅ Profile unchanged

---

#### Test 2.7: Unauthenticated Update ❌

**Expected**: 401 Unauthorized

```bash
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Hacker"}'
```

**Verify:**
- ✅ Status code is 401

---

### Scenario 3: GET /api/profiles/:id

#### Test 3.1: Get Public Profile ✅

**Expected**: 200 OK with public profile data only

```bash
curl http://localhost:4321/api/profiles/$USER_ID
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid",
    "display_name": "Test User",
    "created_at": "timestamp"
  }
}
```

**Verify:**
- ✅ Status code is 200
- ✅ Response includes id, display_name, created_at
- ✅ Response does NOT include email
- ✅ Response does NOT include is_admin
- ✅ Response does NOT include updated_at

---

#### Test 3.2: Invalid UUID Format ❌

**Expected**: 400 Bad Request

```bash
curl http://localhost:4321/api/profiles/not-a-uuid
```

**Expected Response:**
```json
{
  "error": {
    "message": "Invalid profile ID format",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "id",
      "value": "not-a-uuid"
    }
  }
}
```

**Verify:**
- ✅ Status code is 400
- ✅ Error indicates invalid UUID

---

#### Test 3.3: Non-Existent Profile ❌

**Expected**: 404 Not Found

```bash
curl http://localhost:4321/api/profiles/00000000-0000-0000-0000-000000000000
```

**Expected Response:**
```json
{
  "error": {
    "message": "Profile not found",
    "code": "NOT_FOUND"
  }
}
```

**Verify:**
- ✅ Status code is 404

---

#### Test 3.4: Cache Headers ✅

**Expected**: Cache-Control header present

```bash
curl -I http://localhost:4321/api/profiles/$USER_ID
```

**Verify:**
- ✅ Response includes `Cache-Control: public, max-age=300`

---

## Integration Tests

### Test 4: Complete Profile Management Flow

**Scenario**: User signs up, views profile, updates name, verifies public view

```bash
# 1. Sign up new user
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:54321/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "options": {
      "data": {
        "display_name": "New User"
      }
    }
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.user.id')

# 2. View authenticated profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4321/api/profiles/me

# 3. Update display name
curl -X PATCH http://localhost:4321/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Updated User"}'

# 4. Verify public profile shows updated name
curl http://localhost:4321/api/profiles/$USER_ID

# 5. Verify public profile doesn't show email
PUBLIC=$(curl -s http://localhost:4321/api/profiles/$USER_ID)
echo $PUBLIC | jq '.data.email'  # Should be null/undefined
```

**Verify:**
- ✅ Sign up creates profile automatically
- ✅ Default display name set from metadata
- ✅ Authenticated profile includes email
- ✅ Update reflected in both views
- ✅ Public profile hides sensitive data

---

### Test 5: Privacy Verification

**Scenario**: Verify email and admin status are private

```bash
# Get public profile
PUBLIC=$(curl -s http://localhost:4321/api/profiles/$USER_ID)

# These should NOT exist in public profile
echo $PUBLIC | jq '.data.email'       # null or undefined
echo $PUBLIC | jq '.data.is_admin'    # null or undefined
echo $PUBLIC | jq '.data.updated_at'  # null or undefined

# Only these should exist
echo $PUBLIC | jq '.data.id'           # exists
echo $PUBLIC | jq '.data.display_name' # exists
echo $PUBLIC | jq '.data.created_at'   # exists
```

**Verify:**
- ✅ Email not in public profile
- ✅ Admin status not in public profile
- ✅ Updated_at not in public profile

---

## Automated Test Script

Save this as `test-profiles.sh`:

```bash
#!/bin/bash

# Configuration
API_BASE="http://localhost:4321"
AUTH_BASE="http://localhost:54321"
ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
  local name=$1
  local expected_status=$2
  local response=$(eval "$3")
  local actual_status=$(echo "$response" | head -n 1 | cut -d' ' -f2)
  
  if [ "$actual_status" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $name"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $name (expected $expected_status, got $actual_status)"
    ((TESTS_FAILED++))
  fi
}

# Sign up test user
echo "Setting up test user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$AUTH_BASE/auth/v1/signup" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.user.id')

echo "Test user created: $USER_ID"
echo ""

# Run tests
echo "Running Profile API tests..."
echo ""

# Test 1: Get authenticated profile
test_endpoint "GET /api/profiles/me (authenticated)" "200" \
  "curl -s -w '%{http_code}' -H 'Authorization: Bearer $TOKEN' $API_BASE/api/profiles/me"

# Test 2: Get profile without auth
test_endpoint "GET /api/profiles/me (unauthenticated)" "401" \
  "curl -s -w '%{http_code}' $API_BASE/api/profiles/me"

# Test 3: Update display name
test_endpoint "PATCH /api/profiles/me (valid)" "200" \
  "curl -s -w '%{http_code}' -X PATCH -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"display_name\": \"Test\"}' $API_BASE/api/profiles/me"

# Test 4: Update with empty display name
test_endpoint "PATCH /api/profiles/me (empty name)" "400" \
  "curl -s -w '%{http_code}' -X PATCH -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"display_name\": \"   \"}' $API_BASE/api/profiles/me"

# Test 5: Get public profile
test_endpoint "GET /api/profiles/:id (valid)" "200" \
  "curl -s -w '%{http_code}' $API_BASE/api/profiles/$USER_ID"

# Test 6: Get public profile with invalid UUID
test_endpoint "GET /api/profiles/:id (invalid UUID)" "400" \
  "curl -s -w '%{http_code}' $API_BASE/api/profiles/not-a-uuid"

# Test 7: Get non-existent profile
test_endpoint "GET /api/profiles/:id (not found)" "404" \
  "curl -s -w '%{http_code}' $API_BASE/api/profiles/00000000-0000-0000-0000-000000000000"

# Summary
echo ""
echo "================================"
echo "Test Results:"
echo "  Passed: $TESTS_PASSED"
echo "  Failed: $TESTS_FAILED"
echo "================================"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
```

---

## Manual Checklist

Before deploying to production:

### Functionality
- [ ] GET /api/profiles/me returns authenticated user's profile
- [ ] PATCH /api/profiles/me updates display name
- [ ] GET /api/profiles/:id returns public profile
- [ ] Authentication required for /me endpoints
- [ ] No authentication required for public endpoint
- [ ] Email visible only in authenticated profile
- [ ] Admin status visible only in authenticated profile

### Validation
- [ ] Display name cannot be empty (after trim)
- [ ] Display name cannot exceed 100 characters
- [ ] Whitespace is trimmed before saving
- [ ] Invalid UUID format returns 400
- [ ] Invalid JSON returns 400

### Security
- [ ] JWT authentication working
- [ ] Invalid tokens rejected
- [ ] Public profiles don't expose email
- [ ] Public profiles don't expose admin status
- [ ] Users can only edit their own profile

### Performance
- [ ] Public profiles cached for 5 minutes
- [ ] Responses under 100ms for authenticated
- [ ] Responses under 50ms for public (cached)

### Error Handling
- [ ] 400 for validation errors
- [ ] 401 for authentication required
- [ ] 404 for not found
- [ ] 500 for server errors
- [ ] Error messages are helpful

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check JWT token is valid and not expired

### Issue: 404 Profile Not Found
**Solution**: Verify profile was created (check database trigger)

### Issue: 400 Invalid UUID
**Solution**: Ensure user ID is valid UUID v4 format

### Issue: Display Name Not Updating
**Solution**: Check request body format and content-type header

---

**Testing Complete**: All 3 profile endpoints validated ✅  
**Last Updated**: October 29, 2025

