# Environment Variables Setup

This document describes the environment variables required for the API endpoints to function correctly.

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

### Supabase Configuration

```env
# Your Supabase project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon/public key (for client-side operations and authentication)
SUPABASE_ANON_KEY=your-anon-key-here

# Supabase service role key (for server-side operations, bypasses RLS)
# ⚠️  IMPORTANT: Keep this secret! Never expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Get These Values

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- **Never commit** your `.env` file to version control
- The `.env` file is already in `.gitignore` by default
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) policies
- Only use the service role key in server-side code
- The anon key is safe to use in client-side code

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

