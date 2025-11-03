# E2E Testing Setup Guide

This guide will help you set up and run the Playwright e2e tests for SpeechKarma.

## Prerequisites

- Node.js 18+ installed
- Running Supabase instance (local or hosted)
- Application dependencies installed (`npm install`)

## Quick Start

### 1. Create `.env.test` file

Create a `.env.test` file in the project root with the following content:

```bash
# Database Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# CRITICAL: Disable AI Summary for tests
USE_AI_SUMMARY=false

# Test Application URL
BASE_URL=http://localhost:4321

# Test User Credentials (these will be created automatically)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

**Important:** Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your actual test Supabase credentials.

### 2. Install Playwright Browsers (if not already done)

```bash
npx playwright install
```

### 3. Run the Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

## Test Structure

```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── db-helpers.ts          # Database seeding & cleanup
│   │   └── auth-helpers.ts        # Authentication utilities
│   ├── statements-list.spec.ts    # Homepage tests
│   └── add-statement.spec.ts      # Add statement form tests
```

## Test Coverage

### Statements List Tests (Homepage)
- ✅ Page loads successfully
- ✅ Displays seeded statements in correct order
- ✅ Shows politician names and party badges
- ✅ Statement text matches database exactly
- ✅ No AI summary separators present
- ✅ Interactive elements work
- ✅ Responsive on different viewports

### Add Statement Tests
- ✅ Requires authentication
- ✅ Form validation (required fields, min/max length)
- ✅ Successfully submits statements
- ✅ Statements persist to database correctly
- ✅ NO AI summary appended to text
- ✅ Correct user ID, politician ID, and timestamp saved
- ✅ Responsive design

## Critical Configuration

### AI Summary MUST Be Disabled

In `.env.test`, ensure:

```bash
USE_AI_SUMMARY=false
```

**Why?**
- Ensures predictable test data
- Eliminates external API dependencies
- Faster test execution
- Consistent results across runs

## Test Data

The tests use fixed UUIDs for consistency:

### Parties
- Test Democratic Party (TDP) - `11111111-1111-1111-1111-111111111111`
- Test Republican Party (TRP) - `22222222-2222-2222-2222-222222222222`

### Politicians
- John TestPolitician (TDP) - `33333333-3333-3333-3333-333333333333`
- Jane TestSenator (TRP) - `44444444-4444-4444-4444-444444444444`

### Statements
- Healthcare reform statement - `55555555-5555-5555-5555-555555555555`
- Tax policy statement - `66666666-6666-6666-6666-666666666666`
- Climate change statement - `77777777-7777-7777-7777-777777777777`

## Troubleshooting

### Tests fail with "Session not found"
**Solution:**
1. Check `.env.test` has correct Supabase credentials
2. Verify test database is accessible
3. Ensure `SUPABASE_ANON_KEY` is correct

### Statements contain AI summary in tests
**Solution:**
1. **Check `.env.test` has `USE_AI_SUMMARY=false`**
2. Restart dev server after changing env variable
3. Clear test database and re-seed

### Tests timeout
**Solution:**
1. Increase timeout in test file
2. Check application is running on correct port (4321)
3. Verify Supabase is accessible

### Tests fail on CI/CD
**Solution:**
1. Ensure `.env.test` values are set as secrets/environment variables
2. Run `npx playwright install --with-deps` to install system dependencies
3. Use headless mode (default in CI)

## Running Tests in CI

Example GitHub Actions workflow:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    USE_AI_SUMMARY: false
```

## Available Test Scripts

- `npm run test:e2e` - Run all e2e tests
- `npm run test:e2e:ui` - Run tests in interactive UI mode
- `npm run test:e2e:headed` - Run tests with visible browser
- `npm run test:e2e:debug` - Run tests in debug mode with inspector

## Database Cleanup

Tests automatically:
- Clean up test data before running
- Seed required test data (parties, politicians, statements)
- Delete created statements after each test
- Clean up all test data after test suite completes

## Next Steps

1. Create your `.env.test` file with correct credentials
2. Run tests: `npm run test:e2e`
3. Review test reports in `playwright-report/`
4. Check for any failures and debug as needed

For more detailed information about the test plans, see `.ai/testplan/README.md`.

