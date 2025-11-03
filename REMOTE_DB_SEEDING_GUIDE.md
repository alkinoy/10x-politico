# Remote Database Seeding Setup for CI/CD

This guide explains how to properly seed your remote Supabase database in GitHub Actions.

## Problem Fixed

The previous setup tried to use `psql` with an empty or missing connection string, causing the error:
```
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed
```

## Solution

The workflow uses your existing `SUPABASE_DSN` secret which contains the full database connection string.

### Setup

The connection string is already configured via the `SUPABASE_DSN` secret. No additional setup needed!

Your connection string should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

**If you need to update it:**

1. Go to your **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Find **Connection pooling** (this uses port 6543, ideal for CI/CD)
4. Copy the URI string and replace `[YOUR-PASSWORD]` with your actual database password
5. Update the **GitHub repository secret**:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Find `SUPABASE_DSN` and click **Update**
   - Paste your complete connection string
   - Click **Update secret**

## How It Works

The updated workflow (`e2e-test` job):

1. **Links to Supabase project** using Supabase CLI
2. **Applies migrations** with `supabase db push`
3. **Seeds the database** using `psql` with the `SUPABASE_DSN` connection string:
   - Validates that `SUPABASE_DSN` secret is set
   - Tests the connection before seeding
   - Runs `supabase/seed.sql` to populate test data
4. **Runs E2E tests** against the seeded database

## Troubleshooting

### Connection fails

If the connection test fails, check these:

1. **Verify the connection string format** - it should be:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```

2. **Test locally first**:
   ```bash
   psql "$SUPABASE_DSN" -c "SELECT version();"
   ```

3. **Wrong password error**:
   - Go to Supabase Dashboard → Settings → Database
   - Click **Reset database password**
   - Copy the new password and update your connection string
   - Update the `SUPABASE_DSN` secret in GitHub

4. **Connection string components**:
   - Use **Connection pooling** (port 6543) not direct connection (port 5432)
   - The host should be like `aws-0-[region].pooler.supabase.com`
   - Make sure `sslmode=require` is included or SSL is enabled

### Database not accessible

Make sure your Supabase project doesn't have IP restrictions that would block GitHub Actions runners.

## Required GitHub Secrets

For E2E tests to work, you need these secrets:

| Secret | Required | Purpose |
|--------|----------|---------|
| `SUPABASE_URL` | ✅ Yes | Your project URL (e.g., https://xxx.supabase.co) |
| `SUPABASE_ANON_KEY` | ✅ Yes | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Service role key for admin operations |
| `SUPABASE_ACCESS_TOKEN` | ✅ Yes | CLI access token for migrations |
| `SUPABASE_DSN` | ✅ Yes | Full database connection string |

## Testing Locally

You can test the seeding locally using your connection string:

```bash
# Test connection first
psql "$SUPABASE_DSN" -c "SELECT version();"

# Run the seed file
psql "$SUPABASE_DSN" -f supabase/seed.sql

# Or inline
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres" \
  -f supabase/seed.sql
```

## Changes Made

The key changes to `.github/workflows/ci.yml`:

1. ✅ Fixed database seeding to use `SUPABASE_DSN` secret properly
2. ✅ Added connection testing before seeding to catch issues early
3. ✅ Added comprehensive error messages and troubleshooting hints
4. ✅ Properly masks the connection string in GitHub Actions logs
5. ✅ Installs `psql` client before attempting to connect
6. ✅ Uses `set -euo pipefail` for proper error handling

The workflow will now:
- Provide clear, actionable error messages if the secret is missing
- Test the database connection before attempting to seed
- Show helpful debugging information if connection fails
- Properly handle errors during the seeding process

