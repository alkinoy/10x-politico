# GitHub Actions E2E Tests Fix

## Problem Summary

E2E tests were passing locally but failing in GitHub Actions with two main errors:

### 1. Database Schema Not Found
```
Error: Failed to fetch statements: Could not find the table 'public.statements' in the schema cache
```
- The cloud Supabase project used in CI didn't have database migrations applied
- Tests couldn't run because the schema was missing

### 2. Email Validation Errors
```
AuthApiError: Email address "test-add@example.com" is invalid
```
- The cloud Supabase project had strict email validation enabled
- Test emails like `test-add@example.com` were rejected

## Solution

Switched from using a cloud Supabase project to **running Supabase locally in CI** using Supabase CLI. This provides:

✅ **Automatic migration application** - Migrations are applied on every test run  
✅ **Clean, isolated environment** - Each CI run gets a fresh database  
✅ **No email validation issues** - Local instance has relaxed validation for testing  
✅ **No secrets dependency** - CI doesn't need cloud Supabase credentials  
✅ **Automatic seeding** - Test data is populated automatically

## Changes Made

### 1. `.github/workflows/ci.yml`

Updated the `e2e-test` job to:

1. **Remove cloud Supabase dependency**
   - Removed `environment: integration` 
   - Removed references to `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` secrets

2. **Add Supabase CLI setup**
   ```yaml
   - name: Setup Supabase CLI
     uses: supabase/setup-cli@v1
     with:
       version: latest
   ```

3. **Start local Supabase instance**
   ```yaml
   - name: Start Supabase local instance
     run: |
       supabase start
       # Wait for Supabase to be ready
       sleep 10
       # Extract credentials from local instance
       supabase status -o env > .env.supabase
       # Set environment variables for test run
   ```

4. **Apply migrations and seed data**
   ```yaml
   - name: Apply migrations and seed data
     run: |
       supabase db reset
   ```
   - Applies all migrations from `supabase/migrations/`
   - Runs seed data from `supabase/seed.sql`

5. **Add cleanup step**
   ```yaml
   - name: Stop Supabase
     if: always()
     run: supabase stop
   ```

### 2. `.gitignore`

Added Supabase local files to gitignore:
```
# Supabase local files
.supabase/
```

## How It Works

1. **CI starts**: GitHub Actions runner initializes
2. **Supabase CLI installed**: Via `supabase/setup-cli@v1` action
3. **Local instance started**: `supabase start` spins up Docker containers with PostgreSQL, Auth, etc.
4. **Migrations applied**: `supabase db reset` runs all SQL migrations
5. **Seed data loaded**: Test users, politicians, parties, and statements are created
6. **Environment configured**: `.env.test` file created with local Supabase credentials
7. **Tests run**: Playwright tests execute against local Supabase
8. **Cleanup**: Supabase containers are stopped

## Configuration Files

### `supabase/config.toml`

The existing configuration is properly set up:
- **Migrations**: Enabled (`db.migrations.enabled = true`)
- **Seeding**: Enabled (`db.seed.enabled = true`, pointing to `./seed.sql`)
- **Email confirmations**: Disabled (`auth.email.enable_confirmations = false`) - perfect for testing
- **Signup**: Enabled (`auth.enable_signup = true`)

### `supabase/migrations/20251029143000_initial_schema.sql`

Complete schema with:
- `parties` table
- `politicians` table  
- `profiles` table
- `statements` table
- Full-text search indexes
- RLS policies
- Triggers for auto-profile creation

### `supabase/seed.sql`

Test data includes:
- 5 political parties (Democratic, Republican, Independent, Libertarian, Green)
- 3 test users (`alice@example.com`, `bob@example.com`, `carol@example.com`)
- 8 politicians (Warren, Cruz, Sanders, AOC, DeSantis, Harris, Rubio, Buttigieg)
- 18 sample statements

## Benefits of This Approach

### 🚀 **Speed**
- Local instance starts in ~10-15 seconds
- No network latency to cloud

### 🔒 **Isolation**
- Each CI run is completely independent
- No test pollution between runs
- No need to clean up test data

### 🛠️ **Development Parity**
- CI environment matches local development
- Both use the same Supabase CLI approach
- Same migrations, same seed data

### 💰 **Cost**
- No cloud Supabase project needed for CI
- Runs entirely on GitHub Actions infrastructure

### 🔐 **Security**
- No need to store sensitive Supabase credentials as secrets
- Local instance uses ephemeral credentials

## Local Development

Developers can also use Supabase CLI locally:

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Run tests
npm run test:e2e

# Stop Supabase
supabase stop
```

This ensures their environment matches CI exactly.

## Removed Secret Requirements

The following GitHub secrets are **no longer required** for E2E tests:
- ~~`SUPABASE_URL`~~
- ~~`SUPABASE_ANON_KEY`~~
- ~~`SUPABASE_SERVICE_ROLE_KEY`~~

You can optionally remove these from your GitHub repository settings under:
**Settings → Secrets and variables → Actions → Repository secrets**

## Testing the Fix

To verify the fix works:

1. **Push to your branch**:
   ```bash
   git add .
   git commit -m "fix: use local Supabase in CI for E2E tests"
   git push
   ```

2. **Check GitHub Actions**: The E2E test job should now:
   - ✅ Start Supabase successfully
   - ✅ Apply migrations and seed data
   - ✅ Run all tests with no schema errors
   - ✅ Run all tests with no email validation errors
   - ✅ Complete successfully

## Troubleshooting

### If tests still fail:

1. **Check Supabase start logs**: Look for Docker-related errors
2. **Verify migrations**: Ensure all migration files are valid SQL
3. **Check seed data**: Verify `seed.sql` doesn't have syntax errors
4. **Environment variables**: Confirm `.env.test` is created correctly

### Common issues:

- **Docker not available**: GitHub Actions runners have Docker pre-installed, but ensure the runner isn't custom
- **Port conflicts**: Supabase uses ports 54321-54327; these should be available on GitHub runners
- **Timeout errors**: Increase the sleep time after `supabase start` if needed

## Next Steps

Consider these improvements for the future:

1. **Add Supabase health check**: Verify Supabase is fully ready before running migrations
2. **Cache Docker layers**: Speed up Supabase startup by caching Docker images
3. **Parallel test execution**: Run E2E tests in parallel with proper isolation
4. **Matrix testing**: Test against different Supabase/PostgreSQL versions

## Related Documentation

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [GitHub Actions: Using services](https://docs.github.com/en/actions/using-containerized-services)

