# E2E CI Email Validation Fix

## Problem

E2E tests were failing in GitHub Actions CI with the following error:

```
AuthApiError: Email address "test.user@example.com" is invalid
```

Tests passed locally but failed in the cloud Supabase environment.

## Root Cause

The test user email `test.user@example.com` contained a dot (`.`) in the local part of the email address (before the `@` symbol). Supabase's email validator in the cloud environment has stricter validation rules than the local development environment and rejects email addresses with dots in the local part.

## Solution

Changed the test user email format in `tests/e2e/add-statement.spec.ts` from:
```typescript
const TEST_USER_EMAIL = "test.user@example.com";
```

To:
```typescript
const TEST_USER_EMAIL = `testuser${Date.now()}@example.com`;
```

### Benefits of this approach:

1. **No dots in local part**: Removes the problematic dot character that was causing validation to fail
2. **Uniqueness**: Using `Date.now()` ensures each test run creates a unique user, preventing conflicts
3. **Test isolation**: Each test run gets its own user, improving test reliability in CI/CD environments
4. **Consistency**: Uses the same domain (`example.com`) as the seeded test users (alice@, bob@, carol@)

## Related Files Changed

- `tests/e2e/add-statement.spec.ts` - Updated TEST_USER_EMAIL constant

## Verification

The fix ensures:
- ✅ Email format is accepted by Supabase cloud environment
- ✅ Tests maintain isolation between runs
- ✅ No conflicts with existing test users
- ✅ Consistent with seeded user email patterns

## Notes

- The seeded test users (alice@example.com, bob@example.com, carol@example.com) all use simple formats without dots
- The `createTestUser` function in `db-helpers.ts` already handles the case where users might exist by trying to sign in first
- With the timestamp approach, new users will be created on each test run, which is acceptable for CI/CD environments

