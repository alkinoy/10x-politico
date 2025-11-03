# Quick Start: CI E2E Tests Setup (Cloud Supabase)

## What Was Fixed

Your E2E tests were failing in GitHub Actions because:
1. ❌ Cloud Supabase project didn't have migrations applied
2. ❌ Email validation was rejecting test emails

Now the CI **applies migrations to your cloud Supabase** before running tests.

## Changes Summary

### Modified Files
- `.github/workflows/ci.yml` - Now applies migrations to cloud Supabase before tests
- `.gitignore` - Added `.supabase/` to ignore local files

## Required GitHub Secrets

You need **4 secrets** configured in GitHub Actions:

### 1. `SUPABASE_URL`
Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

### 2. `SUPABASE_ANON_KEY`
Your Supabase anonymous key

### 3. `SUPABASE_SERVICE_ROLE_KEY`
Your Supabase service role key

### 4. `SUPABASE_ACCESS_TOKEN` (NEW - Required)
A personal access token from Supabase to push migrations.

#### How to Get Your Supabase Access Token:

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token
5. Add it to GitHub:
   - Go to **Settings → Secrets and variables → Actions**
   - Click "New repository secret"
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: paste the token
   - Click "Add secret"

## What You Need to Do

### 1. Add the Access Token Secret

Follow the steps above to add `SUPABASE_ACCESS_TOKEN` to your GitHub secrets.

### 2. Fix Email Validation in Supabase

To allow test emails like `test-add@example.com`:

**Option A: Disable Email Confirmations (Recommended for test projects)**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Settings**
3. Find "Enable email confirmations"
4. Toggle it **OFF**

**Option B: Use Real Email Addresses**
Update your test files to use real email addresses:
```typescript
// Instead of: test-add@example.com
// Use: your-real-email+test1@gmail.com
```

### 3. Commit and Push Changes

```bash
git add .
git commit -m "fix: apply migrations to cloud Supabase in CI"
git push
```

### 4. Watch GitHub Actions

Go to your repository's Actions tab and verify:
- ✅ Links to Supabase project successfully
- ✅ Migrations apply to cloud database
- ✅ All E2E tests pass

## How It Works Now

```
┌─────────────────────────────────────────────┐
│  GitHub Actions Runner                      │
├─────────────────────────────────────────────┤
│  1. Install Supabase CLI                    │
│  2. Link to your cloud Supabase project     │
│  3. Push migrations to cloud database       │
│  4. Run E2E tests against cloud Supabase    │
└─────────────────────────────────────────────┘
```

## Benefits

✅ **Uses your cloud database**: Tests run against real Supabase project  
✅ **Auto-migration**: Migrations applied automatically before each test run  
✅ **Consistent schema**: Database schema always up to date

## ⚠️ Important Notes

1. **Migrations are applied to your cloud database** - If this is a production database, consider creating a separate Supabase project for CI/testing
2. **Test data persistence** - Tests may create data that persists between runs
3. **Email validation** - Make sure to disable email confirmations or use valid emails in tests

## Need Help?

See `GITHUB_E2E_TESTS_FIX.md` for detailed documentation and troubleshooting.

