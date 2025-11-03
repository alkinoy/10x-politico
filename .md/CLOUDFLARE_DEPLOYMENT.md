# Cloudflare Pages Deployment Setup

This document describes the Cloudflare Pages deployment setup for SpeechKarma.

## Overview

The project now supports deployment to Cloudflare Pages using GitHub Actions. The deployment is triggered automatically when commits are pushed to the `master` branch.

## Changes Made

### 1. Astro Configuration (`astro.config.mjs`)

Updated the Astro configuration to support both Node.js (local development) and Cloudflare adapters:

- Added `@astrojs/cloudflare` import
- Implemented `getAdapter()` function that switches between adapters based on the `PLATFORM` environment variable
- When `PLATFORM=cloudflare`, the Cloudflare adapter is used
- Otherwise, the Node.js adapter is used (default for local development)

### 2. GitHub Actions Workflow (`master.yml`)

Created a new workflow for deploying to Cloudflare Pages:

**Triggers:**
- Pushes to the `master` branch

**Jobs:**
1. **Lint**: Runs ESLint to check code quality
2. **Test**: Runs unit tests with Vitest
3. **Build and Deploy**: Builds the application and deploys to Cloudflare Pages

**Key Features:**
- Uses latest GitHub Action versions (v5 for checkout, v6 for setup-node)
- Uses `cloudflare/wrangler-action@v3` for deployment (the deprecated `pages-action` is not used)
- Passes all necessary environment variables (Supabase, OpenRouter, etc.)
- Sets `PLATFORM=cloudflare` to use the Cloudflare adapter during build
- No E2E tests in deployment workflow (runs faster)

### 3. Updated CI Workflow (`ci.yml`)

Updated all GitHub Actions to their latest major versions:
- `actions/checkout@v4` → `v5`
- `actions/setup-node@v4` → `v6`
- `actions/upload-artifact@v4` → `v5`
- `actions/download-artifact@v4` → `v6`

## Required Secrets

To enable Cloudflare Pages deployment, add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Cloudflare Secrets

1. **`CLOUDFLARE_API_TOKEN`** (required)
   - Generate in Cloudflare Dashboard: My Profile → API Tokens → Create Token
   - Use "Custom Token" with permission: **Account → Cloudflare Pages → Edit**
   - This token is used to deploy to Cloudflare Pages

2. **`CLOUDFLARE_ACCOUNT_ID`** (required)
   - Find in Cloudflare Dashboard: Select your zone → Overview → API section (right sidebar)
   - Or extract from Pages URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/pages`

3. **`CLOUDFLARE_PROJECT_NAME`** (required)
   - The name of your Cloudflare Pages project
   - This should match the project name you created in Cloudflare Pages

### Application Secrets

These secrets should already be configured for your application:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `USE_AI_SUMMARY` (optional, defaults to false if not set)
- `OPENROUTER_API_KEY` (optional, only needed if USE_AI_SUMMARY is true)

## How It Works

### Deployment Flow

1. Developer pushes code to the `master` branch
2. GitHub Actions workflow (`master.yml`) is triggered
3. Workflow runs lint and unit tests
4. If tests pass, the application is built with `PLATFORM=cloudflare`
5. Astro uses the Cloudflare adapter for the build
6. The `dist` folder is deployed to Cloudflare Pages using Wrangler
7. Cloudflare Pages automatically serves the application

### Local Development

Local development continues to use the Node.js adapter (no changes needed):

```bash
npm run dev      # Uses Node.js adapter (default)
npm run build    # Uses Node.js adapter (default)
npm run preview  # Preview with Node.js
```

### Testing Cloudflare Build Locally

To test the Cloudflare build locally:

```bash
PLATFORM=cloudflare npm run build
```

This will build the application using the Cloudflare adapter.

## Cloudflare Pages Configuration

### Environment Variables in Cloudflare Dashboard

Make sure to configure the following environment variables in your Cloudflare Pages project (Dashboard → Pages → Your Project → Settings → Environment variables):

**Production:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `USE_AI_SUMMARY` (optional)
- `OPENROUTER_API_KEY` (optional)

**Note:** Cloudflare Pages will use the environment variables from the dashboard when serving the application. The values passed during build are baked into the static assets.

## Troubleshooting

### Build Fails with "Module not found"

Make sure all dependencies are installed:
```bash
npm ci
```

### Deployment Fails with "Invalid API token"

1. Verify `CLOUDFLARE_API_TOKEN` secret is set correctly
2. Ensure the API token has "Cloudflare Pages - Edit" permission
3. Check that the token hasn't expired

### Application Returns 500 Errors After Deployment

1. Check Cloudflare Pages logs in the dashboard
2. Verify environment variables are set correctly in Cloudflare Pages settings
3. Ensure Supabase credentials are valid

### Pages Shows Old Version After Deployment

Cloudflare Pages uses aggressive caching. Try:
1. Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check the deployment ID in Cloudflare Pages dashboard to confirm new version is live
3. Clear Cloudflare cache if necessary

## References

- [Astro Cloudflare Adapter Documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

