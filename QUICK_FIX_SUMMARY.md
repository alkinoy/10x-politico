# Quick Fix Summary: GitHub Actions E2E Tests

## Problem
E2E tests passed locally but failed in GitHub Actions with:
- ❌ `AuthApiError: Email address "test-add@example.com" is invalid`
- ❌ `TimeoutError: page.waitForSelector: Timeout exceeded` (no statements found)
- ❌ `Error: http://localhost:4321 is already used` (port conflict)

## Solution
Four fixes were applied:

### 1. ✅ Fixed Test Email Format
**Changed**: `test-add@example.com` → `testadd@example.com`
**Reason**: Cloud Supabase rejects emails with hyphens

### 2. ✅ Added Database Seeding
**Added step**: `supabase db seed` after migrations
**Impact**: Populates database with test data (parties, politicians, statements)

### 3. ✅ Build Application Before Tests
**Added step**: Build application with all environment variables
**Impact**: Creates production build that Playwright can serve

### 4. ✅ Fixed Port Conflict
**Changed**: Let Playwright manage server lifecycle
**Reason**: Manual server start conflicted with Playwright's webServer config
**Solution**: 
- Removed manual server start/stop from CI workflow
- Updated `playwright.config.ts` to use preview server in CI
- Playwright now handles starting/stopping the server automatically

## Files Modified
1. `.github/workflows/ci.yml` - Added seeding and build steps; removed manual server management
2. `tests/e2e/add-statement.spec.ts` - Fixed email format
3. `playwright.config.ts` - Updated to use preview server in CI instead of dev server

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
- Build application before tests with proper env vars
- Let Playwright manage server lifecycle to avoid port conflicts
- Update playwright.config.ts to use preview server in CI"
git push
```

## Verification Checklist
Once pushed, the CI should:
- ✅ Apply migrations to cloud Supabase
- ✅ Seed database with test data
- ✅ Build application successfully
- ✅ Let Playwright start preview server automatically
- ✅ Run all 5 E2E tests successfully
- ✅ Upload test artifacts

## Additional Notes
- Seed data creates users: alice@example.com, bob@example.com, carol@example.com (all with password: password123)
- Tests use cloud Supabase instance (not local)
- Playwright's `webServer` config automatically starts/stops the server
- In CI: uses `npm run preview` (production build), locally: uses `astro dev`
- All environment variables properly configured for both build and runtime

