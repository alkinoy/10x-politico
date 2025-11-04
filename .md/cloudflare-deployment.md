# Cloudflare Pages Deployment Guide

This document describes the automated deployment process to Cloudflare Pages using GitHub Actions.

## Overview

The project is configured to automatically deploy to Cloudflare Pages when code is pushed to the `master` branch. The deployment workflow includes linting, testing, building, and deploying the application.

## Architecture

### Astro Configuration

The project uses Astro with a dynamic adapter selection based on the `PLATFORM` environment variable:

```javascript
// astro.config.mjs
const getAdapter = () => {
  const platform = process.env.PLATFORM || "node";
  
  if (platform === "cloudflare") {
    return cloudflare({
      platformProxy: {
        enabled: true,
      },
    });
  }
  
  return node({
    mode: "standalone",
  });
};
```

When `PLATFORM=cloudflare` is set, the project builds with the `@astrojs/cloudflare` adapter, optimizing the output for Cloudflare Pages.

## GitHub Actions Workflow

### Workflow File

The deployment workflow is defined in `.github/workflows/master.yml`.

### Workflow Jobs

1. **Lint** - Runs ESLint to check code quality
2. **Unit Tests** - Runs Vitest unit tests
3. **Build for Cloudflare** - Builds the application with Cloudflare adapter
4. **Deploy to Cloudflare Pages** - Deploys the build artifacts to Cloudflare Pages

### Job Dependencies

```
lint ──┐
       ├──> build ──> deploy
test ──┘
```

The build job only runs if both lint and test jobs succeed. The deploy job only runs if the build succeeds.

## Required GitHub Secrets

To enable Cloudflare Pages deployment, you need to configure the following secrets in your GitHub repository:

### Cloudflare Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | API token for Cloudflare authentication | 1. Log in to Cloudflare Dashboard<br>2. Go to My Profile → API Tokens<br>3. Create Token → "Edit Cloudflare Workers" template<br>4. Add "Account.Cloudflare Pages:Edit" permission<br>5. Copy the generated token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in Cloudflare Dashboard URL:<br>`https://dash.cloudflare.com/<ACCOUNT_ID>/pages` |
| `CLOUDFLARE_PROJECT_NAME` | Name of your Cloudflare Pages project | The project name you created in Cloudflare Pages |

### Application Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `USE_AI_SUMMARY` | Enable/disable AI summaries (true/false) | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | Optional if `USE_AI_SUMMARY=false` |

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

## Cloudflare Pages Setup

### Creating a Cloudflare Pages Project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the left sidebar
3. Click **Create a project**
4. Select **Direct Upload** (we'll deploy via GitHub Actions)
5. Enter a project name (this becomes `CLOUDFLARE_PROJECT_NAME`)
6. Click **Create project**

### Environment Variables in Cloudflare

After creating the project, add the following environment variables in Cloudflare Pages:

1. Go to your project in Cloudflare Pages
2. Navigate to **Settings** → **Environment variables**
3. Add the following variables for **Production**:

| Variable Name | Value |
|---------------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` |
| `USE_AI_SUMMARY` | `true` or `false` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key (if using AI) |

**Note:** Variables prefixed with `PUBLIC_` are exposed to the client-side code.

## Deployment Process

### Automatic Deployment

When you push code to the `master` branch:

1. GitHub Actions triggers the workflow
2. Code is linted and tested
3. Application is built with `PLATFORM=cloudflare`
4. Build artifacts are uploaded as GitHub Actions artifacts
5. Artifacts are downloaded and deployed to Cloudflare Pages
6. Deployment URL is displayed in the workflow summary

### Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Cloudflare Pages** workflow
3. Click **Run workflow**
4. Select `master` branch
5. Click **Run workflow** button

### Deployment URL

After deployment, you can access your application at:
- Production: `https://<project-name>.pages.dev`
- Custom domain: Configure in Cloudflare Pages → Settings → Custom domains

## Build Configuration

### Environment Variables During Build

The build job sets the following environment variables:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  USE_AI_SUMMARY: ${{ secrets.USE_AI_SUMMARY }}
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  PLATFORM: cloudflare
```

### Build Output

The Cloudflare adapter generates:
- `dist/_worker.js` - Cloudflare Worker entry point
- `dist/client/` - Client-side assets
- `dist/server/` - Server-side rendered pages and API routes

## Troubleshooting

### Build Fails with "Module not found"

**Solution:** Ensure all dependencies are installed and listed in `package.json`.

```bash
npm install
npm run build
```

### Deployment Fails with "Invalid API token"

**Solution:** 
1. Verify your `CLOUDFLARE_API_TOKEN` is correct
2. Ensure the token has the required permissions:
   - Account.Cloudflare Pages:Edit
   - Account.Account Settings:Read

### Environment Variables Not Available at Runtime

**Solution:** 
1. Ensure variables are set in both:
   - GitHub Secrets (for build-time)
   - Cloudflare Pages Environment Variables (for runtime)
2. Use `PUBLIC_` prefix for client-side variables

### "Project not found" Error

**Solution:**
1. Verify `CLOUDFLARE_PROJECT_NAME` matches the project name in Cloudflare Pages
2. Ensure the project exists in the Cloudflare account associated with `CLOUDFLARE_ACCOUNT_ID`

## Monitoring Deployments

### GitHub Actions

View deployment status in:
- **Actions** tab → **Deploy to Cloudflare Pages** workflow
- Each run shows logs for all jobs
- Deployment summary appears at the bottom of the deploy job

### Cloudflare Dashboard

Monitor deployments in:
- Cloudflare Dashboard → **Pages** → Your Project
- View deployment history, build logs, and analytics
- Set up alerts for failed deployments

## Rollback

To rollback to a previous deployment:

1. Go to Cloudflare Dashboard → **Pages** → Your Project
2. Click on **Deployments** tab
3. Find the working deployment
4. Click **...** → **Rollback to this deployment**

## Performance Optimization

### Cloudflare Pages Features

- **Global CDN**: Content is cached at 300+ locations worldwide
- **Automatic HTTPS**: SSL certificates are provisioned automatically
- **Unlimited Bandwidth**: No bandwidth charges
- **DDoS Protection**: Built-in protection against attacks

### Recommended Optimizations

1. **Enable Cloudflare Workers KV** for caching
2. **Configure Cache Rules** in Cloudflare Dashboard
3. **Use Cloudflare Images** for image optimization
4. **Enable Brotli Compression** (enabled by default)

## CI/CD Best Practices

### Workflow Optimizations

1. **Parallel Jobs**: Lint and test run in parallel
2. **Dependency Caching**: npm dependencies are cached
3. **Artifact Retention**: Build artifacts kept for 7 days
4. **Job Dependencies**: Build only runs after tests pass

### Security Best Practices

1. **Never commit secrets** to the repository
2. **Use GitHub Secrets** for sensitive values
3. **Rotate API tokens** regularly
4. **Limit token permissions** to minimum required
5. **Enable branch protection** on `master` branch

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)
