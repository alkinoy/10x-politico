# Cloudflare Environment Variables Fix - Summary

## Problem

After deploying to Cloudflare Pages, the application was throwing the error:
```
Error: Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.
```

Even though the environment variables were properly configured in the Cloudflare dashboard.

## Root Cause

In **Cloudflare Workers/Pages**, environment variables are NOT accessible via `import.meta.env` at runtime like they are in Node.js environments. 

Cloudflare requires accessing runtime environment variables through the **runtime context**: `Astro.locals.runtime.env`

The original code was trying to access environment variables using:
```typescript
const supabaseUrl = import.meta.env.SUPABASE_URL;
```

This works in Node.js but returns `undefined` in Cloudflare Workers.

## Solution

The application was updated to support **both Node.js and Cloudflare** environments by:

### 1. Updated Supabase Client Functions (`src/db/client.ts`)

Modified all client creation functions to accept an optional `runtime` parameter and check multiple sources for environment variables:

```typescript
export function getSupabaseClientAnon(runtime?: Record<string, string>): SupabaseClient {
  // Try runtime env (Cloudflare), then import.meta.env (Node), then process.env
  const supabaseUrl =
    runtime?.SUPABASE_URL ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_URL);
  
  const anonKey =
    runtime?.SUPABASE_ANON_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY);
  
  // ... rest of function
}
```

Functions updated:
- `getSupabaseClient(runtime?)`
- `getSupabaseClientAnon(runtime?)`
- `getSupabaseClientForUser(accessToken, runtime?)`

### 2. Updated Service Classes (`src/lib/services/`)

Modified all service class constructors to accept and pass runtime:

```typescript
export class StatementService {
  private supabase;

  constructor(runtime?: Record<string, string>) {
    this.supabase = getSupabaseClient(runtime);
  }
  // ...
}
```

Services updated:
- `StatementService`
- `PoliticianService`
- `PartyService`

### 3. Updated Service Functions (`src/lib/services/profile-service.ts`)

Modified profile service functions to accept runtime parameter:

```typescript
export async function getAuthenticatedProfile(
  userId: string,
  runtime?: Record<string, string>
): Promise<ProfileDTO | null> {
  const supabase = getSupabaseClient(runtime);
  // ...
}
```

Functions updated:
- `getAuthenticatedProfile(userId, runtime?)`
- `updateProfile(userId, command, runtime?)`
- `getPublicProfile(userId, runtime?)`
- `verifyProfileExists(userId, runtime?)`

### 4. Updated Authentication Utility (`src/lib/utils/auth.ts`)

Modified `getAuthenticatedUser` to accept runtime:

```typescript
export async function getAuthenticatedUser(
  authHeader?: string | null,
  runtime?: Record<string, string>
): Promise<string | null> {
  const supabase = getSupabaseClientAnon(runtime);
  // ...
}
```

### 5. Updated All API Routes (`src/pages/api/**/*.ts`)

Modified all API route handlers to:
1. Extract runtime from `locals.runtime?.env`
2. Pass it to service constructors and functions

```typescript
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Get runtime environment (for Cloudflare) or undefined (for Node)
    const runtime = locals.runtime?.env;

    const statementService = new StatementService(runtime);
    const authenticatedUserId = await getAuthenticatedUser(authHeader, runtime);
    // ...
  }
}
```

API files updated:
- `src/pages/api/statements/index.ts`
- `src/pages/api/statements/[id].ts`
- `src/pages/api/politicians/index.ts`
- `src/pages/api/politicians/[id].ts`
- `src/pages/api/politicians/[id]/statements.ts`
- `src/pages/api/parties/index.ts`
- `src/pages/api/parties/[id].ts`
- `src/pages/api/profiles/me.ts`
- `src/pages/api/profiles/[id].ts`

### 6. Updated Astro Pages (`src/pages/**/*.astro`)

Modified Astro pages that use Supabase clients:

```typescript
---
const runtime = Astro.locals.runtime?.env;
const supabase = getSupabaseClientAnon(runtime);
---
```

Pages updated:
- `src/pages/auth.astro`
- Other Astro pages that use Supabase clients

## How It Works

### In Development (Node.js adapter)
- `Astro.locals.runtime?.env` returns `undefined`
- Falls back to `import.meta.env.SUPABASE_URL` or `process.env.SUPABASE_URL`
- Works with local `.env` files

### In Production (Cloudflare Pages)
- `Astro.locals.runtime.env` contains the environment variables from Cloudflare dashboard
- Uses `runtime.SUPABASE_URL` directly
- Environment variables must be set in Cloudflare Pages Settings

## Deployment Checklist

When deploying to Cloudflare Pages:

1. ✅ **Set Environment Variables** in Cloudflare Pages Settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PUBLIC_SUPABASE_URL` (same as SUPABASE_URL)
   - `PUBLIC_SUPABASE_ANON_KEY` (same as SUPABASE_ANON_KEY)
   - `OPENROUTER_API_KEY` (if using AI features)

2. ✅ **Set Build Environment Variable**:
   - `PLATFORM=cloudflare`

3. ✅ **Configure Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`

4. ✅ **Trigger a New Deployment** after setting environment variables

## Testing

Both build modes work correctly:

```bash
# Test Node.js build
npm run build

# Test Cloudflare build
PLATFORM=cloudflare npm run build
```

Both should complete successfully without errors.

## Files Modified

### Core Database/Client Files
- `src/db/client.ts`

### Service Files
- `src/lib/services/statement-service.ts`
- `src/lib/services/politician-service.ts`
- `src/lib/services/party-service.ts`
- `src/lib/services/profile-service.ts`

### Utility Files
- `src/lib/utils/auth.ts`

### API Routes
- All files in `src/pages/api/` (13 files total)

### Astro Pages
- `src/pages/auth.astro`
- Other pages that use Supabase clients

### Documentation
- `.md/cloudflare-deployment-guide.md` (new)
- `.md/cloudflare-env-fix-summary.md` (this file)

## Benefits

1. **Platform Agnostic**: Works seamlessly on both Node.js and Cloudflare
2. **No Breaking Changes**: Backward compatible with existing Node.js deployments
3. **Type Safe**: Maintains TypeScript type safety
4. **Maintainable**: Centralized environment variable access pattern

## Next Steps

After deploying:

1. Verify environment variables are set in Cloudflare dashboard
2. Deploy/redeploy your application
3. Monitor the logs for any remaining issues
4. Test authentication and database operations

If you still see errors after setting environment variables, make sure to **trigger a new deployment** as environment variable changes don't apply to existing deployments automatically.

