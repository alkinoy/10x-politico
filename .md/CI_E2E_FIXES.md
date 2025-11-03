# CI E2E Test Fixes

## Issues Identified

The E2E tests were failing in GitHub Actions while passing locally. Analysis revealed two main issues:

### 1. Invalid Email Format
**Problem**: Cloud Supabase was rejecting test emails containing hyphens (e.g., `test-add@example.com`)
**Error**: `AuthApiError: Email address "test-add@example.com" is invalid`

### 2. Missing Database Seed Data
**Problem**: CI workflow applied migrations but never seeded the database with test data
**Impact**: Statement list tests failed because there was no data to display

### 3. Application Not Running
**Problem**: E2E tests tried to navigate to pages, but the Astro server wasn't built or started
**Impact**: Tests timed out waiting for elements that never loaded

## Fixes Applied

### Fix 1: Updated Test Email Format
**File**: `tests/e2e/add-statement.spec.ts`

Changed the test email from `test-add@example.com` to `testadd@example.com` to comply with Supabase's email validation rules.

```typescript
// Before
const TEST_USER_EMAIL = "test-add@example.com";

// After
const TEST_USER_EMAIL = "testadd@example.com";
```

### Fix 2: Added Database Seeding Step
**File**: `.github/workflows/ci.yml`

Added a new step after migrations to seed the database with test data:

```yaml
- name: Seed database with test data
  run: |
    echo "Seeding database with test data..."
    supabase db seed
    echo "✓ Database seeded successfully"
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

This runs the `supabase/seed.sql` file which creates:
- Test parties (Democratic, Republican, etc.)
- Test politicians (Elizabeth Warren, Ted Cruz, etc.)
- Test statements (various political statements)
- Test users (alice@example.com, bob@example.com, carol@example.com)

### Fix 3: Build and Start Application
**File**: `.github/workflows/ci.yml`

Added steps to build and start the Astro application before running tests:

1. **Build Application**:
   ```yaml
   - name: Build application
     run: npm run build
     env:
       SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
       SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
       PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
       USE_AI_SUMMARY: false
       OPENROUTER_API_KEY: dummy-key-not-used-in-tests
   ```

2. **Start Server in Background**:
   ```yaml
   - name: Start server in background
     run: |
       npm run preview -- --host 0.0.0.0 --port 4321 &
       echo $! > server.pid
       echo "Waiting for server to start..."
       sleep 5
       # Wait for server to be ready
       max_attempts=30
       attempt=0
       while [ $attempt -lt $max_attempts ]; do
         if curl -s http://localhost:4321 > /dev/null; then
           echo "✓ Server is ready"
           break
         fi
         attempt=$((attempt + 1))
         echo "Attempt $attempt/$max_attempts - waiting..."
         sleep 2
       done
     env:
       PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
   ```

3. **Stop Server After Tests**:
   ```yaml
   - name: Stop server
     if: always()
     run: |
       if [ -f server.pid ]; then
         kill $(cat server.pid) || true
       fi
   ```

## Updated CI Workflow

The E2E test job now follows this sequence:

1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Setup Supabase CLI
5. Link to cloud Supabase project
6. **Apply migrations** (ensures schema is up to date)
7. **Seed database** (populates with test data)
8. Create `.env.test` file
9. Install Playwright browsers
10. **Build application** (creates production build)
11. **Start server** (runs preview server on port 4321)
12. Run E2E tests
13. **Stop server** (cleanup)
14. Upload test artifacts

## Expected Results

With these fixes, the E2E tests should now:
- ✅ Successfully create test users with valid email formats
- ✅ Find and display seeded statements on the homepage
- ✅ Navigate to politician profiles that exist in the database
- ✅ Authenticate users and submit new statements
- ✅ Pass all 5 test cases consistently in CI

## Testing Notes

- The seed data creates test users with the password `password123`
- Tests use the cloud Supabase instance (not local)
- Seed data is idempotent (can be run multiple times safely)
- Test isolation is maintained through unique IDs for test-specific data

## Related Files

- `.github/workflows/ci.yml` - CI workflow configuration
- `tests/e2e/add-statement.spec.ts` - Add statement E2E tests
- `tests/e2e/statements-list.spec.ts` - Statement list E2E tests
- `tests/e2e/helpers/db-helpers.ts` - Database helper functions
- `supabase/seed.sql` - Database seed data

