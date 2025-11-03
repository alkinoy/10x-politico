# E2E CI Email Validation Fix

## Problem

E2E tests were failing in GitHub Actions CI with the following error:

```
AuthApiError: Email address "test.user@example.com" is invalid
```

Tests passed locally but failed in the cloud Supabase environment.

## Root Cause

The test was attempting to create new users via Supabase Auth API, which has stricter email validation in the cloud environment. Even simple formats like `testuser1762172641915@example.com` were being rejected with "Email address is invalid" errors.

The underlying issue is that Supabase Auth's email validation in cloud environments is more restrictive than in local development, and creating test users via the Auth API during test setup was unreliable.

## Solution

Changed to use **existing seeded test users** instead of creating new ones:

```typescript
// Before:
const TEST_USER_EMAIL = "test.user@example.com";
const TEST_USER_PASSWORD = "TestPassword123!";

// After:
const TEST_USER_EMAIL = "alice@example.com";
const TEST_USER_PASSWORD = "password123";
```

### Why this approach works:

1. **Uses pre-seeded users**: alice@example.com is created directly in the database via `seed.sql`, bypassing Auth API validation
2. **Reliable sign-in**: The `createTestUser` helper first attempts to sign in before creating a user
3. **Works in all environments**: No dependency on Auth API email validation rules
4. **Consistent with existing test data**: Aligns with the seeded users (alice, bob, carol)

## Related Files Changed

- `tests/e2e/add-statement.spec.ts` - Updated TEST_USER_EMAIL constant

## Verification

The fix ensures:
- ✅ No Auth API email validation issues
- ✅ Tests use reliable, pre-seeded users
- ✅ Works consistently in both local and CI environments
- ✅ No user creation failures during test setup

## Notes

- The seeded test users (alice@example.com, bob@example.com, carol@example.com) are created via SQL in `seed.sql`
- The `createTestUser` function in `db-helpers.ts` tries to sign in first, which succeeds for seeded users
- This approach is more reliable than dynamically creating users via Auth API
- If multiple test files need different users, they can use bob@ or carol@ to avoid conflicts

