# Cloudflare Pages Deployment Guide

This guide explains how to deploy SpeechKarma to Cloudflare Pages using the automated CI/CD pipeline.

## Overview

The project is configured to automatically deploy to Cloudflare Pages when changes are pushed to the `master` branch. The deployment workflow includes:

1. **Linting** - Code quality checks
2. **Testing** - Unit tests
3. **Building** - Astro build optimized for Cloudflare
4. **Deployment** - Automatic deployment to Cloudflare Pages

## Prerequisites

Before setting up the deployment pipeline, you need:

### 1. Cloudflare Account
- Create a Cloudflare account at https://cloudflare.com
- Set up a Cloudflare Pages project

### 2. Cloudflare API Token
Generate an API token with the following permissions:
- Go to https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"
- Use the "Edit Cloudflare Workers" template or create a custom token with:
  - Account > Cloudflare Pages > Edit
  - Account > Account Settings > Read
- Copy the generated token (you'll need it for GitHub secrets)

### 3. Cloudflare Account ID
Find your Account ID:
- Log in to Cloudflare Dashboard
- Go to any domain or Workers & Pages section
- Your Account ID is displayed in the right sidebar
- Copy the Account ID (you'll need it for GitHub secrets)

### 4. Cloudflare Pages Project
Create a new Cloudflare Pages project:
- Go to https://dash.cloudflare.com
- Navigate to "Workers & Pages"
- Click "Create Application" > "Pages" > "Connect to Git" or "Direct Upload"
- Note: The GitHub workflow will handle deployments, so you can use Direct Upload
- Copy the project name (you'll need it for GitHub secrets)

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

**Go to:** Repository Settings > Secrets and variables > Actions > New repository secret

### Required Secrets

#### Cloudflare Secrets
| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages edit permissions | Cloudflare Dashboard > Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Cloudflare Dashboard > Any page (right sidebar) |
| `CLOUDFLARE_PROJECT_NAME` | Your Cloudflare Pages project name | Cloudflare Dashboard > Workers & Pages |

#### Supabase Secrets
| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Project Settings > API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Supabase Dashboard > Project Settings > API |

#### Optional Secrets
| Secret Name | Description | Default |
|------------|-------------|---------|
| `USE_AI_SUMMARY` | Enable AI-generated summaries | `false` |
| `OPENROUTER_API_KEY` | OpenRouter API key (required if USE_AI_SUMMARY=true) | - |

## Project Configuration

### Astro Configuration

The project uses a dynamic adapter configuration in `astro.config.mjs`:

```javascript
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

The workflow automatically sets `PLATFORM=cloudflare` during the build process.

### Dependencies

The following Cloudflare-specific dependencies are included:

```json
{
  "dependencies": {
    "@astrojs/cloudflare": "^12.6.10"
  }
}
```

## Workflow Details

### Workflow File: `.github/workflows/master.yml`

The workflow consists of four jobs:

#### 1. Lint Job
- Runs ESLint checks
- Ensures code quality standards

#### 2. Test Job
- Runs unit tests with Vitest
- Validates application logic

#### 3. Build Job
- Sets `PLATFORM=cloudflare` environment variable
- Builds the application with Cloudflare adapter
- Uploads build artifacts for deployment
- **Dependencies:** Requires lint and test jobs to pass

#### 4. Deploy Job
- Downloads build artifacts
- Deploys to Cloudflare Pages using Wrangler
- **Dependencies:** Requires build job to complete successfully

### Workflow Triggers

The workflow runs automatically on:
- Push to `master` branch

### Action Versions

All GitHub Actions are using their latest stable versions:
- `actions/checkout@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v5`
- `actions/download-artifact@v6`
- `cloudflare/wrangler-action@v3`

## Deployment Process

### Automatic Deployment

1. Push changes to the `master` branch:
   ```bash
   git push origin master
   ```

2. GitHub Actions will automatically:
   - Run linting and tests
   - Build the application for Cloudflare
   - Deploy to Cloudflare Pages

3. Monitor the deployment:
   - Go to GitHub repository > Actions tab
   - Click on the running workflow
   - View real-time logs for each job

### Manual Deployment (Optional)

You can also deploy manually using Wrangler CLI:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build for Cloudflare
PLATFORM=cloudflare npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=your-project-name
```

## Environment Variables in Cloudflare

### Setting Environment Variables in Cloudflare Pages

While the GitHub workflow passes environment variables during build, you may need to configure them in Cloudflare Pages for runtime:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your project
3. Go to "Settings" > "Environment variables"
4. Add the following variables:

**Production Environment:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SUPABASE_URL` (same as SUPABASE_URL)
- `PUBLIC_SUPABASE_ANON_KEY` (same as SUPABASE_ANON_KEY)
- `USE_AI_SUMMARY` (optional)
- `OPENROUTER_API_KEY` (if USE_AI_SUMMARY is true)

**Note:** Variables prefixed with `PUBLIC_` are exposed to the client-side code.

## Troubleshooting

### Build Fails

**Issue:** Build fails with "Missing environment variables"
- **Solution:** Verify all required secrets are set in GitHub repository settings

**Issue:** Build fails with module errors
- **Solution:** Ensure `@astrojs/cloudflare` is installed and version is compatible

### Deployment Fails

**Issue:** Deployment fails with authentication error
- **Solution:** Verify `CLOUDFLARE_API_TOKEN` has correct permissions
- **Solution:** Check that token hasn't expired

**Issue:** Deployment fails with "Project not found"
- **Solution:** Verify `CLOUDFLARE_PROJECT_NAME` matches your Cloudflare Pages project name exactly
- **Solution:** Ensure project exists in the account associated with `CLOUDFLARE_ACCOUNT_ID`

**Issue:** Deployment succeeds but site doesn't work
- **Solution:** Check environment variables are set in Cloudflare Pages settings
- **Solution:** Verify `PUBLIC_` prefixed variables are accessible to client code
- **Solution:** Check Cloudflare Pages Functions logs for runtime errors

### Workflow Fails

**Issue:** Tests fail in CI but pass locally
- **Solution:** Ensure all dependencies are listed in `package.json`
- **Solution:** Check Node version matches `.nvmrc` (22.14.0)

**Issue:** Artifact upload/download fails
- **Solution:** Check GitHub Actions artifacts storage isn't full
- **Solution:** Verify artifact names match between upload and download steps

## Monitoring and Logs

### GitHub Actions Logs
- Repository > Actions tab
- Click on specific workflow run
- View logs for each job

### Cloudflare Pages Logs
- Cloudflare Dashboard > Workers & Pages
- Select your project
- Go to "View logs" or "Functions" tab
- View real-time logs and metrics

### Cloudflare Analytics
- Monitor traffic, performance, and errors
- Cloudflare Dashboard > Your project > Analytics

## Custom Domains

To add a custom domain to your Cloudflare Pages deployment:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your project
3. Go to "Custom domains" tab
4. Click "Set up a custom domain"
5. Follow the instructions to configure DNS

## Rollback

If you need to rollback to a previous deployment:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your project
3. Go to "Deployments" tab
4. Find the previous working deployment
5. Click "..." > "Rollback to this deployment"

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate API tokens** regularly
3. **Use least-privilege** API tokens (only required permissions)
4. **Monitor deployment logs** for unauthorized access
5. **Keep dependencies updated** for security patches
6. **Use environment-specific** secrets for staging/production

## Support

For issues related to:
- **Cloudflare:** Contact Cloudflare Support or check Community Forums
- **GitHub Actions:** Check GitHub Actions status page
- **Project-specific:** Open an issue in the GitHub repository

