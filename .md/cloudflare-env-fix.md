# Cloudflare Environment Variables Fix

## Issue
The application was deployed successfully to Cloudflare Pages, but several pages were throwing errors:
- `/politicians/add` - Error: Missing SUPABASE_URL and SUPABASE_ANON_KEY
- `/politicians` - Error: Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- `/statements/new` - Error: Missing SUPABASE_URL and SUPABASE_ANON_KEY

The error appeared on the first load, but sometimes worked on retry (indicating a timing/initialization issue).

## Root Cause
In Cloudflare Workers/Pages, environment variables cannot be accessed via `import.meta.env` at runtime. Instead, they must be accessed through the Cloudflare runtime context: `Astro.locals.runtime?.env`.

The codebase was already designed to handle this correctly:
- `getSupabaseClient()` and `getSupabaseClientAnon()` accept an optional `runtime` parameter
- Service classes (PoliticianService, StatementService, etc.) accept an optional `runtime` parameter
- API routes correctly passed `locals.runtime?.env` to these functions

However, **Astro pages** (.astro files) were NOT passing the runtime parameter, causing them to fail when deployed to Cloudflare.

## Solution
Updated all Astro pages to pass `Astro.locals.runtime?.env` to:
1. Direct Supabase client calls: `getSupabaseClient(runtime)` and `getSupabaseClientAnon(runtime)`
2. Service instantiations: `new PoliticianService(runtime)`, `new StatementService(runtime)`

### Files Modified
1. **src/pages/politicians/add.astro**
   - Added `const runtime = Astro.locals.runtime?.env;`
   - Passed `runtime` to `getSupabaseClientAnon()` and `getSupabaseClient()`

2. **src/pages/politicians/index.astro**
   - Added `const runtime = Astro.locals.runtime?.env;`
   - Passed `runtime` to `new PoliticianService(runtime)`

3. **src/pages/politicians/[id].astro**
   - Added `const runtime = Astro.locals.runtime?.env;`
   - Passed `runtime` to `new PoliticianService(runtime)` and `new StatementService(runtime)`
   - Fixed `currentUserId` extraction (was using non-existent `Astro.locals.session`)

4. **src/pages/statements/new.astro**
   - Added `const runtime = Astro.locals.runtime?.env;`
   - Passed `runtime` to `getSupabaseClientAnon()` and `new PoliticianService(runtime)`

5. **src/pages/statements/[id]/edit.astro**
   - Added `const runtime = Astro.locals.runtime?.env;`
   - Passed `runtime` to `getSupabaseClientAnon()` and `new StatementService(runtime)`

6. **src/pages/api/auth/signout.ts**
   - Added `const runtime = locals.runtime?.env;`
   - Passed `runtime` to `getSupabaseClientAnon()`

## Why This Works
### Development (Node.js)
- `import.meta.env` is available with all environment variables
- `Astro.locals.runtime?.env` is undefined
- Functions fall back to `import.meta.env` when `runtime` is undefined
- Everything works seamlessly

### Production (Cloudflare Workers)
- `import.meta.env` doesn't contain server-side secrets at runtime
- `Astro.locals.runtime?.env` contains all environment variables
- Functions use the runtime parameter to access environment variables
- Everything works correctly

## Environment Variables Setup
The following environment variables are set in both GitHub Actions and Cloudflare Pages:

### GitHub Actions (for build)
- `PUBLIC_SUPABASE_URL` - Embedded in client bundle
- `PUBLIC_SUPABASE_ANON_KEY` - Embedded in client bundle
- `SUPABASE_URL` - Used server-side during build
- `SUPABASE_ANON_KEY` - Used server-side during build
- `SUPABASE_SERVICE_ROLE_KEY` - Used server-side during build
- `OPENROUTER_API_KEY` - Used for AI summaries
- `USE_AI_SUMMARY` - Feature flag

### Cloudflare Pages (for runtime)
- `PUBLIC_SUPABASE_URL` - Available client-side
- `PUBLIC_SUPABASE_ANON_KEY` - Available client-side
- `SUPABASE_URL` - Available server-side via runtime
- `SUPABASE_ANON_KEY` - Available server-side via runtime
- `SUPABASE_SERVICE_ROLE_KEY` - Available server-side via runtime
- `OPENROUTER_API_KEY` - Available server-side via runtime
- `USE_AI_SUMMARY` - Feature flag

## Testing
After this fix:
1. Build succeeds locally with `npm run build`
2. All linter checks pass
3. Deployment to Cloudflare Pages should work without errors
4. All pages should load correctly on first try

## Key Takeaway
**Always pass `Astro.locals.runtime?.env` to Supabase client functions and services in Astro pages when building for Cloudflare Workers/Pages.** This pattern is already used correctly in API routes and should be consistently applied across all server-side code.

