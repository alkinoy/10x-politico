# GitHub Actions Setup Guide

This guide explains how to set up the required secrets for GitHub Actions CI/CD pipeline.

## Overview

The CI/CD pipeline includes:
- **Linting**: Code quality checks
- **Unit Tests**: Running vitest tests
- **Build**: Building the Astro application
- **E2E Tests**: Running Playwright end-to-end tests
- **Health Check**: Verifying the application starts correctly

## Required GitHub Secrets

For E2E tests to run successfully in GitHub Actions, you need to configure the following secrets in your GitHub repository.

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### Required Secrets

#### 1. `SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`

#### 2. `SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public key for client-side operations
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → anon public
- **Security**: Safe to use in client-side code
- **Note**: This is the key used for authentication and RLS-protected operations

#### 3. `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Supabase service role key for server-side operations
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → service_role
- **Security**: ⚠️ **CRITICAL** - This key bypasses Row Level Security (RLS). Keep it secret!
- **Note**: Only used in server-side code and tests

## Environment Configuration

### For Testing

The E2E test environment automatically configures:

```yaml
USE_AI_SUMMARY: false              # Disables AI features during testing
OPENROUTER_API_KEY: dummy-key-not-used-in-tests  # Dummy value since AI is disabled
```

These are hardcoded in the workflow and don't require secrets since:
- AI summaries are disabled during testing (`USE_AI_SUMMARY=false`)
- The OpenRouter API key is not used when AI is disabled

## Test Database Strategy

The E2E tests use your **test Supabase project** with proper data isolation:

1. **Before tests**: Clean up test data
2. **During tests**: Create isolated test records with known UUIDs
3. **After tests**: Clean up test data

### Test Supabase Project Setup

You should use a **separate Supabase project for testing** (not your production database):

1. Create a new Supabase project (e.g., "politico-test")
2. Run the same migrations as your production database
3. Use the credentials from this test project in GitHub secrets
4. The test helpers will automatically manage test data isolation

## Verifying Setup

After configuring the secrets, the next push or pull request will automatically:

1. ✅ Run linting checks
2. ✅ Execute unit tests
3. ✅ Build the application
4. ✅ Run E2E tests with Playwright
5. ✅ Verify health endpoints

## Troubleshooting

### E2E Tests Failing with "SUPABASE_URL and SUPABASE_ANON_KEY must be set"

**Cause**: GitHub secrets are not properly configured

**Solution**:
1. Verify all three Supabase secrets are set in GitHub
2. Check that secret names exactly match (case-sensitive):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Ensure the E2E test job uses the `integration` environment (already configured)

### E2E Tests Failing with Database Errors

**Cause**: Test Supabase project not properly set up or using production database

**Solution**:
1. Create a dedicated test Supabase project
2. Run migrations on the test project:
   ```bash
   # Apply migrations to your test project
   npx supabase db push --db-url "postgresql://..."
   ```
3. Update GitHub secrets with test project credentials

### Build Job Failing

**Cause**: The build job doesn't need secrets but may fail if code issues exist

**Solution**:
1. Run `npm run build` locally to identify issues
2. Fix any TypeScript or build errors
3. Commit and push the fixes

## Security Best Practices

1. ✅ **Use separate Supabase projects** for development, testing, and production
2. ✅ **Never commit** `.env`, `.env.test`, or `.env.production` files
3. ✅ **Rotate secrets regularly**, especially if accidentally exposed
4. ✅ **Limit access** to GitHub secrets to repository administrators only
5. ✅ **Use environment protection rules** for production deployments

## Local Development

For local development and testing, create a `.env.test` file based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env.test

# Edit .env.test with your test Supabase credentials
# Set USE_AI_SUMMARY=false for testing
```

This file is git-ignored and should never be committed to version control.

## References

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Playwright Test Documentation](https://playwright.dev/docs/test-configuration)

