# Cloudflare Pages Deployment - Quick Start

This is a condensed guide to get your SpeechKarma app deployed to Cloudflare Pages in minutes.

## Prerequisites Checklist

- [ ] Cloudflare account
- [ ] Cloudflare Pages project created
- [ ] Supabase project with credentials
- [ ] GitHub repository

## Step 1: Get Cloudflare Credentials

### Get API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Copy the token

### Get Account ID
1. Go to Cloudflare Dashboard
2. Find Account ID in right sidebar
3. Copy the ID

### Get Project Name
1. Go to Workers & Pages
2. Note your project name (or create new project)

## Step 2: Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy:
   - Project URL
   - anon/public key
   - service_role key

## Step 3: Configure GitHub Secrets

Go to: **GitHub Repository > Settings > Secrets and variables > Actions**

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_PROJECT_NAME` | Your Cloudflare Pages project name |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

### Optional Secrets (for AI features)

| Secret Name | Value | Default |
|------------|-------|---------|
| `USE_AI_SUMMARY` | `true` or `false` | `false` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | - |

## Step 4: Configure Cloudflare Pages Environment Variables

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your project
3. Go to Settings > Environment variables
4. Add these for **Production**:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Optional (for AI features):**
```
USE_AI_SUMMARY=true
OPENROUTER_API_KEY=sk-or-v1-...
```

## Step 5: Deploy

### Automatic Deployment

Push to master branch:
```bash
git push origin master
```

The GitHub Actions workflow will automatically:
1. ✅ Run linting
2. ✅ Run tests
3. ✅ Build for Cloudflare
4. ✅ Deploy to Cloudflare Pages

### Monitor Deployment

1. Go to GitHub repository > Actions tab
2. Click on the latest workflow run
3. Watch the deployment progress

## Step 6: Verify Deployment

1. Go to Cloudflare Dashboard > Workers & Pages
2. Click on your project
3. Find the deployment URL
4. Visit the URL to test your app

## Troubleshooting

### ❌ Build Fails - Missing Secrets
**Solution:** Double-check all GitHub secrets are set correctly

### ❌ Deployment Fails - Authentication Error
**Solution:** Verify CLOUDFLARE_API_TOKEN has correct permissions

### ❌ Site Deployed but Doesn't Work
**Solution:** Check environment variables in Cloudflare Pages settings

### ❌ Supabase Errors
**Solution:** Verify all Supabase variables in both GitHub and Cloudflare

## Next Steps

- [ ] Set up custom domain in Cloudflare Pages
- [ ] Configure production database
- [ ] Set up monitoring and alerts
- [ ] Configure caching rules

## Common Commands

```bash
# Local development
npm run dev

# Build for Cloudflare
PLATFORM=cloudflare npm run build

# Manual deployment (after build)
wrangler pages deploy dist --project-name=your-project-name

# Run tests
npm test
```

## Workflow File Location

The deployment workflow is defined in:
```
.github/workflows/master.yml
```

## Documentation

For detailed information, see:
- [Cloudflare Deployment Guide](.md/cloudflare-deployment.md)
- [Environment Variables Reference](.md/deployment-env-vars.md)

## Support

- **Cloudflare Issues:** https://community.cloudflare.com/
- **Supabase Issues:** https://supabase.com/docs
- **GitHub Actions:** https://docs.github.com/actions

---

**Estimated Setup Time:** 10-15 minutes

