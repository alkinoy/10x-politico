# Cloudflare Environment Variables Fix - Implementation Pattern

## Proven Issue (from debug results)

- ✅ Variables ARE set in Cloudflare: `cloudflare_runtime` shows all vars
- ❌ Variables NOT accessible via `import.meta.env` in Cloudflare
- ✅ Connection works when using `runtime.env`

## Implementation Pattern

### 1. In All API Routes (`src/pages/api/**/*.ts`)

**Add `locals` to parameters and extract runtime:**

```typescript
// BEFORE
export const GET: APIRoute = async ({ url, request }) => {

// AFTER  
export const GET: APIRoute = async ({ url, request, locals }) => {
  const runtime = locals.runtime?.env;
```

**Pass runtime to services and functions:**

```typescript
// Service instantiation
const service = new StatementService(runtime);

// Auth function
const userId = await getAuthenticatedUser(authHeader, runtime);

// Profile functions
const profile = await getAuthenticatedProfile(userId, runtime);
```

### 2. In Service Classes (`src/lib/services/*.ts`)

**Update constructor to accept runtime:**

```typescript
// BEFORE
constructor() {
  this.supabase = getSupabaseClient();
}

// AFTER
constructor(runtime?: Record<string, string>) {
  this.supabase = getSupabaseClient(runtime);
}
```

### 3. In Service Functions (`src/lib/services/profile-service.ts`)

**Add runtime parameter:**

```typescript
// BEFORE
export async function getAuthenticatedProfile(userId: string): Promise<ProfileDTO | null> {
  const supabase = getSupabaseClient();

// AFTER
export async function getAuthenticatedProfile(
  userId: string,
  runtime?: Record<string, string>
): Promise<ProfileDTO | null> {
  const supabase = getSupabaseClient(runtime);
```

### 4. In Auth Utility (`src/lib/utils/auth.ts`)

```typescript
// BEFORE
export async function getAuthenticatedUser(authHeader?: string | null): Promise<string | null> {
  const supabase = getSupabaseClientAnon();

// AFTER
export async function getAuthenticatedUser(
  authHeader?: string | null,
  runtime?: Record<string, string>
): Promise<string | null> {
  const supabase = getSupabaseClientAnon(runtime);
```

### 5. In Astro Pages (`src/pages/**/*.astro`)

```typescript
---
// Add this at the top of the frontmatter
const runtime = Astro.locals.runtime?.env;

// Then pass to any Supabase client calls
const supabase = getSupabaseClientAnon(runtime);
---
```

## Files That Need Updates

### Core Database (✅ Done)
- `src/db/client.ts`

### Auth Utility (Needs update)
- `src/lib/utils/auth.ts`

### Service Classes (Need update)
- `src/lib/services/statement-service.ts`
- `src/lib/services/politician-service.ts`
- `src/lib/services/party-service.ts`

### Service Functions (Need update)
- `src/lib/services/profile-service.ts`

### API Routes (Need update - 13 files)
- `src/pages/api/statements/index.ts`
- `src/pages/api/statements/[id].ts`
- `src/pages/api/politicians/index.ts`
- `src/pages/api/politicians/[id].ts`
- `src/pages/api/politicians/[id]/statements.ts`
- `src/pages/api/parties/index.ts`
- `src/pages/api/parties/[id].ts`
- `src/pages/api/profiles/me.ts`
- `src/pages/api/profiles/[id].ts`
- `src/pages/api/auth/signout.ts`

### Astro Pages (Need update)
- `src/pages/auth.astro` ✅ Done
- `src/pages/politicians/add.astro`
- `src/pages/statements/new.astro`
- `src/pages/statements/[id]/edit.astro`
- Other pages using Supabase clients

## Why This Works

1. **Cloudflare**: `locals.runtime.env` contains the environment variables → passed as `runtime` parameter
2. **Node.js Dev**: `locals.runtime` is undefined → `runtime` is undefined → falls back to `import.meta.env`
3. **Backward Compatible**: Works in both environments without breaking changes

