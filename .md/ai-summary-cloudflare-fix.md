# AI Summary Feature - Cloudflare Fix

## Issue
AI summaries were not being generated on Cloudflare Pages deployment, even though the `USE_AI_SUMMARY` environment variable was set correctly in both GitHub Actions and Cloudflare.

## Root Cause
The issue had two main problems:

### 1. GitHub Actions Configuration
- The workflow was trying to access `USE_AI_SUMMARY` as a **secret** using `${{ secrets.USE_AI_SUMMARY }}`
- But it was configured as an environment **variable**, not a secret
- Environment variables must be accessed using `${{ vars.USE_AI_SUMMARY }}`

### 2. Cloudflare Runtime Environment Access
- In Cloudflare Workers/Pages, environment variables are NOT available through `process.env`
- They must be accessed through the **runtime context**: `runtime.USE_AI_SUMMARY`
- The `StatementService` was not storing or using the runtime context
- The `OpenRouterService` was also not using the runtime context for the API key

## Changes Made

### 1. Fixed GitHub Actions Workflow (`.github/workflows/master.yml`)
```yaml
# Before
USE_AI_SUMMARY: ${{ secrets.USE_AI_SUMMARY }}

# After  
USE_AI_SUMMARY: ${{ vars.USE_AI_SUMMARY }}
```

Also added verification logging:
```yaml
echo "USE_AI_SUMMARY is set: $([ -n "$USE_AI_SUMMARY" ] && echo 'yes' || echo 'no')"
echo "USE_AI_SUMMARY value: ${USE_AI_SUMMARY}"
echo "OPENROUTER_API_KEY is set: $([ -n "$OPENROUTER_API_KEY" ] && echo 'yes' || echo 'no')"
```

### 2. Updated StatementService (`src/lib/services/statement-service.ts`)

**Stored runtime context:**
```typescript
export class StatementService {
  private supabase;
  private runtime?: Record<string, string>;

  constructor(runtime?: Record<string, string>) {
    this.runtime = runtime; // Store for later use
    this.supabase = getSupabaseClient(runtime);
  }
}
```

**Fixed environment variable access:**
```typescript
private isAiSummaryEnabled(): boolean {
  // Check runtime first (Cloudflare), then fallback to import.meta.env (local dev)
  const useAiSummary = 
    this.runtime?.USE_AI_SUMMARY || 
    (typeof import.meta !== "undefined" && import.meta.env?.USE_AI_SUMMARY) ||
    (typeof process !== "undefined" && process.env?.USE_AI_SUMMARY);
  
  return useAiSummary === "true";
}
```

**Added comprehensive logging:**
- When checking if AI summary is enabled
- When generating AI summary
- When appending summary to statement
- When creating statement in database

### 3. Updated OpenRouterService (`src/lib/services/openrouter-service.ts`)

**Added runtime parameter to API key resolution:**
```typescript
function getApiKey(providedKey?: string, runtime?: Record<string, string>): string {
  const apiKey =
    providedKey ||
    runtime?.OPENROUTER_API_KEY ||  // Check runtime first
    (typeof import.meta !== "undefined" && import.meta.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY);

  if (!apiKey) {
    throw new OpenRouterAuthError("OPENROUTER_API_KEY environment variable is not set");
  }

  return apiKey;
}
```

**Updated function signatures to pass runtime through:**
- `makeApiRequest()` - now accepts runtime parameter
- `chatCompletion()` - passes runtime from config to makeApiRequest

### 4. Updated Types (`src/types.ts`)

Added runtime to ChatCompletionConfig:
```typescript
export interface ChatCompletionConfig {
  model: string;
  systemMessage?: string;
  userMessage: string | ChatMessage[];
  responseFormat?: ResponseFormat;
  parameters?: ModelParameters;
  runtime?: Record<string, string>; // NEW
}
```

## Logging Added

When you create a new statement on Cloudflare, you should now see these logs in the Cloudflare dashboard:

### 1. Statement Creation Start
```
📝 Creating new statement...
👤 User ID: <user-id>
🏛️ Politician ID: <politician-id>
```

### 2. AI Summary Feature Check
```
🤖 Attempting to generate AI summary...
📝 Starting AI summary generation...
🔍 AI Summary Feature Check: {
  runtimeValue: 'true',
  importMetaValue: 'N/A',
  processEnvValue: 'N/A',
  finalValue: 'true',
  isEnabled: true
}
```

### 3. If AI Summary is Enabled
```
✅ AI Summary is enabled, proceeding with generation
🤖 Calling OpenRouter API to generate summary...
📄 Statement text length: 150 characters
🔑 OpenRouter API Key Check: {
  hasProvidedKey: false,
  hasRuntimeKey: true,
  hasImportMetaKey: false,
  hasProcessEnvKey: false,
  finalKeyFound: true
}
🚀 OpenRouter: Making API request...
✅ OpenRouter: API request successful
✅ AI Summary generated successfully: <summary-text>
✅ AI summary generated, appending to statement
📝 Summary: <summary-text>
📄 Final statement length: 250 characters
```

### 4. If AI Summary is Disabled
```
❌ AI Summary is disabled
ℹ️ No AI summary generated, using original statement text
```

### 5. Statement Saved
```
💾 Inserting statement into database...
✅ Statement created successfully, ID: <statement-id>
```

## How to View Cloudflare Logs

1. Go to your Cloudflare Dashboard
2. Navigate to **Pages** → **Your Project** (speech-karma)
3. Click on your latest deployment
4. Click on **Functions** tab
5. Click on **Real-time logs** or **View logs**
6. Create a new statement to see the logs appear in real-time

Alternatively, use the Cloudflare CLI:
```bash
npx wrangler pages deployment tail
```

## Testing the Fix

1. **Commit and push the changes**
2. **Wait for GitHub Actions to complete the build**
   - Check the build logs to confirm `USE_AI_SUMMARY value: true`
3. **Create a new statement on the deployed site**
4. **Check Cloudflare logs** for the emoji logging sequences above
5. **View the created statement** - it should now include the AI summary at the end

## Expected Result

When viewing a newly created statement, you should see:

```
<Original statement text>

---

📝 AI Summary: <AI-generated summary of the statement>
```

## Troubleshooting

If AI summaries still don't appear:

### Check 1: Verify environment variables in Cloudflare
1. Go to Cloudflare Dashboard → Pages → Your Project → Settings → Environment variables
2. Confirm `USE_AI_SUMMARY=true` exists
3. Confirm `OPENROUTER_API_KEY` has a valid value

### Check 2: Check the logs for errors
Look for these error indicators:
- `❌ AI Summary is disabled` - means the environment variable is not being read
- `❌ Failed to generate AI summary` - means the OpenRouter API call failed
- `OPENROUTER_API_KEY environment variable is not set` - means the API key is missing

### Check 3: Verify the build included the changes
Check the GitHub Actions build log for the updated echo statements showing `USE_AI_SUMMARY value: true`

## Environment Variables Summary

### GitHub (for build time)
- Variable: `USE_AI_SUMMARY` = `true` ✅

### Cloudflare (for runtime)
- Plaintext: `USE_AI_SUMMARY` = `true` ✅
- Secret: `OPENROUTER_API_KEY` = `<your-key>` ✅

Both must be set for the feature to work!

