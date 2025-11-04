# Environment Variables Reference

This document lists all environment variables used in the SpeechKarma application, organized by context and usage.

## Overview

The application uses different environment variable prefixes for different contexts:
- **No prefix** - Server-side only (API routes, SSR)
- **PUBLIC_** prefix - Client-side accessible (browser)

## Required Environment Variables

### Supabase Configuration

#### Server-side Variables
These variables are used in API routes and server-side rendering:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | ✅ Yes | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypass RLS) | ✅ Yes | `eyJhbGc...` |

**⚠️ Security Note:** `SUPABASE_SERVICE_ROLE_KEY` grants admin access. Never expose it to client-side code.

#### Client-side Variables
These variables are exposed to the browser and must use the `PUBLIC_` prefix:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) | ✅ Yes | `https://xxxxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) | ✅ Yes | `eyJhbGc...` |

**Note:** Typically, `PUBLIC_SUPABASE_URL` = `SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` = `SUPABASE_ANON_KEY`

### AI Integration (Optional)

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `USE_AI_SUMMARY` | Enable AI-generated summaries | ❌ No | `false` | `true` or `false` |
| `OPENROUTER_API_KEY` | OpenRouter API key | ⚠️ If USE_AI_SUMMARY=true | - | `sk-or-v1-...` |

### Build Configuration

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PLATFORM` | Target platform for build | ❌ No | `node` | `cloudflare` or `node` |

**Note:** This variable is automatically set in CI/CD workflows:
- `cloudflare` - for Cloudflare Pages deployment
- `node` - for Node.js server (local development)

### Optional Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `SITE_URL` | Site URL for OpenRouter HTTP-Referer | ❌ No | `http://localhost:4321` | `https://speechkarma.com` |

## Configuration by Environment

### Local Development

Create a `.env` file in the project root:

```bash
# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Client-side Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# AI Features (optional)
USE_AI_SUMMARY=false
OPENROUTER_API_KEY=sk-or-v1-...

# Build platform (defaults to node for local)
PLATFORM=node

# Site URL (optional)
SITE_URL=http://localhost:4321
```

**Start the development server:**
```bash
npm run dev
```

### GitHub Actions (CI/CD)

Required **GitHub Secrets** (Settings > Secrets and variables > Actions):

#### Cloudflare Deployment Secrets
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Cloudflare Pages project name

#### Application Secrets
- `SUPABASE_URL` - Used for both server and client (PUBLIC_SUPABASE_URL)
- `SUPABASE_ANON_KEY` - Used for both server and client (PUBLIC_SUPABASE_ANON_KEY)
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- `USE_AI_SUMMARY` - (optional) Set to `true` or `false`
- `OPENROUTER_API_KEY` - (optional) Required if USE_AI_SUMMARY is true

**Workflow environment variables are set automatically in `.github/workflows/master.yml`**

### Cloudflare Pages

Set environment variables in Cloudflare Dashboard:
1. Go to Workers & Pages > Your Project
2. Settings > Environment variables
3. Add variables for **Production** environment:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
USE_AI_SUMMARY=true
OPENROUTER_API_KEY=sk-or-v1-...
```

**Note:** Build-time variables (like `PLATFORM`) are set by the GitHub workflow and don't need to be configured in Cloudflare Pages.

## Variable Usage by File

### `src/db/client.ts`
Uses server-side Supabase variables:
- `import.meta.env.SUPABASE_URL`
- `import.meta.env.SUPABASE_ANON_KEY`
- `import.meta.env.SUPABASE_SERVICE_ROLE_KEY`

### `src/lib/supabase-browser.ts`
Uses client-side Supabase variables:
- `import.meta.env.PUBLIC_SUPABASE_URL`
- `import.meta.env.PUBLIC_SUPABASE_ANON_KEY`

### `src/lib/services/openrouter-service.ts`
Uses OpenRouter variables:
- `import.meta.env.OPENROUTER_API_KEY`
- `import.meta.env.SITE_URL` (optional)

### `astro.config.mjs`
Uses build configuration:
- `process.env.PLATFORM`

## Security Best Practices

### ✅ Do's
- ✅ Store secrets in `.env` file (never commit to git)
- ✅ Use `.env.example` as template (no real values)
- ✅ Use `PUBLIC_` prefix for client-accessible variables
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- ✅ Rotate API keys regularly
- ✅ Use GitHub Secrets for CI/CD
- ✅ Set environment variables in Cloudflare Pages settings

### ❌ Don'ts
- ❌ Never commit `.env` files to git
- ❌ Never expose service role keys to client
- ❌ Don't hardcode secrets in code
- ❌ Don't share secrets in public channels
- ❌ Don't reuse the same keys across environments

## Validation

### Check Missing Variables

The application will throw errors if required variables are missing:

```typescript
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
  );
}
```

### Test Configuration

**Local development:**
```bash
npm run dev
# Visit http://localhost:4321 and check browser console for errors
```

**Production build:**
```bash
PLATFORM=cloudflare npm run build
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
**Cause:** Required Supabase variables are not set
**Solution:** 
- Check `.env` file exists and has correct values
- Verify variable names match exactly (case-sensitive)
- Restart dev server after adding variables

### Error: "OPENROUTER_API_KEY environment variable is not set"
**Cause:** AI features enabled but API key missing
**Solution:**
- Set `USE_AI_SUMMARY=false` to disable AI features
- Or add `OPENROUTER_API_KEY` to environment variables

### Client-side error: "PUBLIC_SUPABASE_URL is not defined"
**Cause:** Missing PUBLIC_ prefixed variables
**Solution:**
- Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- Rebuild the application (environment variables are baked in at build time)

### Build fails with "Cannot find module '@astrojs/cloudflare'"
**Cause:** Wrong PLATFORM setting or missing dependency
**Solution:**
- Verify `@astrojs/cloudflare` is in dependencies
- For local dev, use `PLATFORM=node` or omit it
- For Cloudflare deployment, use `PLATFORM=cloudflare`

## References

- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Supabase API Settings](https://supabase.com/docs/guides/api)
- [OpenRouter API Keys](https://openrouter.ai/keys)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

