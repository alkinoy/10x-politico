# Fix SUPABASE_DSN Connection String

## Current Issue

Your `SUPABASE_DSN` contains the placeholder `[YOUR_PASSWORD]` instead of the actual password:
```
postgresql://postgres:[YOUR_PASSWORD]@db.wviegnkfmkaqqsphghgm.supabase.co:5432/postgres
```

Additionally, you're using port **5432** (direct connection) instead of port **6543** (connection pooler), which is better for CI/CD.

## Solution

### Step 1: Get Your Database Password

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to the **Database Password** section
3. If you know your password, use it. If not, click **Reset Database Password**
4. Copy your password (you'll need it for the next step)

### Step 2: Get the Connection Pooler String

In the same page (**Settings** → **Database**), scroll to **Connection String** section:

1. Click on **Connection pooling** tab (not "Connection string")
2. Select **URI** format
3. You'll see something like:
   ```
   postgresql://postgres.wviegnkfmkaqqsphghgm:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. **Replace `[YOUR-PASSWORD]`** with your actual database password from Step 1
5. The final string should look like:
   ```
   postgresql://postgres.wviegnkfmkaqqsphghgm:YourActualPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Find the `SUPABASE_DSN` secret
4. Click **Update**
5. Paste your complete connection string (with actual password, not the placeholder)
6. Click **Update secret**

## Why Use Connection Pooler?

| Feature | Direct (port 5432) | Pooler (port 6543) |
|---------|-------------------|-------------------|
| For CI/CD | ❌ Not ideal | ✅ Recommended |
| Connection management | Manual | Automatic |
| Connection limits | Can be hit | Better handling |
| Short-lived connections | ❌ Less efficient | ✅ Optimized |

## Verify Locally

Before pushing, test your connection string locally:

```bash
# Set your actual connection string
export SUPABASE_DSN="postgresql://postgres.wviegnkfmkaqqsphghgm:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Test connection
psql "$SUPABASE_DSN" -c "SELECT version();"

# If that works, test seeding
psql "$SUPABASE_DSN" -f supabase/seed.sql
```

If the local test works, then updating the GitHub secret should fix the CI issue.

## Common Mistakes to Avoid

❌ **DON'T** leave `[YOUR_PASSWORD]` or `[YOUR-PASSWORD]` in the string  
✅ **DO** replace it with your actual database password

❌ **DON'T** use port 5432 for CI/CD  
✅ **DO** use port 6543 (connection pooler)

❌ **DON'T** copy the string with the placeholder  
✅ **DO** copy from the pooler tab and replace the password

## Troubleshooting

### "Password authentication failed"
- You used the wrong password
- Reset your database password in Supabase Dashboard
- Update the connection string with the new password

### "Could not translate host name"
- Check that you're using the correct host from the pooler tab
- The host format should be: `aws-0-[region].pooler.supabase.com`

### "Connection timed out"
- Your Supabase project might have IP restrictions
- Check Database settings for any IP allowlist/blocklist
- GitHub Actions IPs should be allowed

## Example of Correct Format

From your current DSN, the corrected version should be:

```
# Current (WRONG - has placeholder and wrong port):
postgresql://postgres:[YOUR_PASSWORD]@db.wviegnkfmkaqqsphghgm.supabase.co:5432/postgres

# Correct (with pooler and actual password):
postgresql://postgres.wviegnkfmkaqqsphghgm:YourRealPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Notice:
- `postgres.wviegnkfmkaqqsphghgm` (with dot, from pooler)
- Your actual password (not `[YOUR_PASSWORD]`)
- `aws-0-us-east-1.pooler.supabase.com` (pooler host, not `db.*.supabase.co`)
- Port `6543` (not `5432`)

