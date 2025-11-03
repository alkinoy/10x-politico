# Quick Fix Summary: GitHub Actions E2E Tests

## Problem
E2E tests passed locally but failed in GitHub Actions with:
- ❌ `AuthApiError: Email address "test-add@example.com" is invalid`
- ❌ `TimeoutError: page.waitForSelector: Timeout exceeded` (no statements found)
- ❌ Tests couldn't navigate to pages (server not running)

## Solution
Three fixes were applied:

### 1. ✅ Fixed Test Email Format
**Changed**: `test-add@example.com` → `testadd@example.com`
**Reason**: Cloud Supabase rejects emails with hyphens

### 2. ✅ Added Database Seeding
**Added step**: `supabase db seed` after migrations
**Impact**: Populates database with test data (parties, politicians, statements)

### 3. ✅ Build and Start Server
**Added steps**:
- Build application with environment variables
- Start preview server on port 4321
- Wait for server to be ready
- Stop server after tests

## Files Modified
1. `.github/workflows/ci.yml` - Added seeding, build, and server start steps
2. `tests/e2e/add-statement.spec.ts` - Changed test email format

## Test Results
✅ **Local tests**: 5 passed (13.4s)
🔄 **CI tests**: Should now pass with these fixes

## Next Steps
Push these changes to trigger the CI workflow and verify the fixes work in GitHub Actions.

```bash
git add .
git commit -m "Fix: E2E tests in GitHub Actions CI

- Fix email validation by removing hyphen from test email
- Add database seeding step after migrations
- Build and start Astro server before running tests
- Add proper cleanup for server process"
git push
```

## Verification Checklist
Once pushed, the CI should:
- ✅ Apply migrations to cloud Supabase
- ✅ Seed database with test data
- ✅ Build application successfully
- ✅ Start server on port 4321
- ✅ Run all 5 E2E tests successfully
- ✅ Upload test artifacts

## Additional Notes
- Seed data creates users: alice@example.com, bob@example.com, carol@example.com (all with password: password123)
- Tests use cloud Supabase instance (not local)
- Server runs on same port (4321) as local testing
- All environment variables properly configured for both build and runtime

