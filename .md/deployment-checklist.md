# Cloudflare Pages Deployment Checklist

Use this checklist to ensure your Cloudflare Pages deployment is properly configured.

## Pre-Deployment Checklist

### 1. Project Configuration

- [x] `@astrojs/cloudflare` installed in package.json
- [x] Astro config supports Cloudflare adapter
- [x] `PLATFORM` environment variable handled in astro.config.mjs
- [x] `.nvmrc` file exists with Node version

### 2. Cloudflare Setup

- [ ] Cloudflare account created
- [ ] Cloudflare Pages project created
- [ ] Project name documented (for `CLOUDFLARE_PROJECT_NAME` secret)
- [ ] Account ID obtained from dashboard URL
- [ ] API token created with required permissions:
  - [x] Account.Cloudflare Pages:Edit
  - [x] Account.Account Settings:Read

### 3. GitHub Repository Secrets

Configure these secrets in GitHub: Settings → Secrets and variables → Actions

#### Cloudflare Secrets
- [ ] `CLOUDFLARE_API_TOKEN` - API token for deployment
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- [ ] `CLOUDFLARE_PROJECT_NAME` - Your Pages project name

#### Application Secrets
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `USE_AI_SUMMARY` - Enable AI features (true/false)
- [ ] `OPENROUTER_API_KEY` - OpenRouter API key (optional)

### 4. Cloudflare Pages Environment Variables

Configure these in Cloudflare Dashboard → Pages → Your Project → Settings → Environment variables

#### Production Environment
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PUBLIC_SUPABASE_URL`
- [ ] `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `USE_AI_SUMMARY`
- [ ] `OPENROUTER_API_KEY` (if using AI)

### 5. GitHub Actions Workflow

- [x] `.github/workflows/master.yml` exists
- [x] Workflow configured for `master` branch
- [x] All action versions are up-to-date
- [x] Build job uses `PLATFORM=cloudflare`
- [x] Deploy job has correct permissions
- [x] Wrangler action configured correctly

### 6. Testing

- [ ] Local build works with `PLATFORM=cloudflare npm run build`
- [ ] All environment variables are accessible
- [ ] API routes are working
- [ ] Client-side code can access PUBLIC_ variables

## Post-Deployment Checklist

### 7. Verify Deployment

- [ ] GitHub Actions workflow completed successfully
- [ ] Cloudflare Pages shows successful deployment
- [ ] Production URL is accessible
- [ ] Application loads without errors
- [ ] Authentication works (Supabase)
- [ ] API endpoints respond correctly

### 8. Configure Custom Domain (Optional)

- [ ] Domain added in Cloudflare Pages → Settings → Custom domains
- [ ] DNS records configured
- [ ] HTTPS certificate provisioned
- [ ] Domain accessible

### 9. Monitoring Setup

- [ ] GitHub Actions notifications enabled
- [ ] Cloudflare Pages alerts configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured

### 10. Documentation

- [x] Deployment process documented
- [x] Secrets documented (without values)
- [x] Troubleshooting guide created
- [ ] Team members informed of deployment process

## Quick Reference

### Required Secrets Summary

```bash
# Cloudflare Secrets
CLOUDFLARE_API_TOKEN=<your-api-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_PROJECT_NAME=<your-project-name>

# Application Secrets
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
USE_AI_SUMMARY=false
OPENROUTER_API_KEY=<your-openrouter-key>
```

### Deployment Commands

```bash
# Test build locally
PLATFORM=cloudflare npm run build

# Preview locally
npm run preview

# Trigger deployment (push to master)
git push origin master
```

### Useful Links

- Cloudflare Dashboard: https://dash.cloudflare.com/
- GitHub Actions: https://github.com/your-org/your-repo/actions
- Production URL: https://your-project.pages.dev
- Supabase Dashboard: https://supabase.com/dashboard

## Troubleshooting Quick Fixes

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
PLATFORM=cloudflare npm run build
```

### Environment Variable Issues
```bash
# Verify variables are set in both:
# 1. GitHub Secrets (for build-time)
# 2. Cloudflare Pages Environment Variables (for runtime)
```

### Deployment Fails
```bash
# Check API token permissions:
# 1. Go to Cloudflare Dashboard → My Profile → API Tokens
# 2. Verify token has Cloudflare Pages:Edit permission
# 3. Regenerate token if needed
```

### Application Not Loading
```bash
# Check Cloudflare Pages deployment logs:
# 1. Go to Cloudflare Dashboard → Pages → Your Project
# 2. Click on latest deployment
# 3. Review build and function logs
```

## Need Help?

- 📖 [Cloudflare Deployment Guide](./cloudflare-deployment.md)
- 🔧 [Astro Configuration](../astro.config.mjs)
- 🚀 [GitHub Workflow](../.github/workflows/master.yml)
- 📝 [Tech Stack Documentation](./tech-stack.md)

