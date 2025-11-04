# Cloudflare Pages Deployment Guide

This guide covers deploying the SpeechKarma application to Cloudflare Pages.

## Quick Fix for "Missing Environment Variables" Error

If you're seeing the error **"Missing Supabase environment variables"** in Cloudflare Pages:

1. The code has been updated to properly access Cloudflare runtime environment variables through `Astro.locals.runtime.env`
2. You MUST set your environment variables in Cloudflare Pages Settings → Environment variables
3. After setting the variables, **trigger a new deployment** (environment changes don't apply to existing deployments)

The application now correctly handles environment variables for both:
- **Node.js adapter** (development/local): Uses `import.meta.env` or `process.env`
- **Cloudflare Pages** (production): Uses `Astro.locals.runtime.env`

## Prerequisites

- Cloudflare account
- Supabase project with the following credentials:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- OpenRouter API key (for AI features)

## Required Environment Variables

The following environment variables must be configured in Cloudflare Pages:

### Core Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENROUTER_API_KEY` - Your OpenRouter API key

### Public Variables
- `PUBLIC_SUPABASE_URL` - Same as SUPABASE_URL (accessible from client-side)
- `PUBLIC_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY (accessible from client-side)

### Optional Variables
- `SITE_URL` - Your production URL (e.g., https://yourdomain.com)
- `USE_AI_SUMMARY` - Set to "true" to enable AI summaries

## Setting Environment Variables in Cloudflare Pages

### Option 1: Through Cloudflare Dashboard

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the left sidebar
3. Select your project
4. Go to **Settings** tab
5. Scroll down to **Environment variables** section
6. Click **Add variable** for each required variable:
   - Variable name: `SUPABASE_URL`
   - Value: Your Supabase URL
   - Choose environment: Production (and Preview if needed)
7. Repeat for all required variables
8. Click **Save**

### Option 2: Using Wrangler CLI

```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set environment variables
wrangler pages project create speechkarma  # if not created yet

# Set each variable
wrangler pages secret put SUPABASE_URL --project-name=speechkarma
wrangler pages secret put SUPABASE_ANON_KEY --project-name=speechkarma
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name=speechkarma
wrangler pages secret put OPENROUTER_API_KEY --project-name=speechkarma
wrangler pages secret put PUBLIC_SUPABASE_URL --project-name=speechkarma
wrangler pages secret put PUBLIC_SUPABASE_ANON_KEY --project-name=speechkarma
```

## Build Configuration

Ensure your Cloudflare Pages build settings are configured correctly:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (or your project root)
- **Environment variables**: `PLATFORM=cloudflare` (important for adapter selection)

### Build Environment Variables

In addition to the runtime environment variables above, you should also set:
- `PLATFORM=cloudflare` - This tells the build process to use the Cloudflare adapter

## Deployment Process

### Initial Deployment

1. Push your code to your Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Cloudflare Pages:
   - Go to Cloudflare Pages dashboard
   - Click **Create a project**
   - Select **Connect to Git**
   - Choose your repository
   - Configure build settings as described above
   - Add all required environment variables
   - Click **Save and Deploy**

### Subsequent Deployments

Cloudflare Pages automatically deploys on every push to your main branch.

To deploy manually:
```bash
npm run build
wrangler pages deploy dist --project-name=speechkarma
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Environment variables are not set in Cloudflare Pages.

**Solution**:
1. Go to your Cloudflare Pages project settings
2. Navigate to Environment variables
3. Ensure all required variables are set for the Production environment
4. Redeploy your application

### Error: "Cannot find module" or build failures

**Cause**: Build command might not be using the correct adapter.

**Solution**:
1. Ensure `PLATFORM=cloudflare` is set in build environment variables
2. Check that `@astrojs/cloudflare` is installed in dependencies
3. Verify `astro.config.mjs` correctly selects the adapter based on PLATFORM

### Supabase Connection Issues

**Cause**: Incorrect Supabase credentials or network issues.

**Solution**:
1. Verify your Supabase project is active
2. Check that the SUPABASE_URL and keys are correct
3. Ensure your Supabase project allows requests from your Cloudflare domain
4. Check Supabase dashboard for any service disruptions

## Security Best Practices

1. **Never commit environment variables** to your repository
2. **Use different Supabase projects** for production and development
3. **Rotate keys regularly**, especially if they might have been exposed
4. **Monitor usage** in Supabase dashboard to detect anomalies
5. **Enable Row Level Security (RLS)** on all Supabase tables
6. **Use service role key carefully** - only for server-side operations

## Monitoring and Logs

### Viewing Logs

1. Go to your Cloudflare Pages project
2. Select the deployment
3. Click on **View logs** to see build and runtime logs
4. Look for errors related to environment variables or Supabase connections

### Common Log Messages

- `Error: Missing Supabase environment variables` - Environment variables not set
- `Invalid API key` - Wrong OpenRouter API key
- `Failed to fetch` - Network issues or wrong Supabase URL

## Performance Optimization

1. **Enable Cloudflare caching** for static assets
2. **Use Cloudflare CDN** for global distribution
3. **Monitor Supabase usage** to stay within free tier limits
4. **Optimize images** before uploading
5. **Use edge functions** for geographically distributed users

## Rollback

If a deployment fails:

1. Go to Cloudflare Pages dashboard
2. Navigate to your project
3. Go to **Deployments** tab
4. Find the last working deployment
5. Click **...** menu > **Rollback to this deployment**

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Supabase Documentation](https://supabase.com/docs)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

