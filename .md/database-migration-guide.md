# Database Migration Guide

This guide explains how to apply database migrations to your cloud Supabase instance.

## Problem

After deploying to Cloudflare Pages, the application is running but the database tables don't exist in your cloud Supabase instance. This is because migrations are not automatically applied during deployment.

## Solution Options

### Option 1: Manual Migration (One-time Setup)

Use this method to quickly set up your production database:

#### Step 1: Link to Your Cloud Supabase Project

```bash
# Link to your cloud Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**Finding your PROJECT_REF:**
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Select your project
- Go to Project Settings → General
- Copy the "Reference ID" (looks like: `abcdefghijklmnop`)

You'll be prompted for your database password (the one you set when creating the Supabase project).

#### Step 2: Push Migrations to Production

```bash
# Apply all migrations to the linked cloud database
supabase db push
```

This command will:
1. Read all migration files from `supabase/migrations/`
2. Apply them to your cloud database in order
3. Create all tables, indexes, and policies

#### Step 3: Seed Data (Optional)

If you want to populate the database with sample data:

```bash
# Connect to your cloud database using psql
supabase db reset --db-url "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# OR manually run the seed file
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" < supabase/seed.sql
```

**Warning:** `supabase db reset` will drop all existing data! Only use this for initial setup or development.

### Option 2: Automated Migrations in CI/CD (Recommended for Production)

Add a migration step to your GitHub Actions workflow so migrations are automatically applied on every deployment.

#### Step 1: Add Supabase Secrets to GitHub

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SUPABASE_DB_PASSWORD` | Your Supabase database password | Set when you created the project |
| `SUPABASE_PROJECT_REF` | Your Supabase project reference ID | Found in Project Settings → General |

#### Step 2: Update Deployment Workflow

Add a migration job to `.github/workflows/master.yml`:

```yaml
  migrate:
    name: Run Database Migrations
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v5
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Link to Supabase project
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
        run: |
          supabase link --project-ref $PROJECT_REF --password $SUPABASE_DB_PASSWORD
      
      - name: Push migrations
        run: supabase db push

  # Update the build job to depend on migrate
  build:
    name: Build for Cloudflare
    runs-on: ubuntu-latest
    needs: [lint, test, migrate]  # Added migrate dependency
    # ... rest of build job
```

**Note:** You'll also need to create a `SUPABASE_ACCESS_TOKEN`:
1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new token
3. Add it as a GitHub secret

## Verification

After applying migrations, verify the tables were created:

### Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Table Editor**
4. You should see tables: `parties`, `politicians`, `profiles`, `statements`

### Using psql

```bash
# List all tables
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -c "\dt"

# Describe a specific table
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -c "\d statements"
```

### Using Supabase CLI

```bash
# After linking, you can run SQL queries
supabase db reset --linked

# Or execute custom SQL
echo "SELECT count(*) FROM statements;" | supabase db execute
```

## Common Issues

### "Project not linked"

**Solution:** Run `supabase link --project-ref YOUR_PROJECT_REF` first.

### "Migration already applied"

**Solution:** Supabase tracks applied migrations. If you see this message, the migration was already applied successfully. Check your tables in the Supabase Dashboard.

### "Password authentication failed"

**Solution:** 
- Verify your database password is correct
- Reset your database password in Supabase Dashboard → Project Settings → Database → Reset password

### "Cannot connect to database"

**Solution:**
- Check your internet connection
- Verify the project reference ID is correct
- Ensure your Supabase project is not paused (free tier projects pause after inactivity)

## Best Practices

1. **Always test migrations locally first**
   ```bash
   # Start local Supabase
   supabase start
   
   # Apply migrations locally
   supabase db reset
   ```

2. **Never edit applied migrations**
   - Once a migration is applied to production, create a new migration for changes
   - This prevents migration conflicts

3. **Use descriptive migration names**
   ```bash
   # Create a new migration
   supabase migration new add_user_avatar_column
   ```

4. **Backup before major migrations**
   - Use Supabase Dashboard → Database → Backups
   - Download a backup before running destructive migrations

5. **Version control your migrations**
   - All migration files in `supabase/migrations/` should be committed to git
   - Never delete or modify historical migration files

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [GitHub Actions with Supabase](https://supabase.com/docs/guides/cli/github-actions)

