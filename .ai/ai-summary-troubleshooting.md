# AI Summary Feature - Troubleshooting Guide

## Issue: AI Summaries Not Appearing

If you're not seeing AI summaries on newly created statements, follow these debugging steps:

---

## ✅ Step 1: Check Environment Variable

The feature must be explicitly enabled in your `.env` file.

### Create or Edit `.env` file:

```bash
# In the project root: /home/ot/priv/10dev/politico/src/
nano .env
```

### Add this line:

```bash
USE_AI_SUMMARY=true
```

**Important Notes:**
- Value must be exactly `"true"` (lowercase)
- `USE_AI_SUMMARY=false` or missing = feature disabled
- `USE_AI_SUMMARY=TRUE` (uppercase) = won't work

### Verify Your `.env` File:

```bash
cat .env | grep USE_AI_SUMMARY
```

Should output:
```
USE_AI_SUMMARY=true
```

---

## ✅ Step 2: Verify OpenRouter API Key

The AI summary feature requires a valid OpenRouter API key.

### Check if key exists:

```bash
cat .env | grep OPENROUTER_API_KEY
```

Should output something like:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### Get an API Key (if missing):

1. Go to https://openrouter.ai/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add to `.env`:
   ```bash
   OPENROUTER_API_KEY=your_actual_key_here
   ```

---

## ✅ Step 3: Restart Development Server

**Critical:** Environment variables are loaded at startup. You MUST restart:

```bash
# Stop the server (Ctrl+C if running)

# Then restart:
npm run dev
```

---

## ✅ Step 4: Check Server Logs

I've added debugging logs. When creating a statement, watch the terminal for:

### Expected Output (Feature Enabled):

```
📝 Creating statement - checking for AI summary...
🔍 AI Summary Feature Check: { USE_AI_SUMMARY: 'true', enabled: true }
🤖 Generating AI summary for statement...
📡 Calling OpenRouter API...
✅ AI Summary generated: The politician proposes...
✨ Appending AI summary to statement
```

### If Feature is Disabled:

```
📝 Creating statement - checking for AI summary...
🔍 AI Summary Feature Check: { USE_AI_SUMMARY: undefined, enabled: false }
⚠️ AI Summary disabled - skipping generation
ℹ️ No AI summary generated - using original text only
```

### If API Call Fails:

```
📝 Creating statement - checking for AI summary...
🔍 AI Summary Feature Check: { USE_AI_SUMMARY: 'true', enabled: true }
🤖 Generating AI summary for statement...
📡 Calling OpenRouter API...
❌ Failed to generate AI summary: [error details]
ℹ️ No AI summary generated - using original text only
```

---

## ✅ Step 5: Test Statement Creation

### Using the UI:

1. Navigate to "New Statement" page
2. Fill in the form with test data
3. Submit the form
4. Check the created statement

### Using cURL:

```bash
# Get your JWT token first (login)
TOKEN="your_jwt_token_here"

# Create a test statement
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "politician_id": "existing-politician-uuid",
    "statement_text": "I propose we increase renewable energy funding by 40 percent to combat climate change.",
    "statement_timestamp": "2025-10-30T10:00:00Z"
  }'
```

### Expected Response (with AI summary):

```json
{
  "data": {
    "id": "...",
    "statement_text": "I propose we increase renewable energy funding by 40 percent to combat climate change.\n\n---\n\n📝 AI Summary: The politician advocates for a 40% increase in renewable energy funding to address climate change.",
    ...
  }
}
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "USE_AI_SUMMARY is undefined"

**Problem:** Environment variable not set or not loaded

**Solution:**
1. Check `.env` file exists in project root
2. Verify line: `USE_AI_SUMMARY=true`
3. Restart dev server
4. Check Astro is loading `.env` (no `.env.local` conflicts)

### Issue 2: "OpenRouter API error: 401"

**Problem:** Invalid or missing API key

**Solution:**
1. Verify `OPENROUTER_API_KEY` in `.env`
2. Test key at https://openrouter.ai/
3. Check key has credits/quota remaining
4. Regenerate key if needed

### Issue 3: "OpenRouter API error: 429"

**Problem:** Rate limit exceeded

**Solution:**
1. Wait a few minutes
2. Check OpenRouter dashboard for limits
3. Consider upgrading plan if hitting limits often

### Issue 4: Feature enabled but no summary

**Problem:** API call succeeds but summary not appended

**Possible Causes:**
1. Old statements (feature only works for NEW statements)
2. Error in `appendSummaryToStatement()` logic
3. Check server logs for "✨ Appending AI summary" message

**Debug:**
```bash
# Check what's being returned
console.log("Final text:", finalStatementText);
```

### Issue 5: Summary generated but looks wrong

**Problem:** AI summary quality issues

**Solution:**
- Adjust temperature (currently 0.3)
- Modify system prompt in `generateAiSummary()`
- Change model (currently `gpt-4o-mini`)
- Increase max_tokens (currently 150)

---

## 🧪 Manual Testing Checklist

- [ ] `.env` file exists
- [ ] `USE_AI_SUMMARY=true` is set
- [ ] `OPENROUTER_API_KEY` is set and valid
- [ ] Dev server restarted after changes
- [ ] Created NEW statement (not viewing old ones)
- [ ] Checked server console for debug logs
- [ ] Verified statement in database has summary appended
- [ ] Confirmed separator (`---`) and emoji (📝) present

---

## 📊 Verify in Database

If statement created successfully, check the database directly:

```sql
-- Connect to your Supabase database
SELECT 
  id,
  statement_text,
  created_at
FROM statements
ORDER BY created_at DESC
LIMIT 1;
```

The `statement_text` field should contain:
```
Original statement text

---

📝 AI Summary: [summary text]
```

---

## 🔧 Quick Fix Commands

```bash
# 1. Check current environment
cat .env

# 2. Add AI summary feature (if missing)
echo "USE_AI_SUMMARY=true" >> .env

# 3. Restart dev server
npm run dev

# 4. Watch logs during statement creation
# (logs will appear in terminal automatically)

# 5. Test with a simple statement
curl -X POST http://localhost:4321/api/statements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"politician_id":"UUID","statement_text":"Test statement for AI summary","statement_timestamp":"2025-10-30T10:00:00Z"}'
```

---

## 📞 Still Not Working?

If you've followed all steps and it's still not working:

1. **Share the debug output** - Copy console logs when creating statement
2. **Check `.env` file** - Confirm exact contents (hide API key)
3. **Verify API key** - Test at https://openrouter.ai/ 
4. **Check database** - Confirm statements are being created
5. **Browser cache** - Try incognito/private window
6. **Check Astro version** - Ensure env variables supported

---

## ✅ Expected Behavior Summary

**When Working Correctly:**

1. User creates new statement via UI or API
2. Server logs show: "📝 Creating statement..."
3. Feature check shows: `{ USE_AI_SUMMARY: 'true', enabled: true }`
4. API call to OpenRouter succeeds in ~1-3 seconds
5. Summary appended to statement text
6. Statement saved to database with summary
7. User sees statement with summary in UI

**Total Time:** ~1-4 seconds per statement (most time is API call)

---

## 🎯 Success Criteria

You know it's working when:

✅ Server logs show all emoji checkpoints (📝 → 🔍 → 🤖 → 📡 → ✅ → ✨)
✅ Created statement contains `---` separator
✅ Created statement has `📝 AI Summary:` section
✅ Summary is concise (1-2 sentences)
✅ Original statement text unchanged above separator

