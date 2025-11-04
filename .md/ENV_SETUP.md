# Environment Variables Setup

This document describes the environment variables required for the API endpoints to function correctly.

## Quick Start

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

For testing:

```bash
cp .env.example .env.test
```

## Required Environment Variables

### Supabase Configuration

Get these values from your Supabase project dashboard: **Settings** → **API**

```env
# Your Supabase project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon/public key (for client-side operations and authentication)
SUPABASE_ANON_KEY=your-anon-key-here

# Supabase service role key (for server-side operations, bypasses RLS)
# ⚠️  IMPORTANT: Keep this secret! Never expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### OpenRouter API (for AI features)

Get your API key from: https://openrouter.ai/keys

```env
# OpenRouter API key for AI-powered statement summaries
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### Feature Flags

```env
# Enable/disable AI-powered statement summaries
# Set to "true" to enable, "false" to disable
USE_AI_SUMMARY=false
```

### Optional Variables

```env
# Site URL for production deployments
SITE_URL=https://your-domain.com
```

## How to Get These Values

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- **Never commit** your `.env`, `.env.test`, or `.env.production` files to version control
- These files are already in `.gitignore` by default
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) policies
- Only use the service role key in server-side code
- The anon key is safe to use in client-side code

## Testing Environment

For E2E tests, create a `.env.test` file with:

```env
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
USE_AI_SUMMARY=false
OPENROUTER_API_KEY=dummy-key-not-used
```

**Important**: Use a separate Supabase project for testing, not your production database!

## GitHub Actions / CI/CD

For GitHub Actions setup, see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

Required GitHub secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing

After setting up your environment variables, you can test the API endpoint:

```bash
# Start the development server
npm run dev

# Test the endpoint (replace {politician_id} with an actual UUID)
curl http://localhost:3000/api/politicians/{politician_id}/statements

# Test with query parameters
curl "http://localhost:3000/api/politicians/{politician_id}/statements?page=1&limit=10&time_range=30d&sort_by=created_at&order=desc"

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/politicians/{politician_id}/statements
```

