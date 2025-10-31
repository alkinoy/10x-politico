# E2E Testing Setup Guide - Playwright

## Overview

This document describes the setup and configuration for end-to-end testing of SpeechKarma application using Playwright.

---

## Prerequisites

- Node.js 18+ installed
- Running Supabase instance (local or hosted)
- Test database accessible
- Application running on `http://localhost:4321`

---

## 1. Install Playwright

### Installation

```bash
npm install -D @playwright/test
npm install -D dotenv
npx playwright install
```

### Verify Installation

```bash
npx playwright --version
```

Expected output: `Version 1.x.x`

---

## 2. Playwright Configuration

### Create `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './tests/e2e',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Test artifacts
  outputDir: './test-results',
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:4321',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## 3. Test Environment Configuration

### Create `.env.test`

This file contains environment variables specifically for testing:

```bash
# Database Configuration
SUPABASE_URL=your_supabase_test_url
SUPABASE_ANON_KEY=your_supabase_test_anon_key

# IMPORTANT: Disable AI Summary for tests
USE_AI_SUMMARY=false

# Test Application URL
BASE_URL=http://localhost:4321

# Test User Credentials (created during test setup)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

**⚠️ CRITICAL:** Always set `USE_AI_SUMMARY=false` for e2e tests to ensure:
- Predictable test data
- Faster test execution
- No dependency on external AI services
- Consistent test results

### Update `.gitignore`

Add test artifacts to `.gitignore`:

```bash
# Playwright
/test-results/
/playwright-report/
/playwright/.cache/
.env.test
```

---

## 4. Database Test Helpers

### Create `tests/e2e/helpers/db-helpers.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const testDb = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Clean up test data before/after tests
 */
export async function cleanupTestData() {
  // Delete in order respecting foreign key constraints
  await testDb.from('statements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await testDb.from('politicians').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await testDb.from('parties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // Note: Don't delete profiles/users - those are managed separately
}

/**
 * Seed test parties
 */
export async function seedTestParties() {
  const parties = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Democratic Party',
      abbreviation: 'TDP',
      color_hex: '#0015BC',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Test Republican Party',
      abbreviation: 'TRP',
      color_hex: '#E81B23',
    },
  ];

  const { error } = await testDb.from('parties').upsert(parties);
  if (error) throw error;
  
  return parties;
}

/**
 * Seed test politicians
 */
export async function seedTestPoliticians() {
  const politicians = [
    {
      id: '33333333-3333-3333-3333-333333333333',
      first_name: 'John',
      last_name: 'TestPolitician',
      party_id: '11111111-1111-1111-1111-111111111111',
      biography: 'Test politician for e2e testing',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      first_name: 'Jane',
      last_name: 'TestSenator',
      party_id: '22222222-2222-2222-2222-222222222222',
      biography: 'Test senator for e2e testing',
    },
  ];

  const { error } = await testDb.from('politicians').upsert(politicians);
  if (error) throw error;
  
  return politicians;
}

/**
 * Seed test statements
 */
export async function seedTestStatements(userId: string) {
  const statements = [
    {
      id: '55555555-5555-5555-5555-555555555555',
      politician_id: '33333333-3333-3333-3333-333333333333',
      statement_text: 'We need comprehensive healthcare reform to ensure every citizen has access to quality medical care.',
      statement_timestamp: new Date('2025-10-30T10:00:00Z').toISOString(),
      created_by_user_id: userId,
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      politician_id: '44444444-4444-4444-4444-444444444444',
      statement_text: 'Lower taxes for small businesses will stimulate economic growth and create more jobs.',
      statement_timestamp: new Date('2025-10-29T15:30:00Z').toISOString(),
      created_by_user_id: userId,
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      politician_id: '33333333-3333-3333-3333-333333333333',
      statement_text: 'Climate change is the defining challenge of our generation and requires immediate action.',
      statement_timestamp: new Date('2025-10-28T09:15:00Z').toISOString(),
      created_by_user_id: userId,
    },
  ];

  const { error } = await testDb.from('statements').upsert(statements);
  if (error) throw error;
  
  return statements;
}

/**
 * Create a test user for authentication
 */
export async function createTestUser(email: string, password: string) {
  const { data, error } = await testDb.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: 'Test User',
      },
    },
  });

  if (error) throw error;
  return data.user;
}

/**
 * Get test user session
 */
export async function getTestUserSession(email: string, password: string) {
  const { data, error } = await testDb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
}

/**
 * Full test database setup
 */
export async function setupTestDatabase(userId: string) {
  await cleanupTestData();
  await seedTestParties();
  await seedTestPoliticians();
  await seedTestStatements(userId);
}
```

---

## 5. Authentication Helpers

### Create `tests/e2e/helpers/auth-helpers.ts`

```typescript
import { Page } from '@playwright/test';
import { getTestUserSession } from './db-helpers';

/**
 * Authenticate user and set cookies
 */
export async function authenticateUser(
  page: Page,
  email: string,
  password: string
) {
  const session = await getTestUserSession(email, password);
  
  if (!session) {
    throw new Error('Failed to get test user session');
  }

  // Set authentication cookies
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: session.access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
    {
      name: 'sb-refresh-token',
      value: session.refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Sign out user by clearing cookies
 */
export async function signOutUser(page: Page) {
  await page.context().clearCookies();
}
```

---

## 6. Directory Structure

Create the following test directory structure:

```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── db-helpers.ts
│   │   └── auth-helpers.ts
│   ├── statements-list.spec.ts
│   └── add-statement.spec.ts
└── fixtures/
    └── test-data.json
```

---

## 7. Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/statements-list.spec.ts
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate Test Report

```bash
npx playwright show-report
```

---

## 8. CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npx playwright test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
          USE_AI_SUMMARY: false
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 9. Best Practices

### Test Isolation

- Each test should be independent
- Clean up data after each test
- Use unique test data identifiers
- Don't rely on execution order

### Test Data Management

- Use fixed UUIDs for test data (easier to debug)
- Seed data before each test suite
- Clean up after tests complete
- Use meaningful test data names

### Stability

- Use `waitForSelector` for dynamic content
- Add appropriate timeouts
- Handle loading states
- Test with realistic data volumes

### Performance

- Run tests in parallel when possible
- Use `fullyParallel: false` for tests that modify shared data
- Reuse authenticated sessions when possible
- Clean up only necessary data

---

## 10. Troubleshooting

### Tests Fail with "Session not found"

- Verify `.env.test` has correct Supabase credentials
- Check test user was created successfully
- Ensure cookies are being set correctly

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if application is running
- Verify database is accessible

### Inconsistent Results

- Check if `USE_AI_SUMMARY=false` in `.env.test`
- Ensure test data is being seeded correctly
- Verify test isolation (clean up between tests)

### Database Connection Issues

- Verify Supabase URL and keys
- Check network connectivity
- Ensure test database exists and is accessible

---

## Next Steps

Once setup is complete, proceed to:

1. [Statements List E2E Tests](./01-statements-list-e2e.md)
2. [Add Statement E2E Tests](./02-add-statement-e2e.md)

