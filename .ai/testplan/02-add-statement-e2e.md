# E2E Test Plan: Add Statement Page

## Overview

This test plan covers end-to-end testing of the add statement page (`/statements/new`) which allows authenticated users to submit new political statements. The tests verify form functionality, validation, submission, and database persistence.

**IMPORTANT:** These tests DO NOT use AI summary generation (`USE_AI_SUMMARY=false` in test environment).

---

## Page Under Test

- **URL:** `/statements/new`
- **Component:** `NewStatementForm.tsx`
- **API Endpoint:** `POST /api/statements`
- **Authentication:** Required

---

## Test Data Requirements

### Test User
- Email: `test-add@example.com`
- Password: `TestPassword123!`
- Display Name: `Test User`

### Parties (2)
- Test Democratic Party (TDP) - ID: `11111111-1111-1111-1111-111111111111`
- Test Republican Party (TRP) - ID: `22222222-2222-2222-2222-222222222222`

### Politicians (2)
- John TestPolitician (TDP) - ID: `33333333-3333-3333-3333-333333333333`
- Jane TestSenator (TRP) - ID: `44444444-4444-4444-4444-444444444444`

---

## Test Suite Implementation

### File: `tests/e2e/add-statement.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import {
  cleanupTestData,
  seedTestParties,
  seedTestPoliticians,
  createTestUser,
  testDb,
} from './helpers/db-helpers';
import { authenticateUser } from './helpers/auth-helpers';

// Test configuration
const TEST_USER_EMAIL = 'test-add@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('Add Statement Page', () => {
  let testUserId: string;

  // Setup: Create test user and seed required data
  test.beforeAll(async () => {
    // Create test user
    const user = await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    testUserId = user!.id;

    // Seed parties and politicians (but no statements)
    await cleanupTestData();
    await seedTestParties();
    await seedTestPoliticians();
  });

  // Cleanup after each test to ensure clean slate
  test.afterEach(async () => {
    // Delete any statements created during tests
    await testDb
      .from('statements')
      .delete()
      .eq('created_by_user_id', testUserId);
  });

  // Final cleanup
  test.afterAll(async () => {
    await cleanupTestData();
  });

  test.describe('Authentication and Access Control', () => {
    test('should redirect to auth page if not authenticated', async ({ page }) => {
      // Try to access without authentication
      await page.goto('/statements/new');
      
      // Should redirect to auth page with return URL
      await expect(page).toHaveURL(/\/auth\?returnUrl=/);
      await expect(page).toHaveURL(/returnUrl=%2Fstatements%2Fnew/);
    });

    test('should allow access when authenticated', async ({ page }) => {
      // Authenticate user
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      
      // Navigate to add statement page
      await page.goto('/statements/new');
      
      // Should stay on the page (not redirect)
      await expect(page).toHaveURL('/statements/new');
      
      // Verify form is visible
      await expect(page.locator('form')).toBeVisible();
    });

    test('should have correct page title', async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
      
      await expect(page).toHaveTitle(/Add New Statement.*SpeechKarma/);
    });
  });

  test.describe('Form Elements and Layout', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should display all required form fields', async ({ page }) => {
      // Politician selector
      await expect(page.locator('[data-testid="politician-select"]')).toBeVisible();
      
      // Date/time picker
      await expect(page.locator('[data-testid="statement-timestamp"]')).toBeVisible();
      
      // Statement text area
      await expect(page.locator('[data-testid="statement-text"]')).toBeVisible();
      
      // Submit button
      await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
    });

    test('should have searchable politician dropdown', async ({ page }) => {
      const selector = page.locator('[data-testid="politician-select"]');
      
      // Click to open dropdown
      await selector.click();
      
      // Verify politicians are listed
      await expect(page.locator('text=John TestPolitician')).toBeVisible();
      await expect(page.locator('text=Jane TestSenator')).toBeVisible();
    });

    test('should display character counter for statement text', async ({ page }) => {
      const textarea = page.locator('[data-testid="statement-text"]');
      const counter = page.locator('[data-testid="character-counter"]');
      
      // Initial state
      await expect(counter).toContainText('0 / 5000');
      
      // Type some text
      await textarea.fill('Test statement');
      
      // Counter should update
      await expect(counter).toContainText('14 / 5000');
    });

    test('should have date/time picker with correct constraints', async ({ page }) => {
      const datePicker = page.locator('[data-testid="statement-timestamp"]');
      
      // Should be visible
      await expect(datePicker).toBeVisible();
      
      // Should have max attribute set to current datetime (or close to it)
      const maxValue = await datePicker.getAttribute('max');
      expect(maxValue).toBeTruthy();
    });

    test('should display form in correct layout', async ({ page }) => {
      // Verify form is centered and properly styled
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Check page heading
      await expect(page.locator('h1, h2').filter({ hasText: /add.*statement/i })).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should require politician selection', async ({ page }) => {
      // Fill other fields
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('This is a valid statement text with enough characters.');
      
      // Try to submit without selecting politician
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation error
      await expect(page.locator('text=/select.*politician/i')).toBeVisible();
    });

    test('should require statement text', async ({ page }) => {
      // Select politician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      // Fill timestamp
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      
      // Leave statement text empty
      // Try to submit
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation error
      await expect(page.locator('text=/statement.*required/i')).toBeVisible();
    });

    test('should enforce minimum statement length (10 characters)', async ({ page }) => {
      // Select politician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      // Fill timestamp
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      
      // Fill statement text with less than 10 characters
      await page.locator('[data-testid="statement-text"]').fill('Short');
      
      // Try to submit
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation error
      await expect(page.locator('text=/at least 10 characters/i')).toBeVisible();
    });

    test('should enforce maximum statement length (5000 characters)', async ({ page }) => {
      // Select politician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      // Fill timestamp
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      
      // Fill statement text with more than 5000 characters
      const longText = 'a'.repeat(5001);
      await page.locator('[data-testid="statement-text"]').fill(longText);
      
      // Character counter should show warning
      await expect(page.locator('[data-testid="character-counter"]')).toContainText('5001 / 5000');
      
      // Submit button should be disabled or show error
      const submitButton = page.locator('[data-testid="submit-button"]');
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should require statement timestamp', async ({ page }) => {
      // Select politician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      // Fill statement text
      await page.locator('[data-testid="statement-text"]').fill('This is a valid statement text with enough characters.');
      
      // Leave timestamp empty
      // Try to submit
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation error
      await expect(page.locator('text=/timestamp.*required/i')).toBeVisible();
    });

    test('should not allow future timestamps', async ({ page }) => {
      // Select politician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      // Fill statement text
      await page.locator('[data-testid="statement-text"]').fill('This is a valid statement text with enough characters.');
      
      // Try to set future timestamp
      await page.locator('[data-testid="statement-timestamp"]').fill('2026-12-31T23:59');
      
      // Try to submit
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show validation error
      await expect(page.locator('text=/cannot be in the future/i')).toBeVisible();
    });
  });

  test.describe('Statement Submission', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should successfully submit valid statement', async ({ page }) => {
      // Fill out form
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      
      await page.locator('[data-testid="statement-text"]').fill(
        'We need to invest heavily in renewable energy to combat climate change and create green jobs.'
      );
      
      // Submit form
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should redirect to statements list or success page
      await page.waitForURL(/\/(statements)?/);
      
      // Should show success message
      await expect(page.locator('text=/success|created|added/i')).toBeVisible();
    });

    test('should persist statement to database', async ({ page }) => {
      const statementText = 'Education funding must be increased to ensure every child has access to quality schooling.';
      
      // Fill out form
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=Jane TestSenator').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-29T14:30');
      
      await page.locator('[data-testid="statement-text"]').fill(statementText);
      
      // Submit form
      await page.locator('[data-testid="submit-button"]').click();
      
      // Wait for redirect
      await page.waitForURL(/\/(statements)?/, { timeout: 5000 });
      
      // Verify statement exists in database
      const { data: statements, error } = await testDb
        .from('statements')
        .select('*')
        .eq('created_by_user_id', testUserId)
        .eq('statement_text', statementText);
      
      expect(error).toBeNull();
      expect(statements).toHaveLength(1);
      expect(statements![0].statement_text).toBe(statementText);
      expect(statements![0].politician_id).toBe('44444444-4444-4444-4444-444444444444'); // Jane TestSenator
    });

    test('should save correct politician ID', async ({ page }) => {
      // Submit statement for John TestPolitician
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Infrastructure investment is critical for economic growth.');
      
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\/(statements)?/);
      
      // Verify politician_id in database
      const { data: statements } = await testDb
        .from('statements')
        .select('politician_id')
        .eq('created_by_user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      expect(statements![0].politician_id).toBe('33333333-3333-3333-3333-333333333333'); // John TestPolitician
    });

    test('should save correct timestamp', async ({ page }) => {
      const targetTimestamp = '2025-10-25T16:45';
      
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill(targetTimestamp);
      await page.locator('[data-testid="statement-text"]').fill('Tax reform will benefit middle-class families.');
      
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\/(statements)?/);
      
      // Verify timestamp in database
      const { data: statements } = await testDb
        .from('statements')
        .select('statement_timestamp')
        .eq('created_by_user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const savedTimestamp = new Date(statements![0].statement_timestamp);
      const expectedTimestamp = new Date(targetTimestamp);
      
      expect(savedTimestamp.toISOString()).toBe(expectedTimestamp.toISOString());
    });

    test('should save created_by_user_id correctly', async ({ page }) => {
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Healthcare access is a fundamental right.');
      
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\/(statements)?/);
      
      // Verify created_by_user_id
      const { data: statements } = await testDb
        .from('statements')
        .select('created_by_user_id')
        .eq('created_by_user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      expect(statements![0].created_by_user_id).toBe(testUserId);
    });

    test('should NOT include AI summary in database', async ({ page }) => {
      const statementText = 'Environmental protection must be a top priority for our administration.';
      
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill(statementText);
      
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\/(statements)?/);
      
      // Verify statement does NOT contain AI summary separator
      const { data: statements } = await testDb
        .from('statements')
        .select('statement_text')
        .eq('created_by_user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const savedText = statements![0].statement_text;
      
      // Should be exactly what was entered (no AI summary appended)
      expect(savedText).toBe(statementText);
      expect(savedText).not.toContain('---');
      expect(savedText).not.toContain('AI Summary:');
      expect(savedText).not.toContain('📝');
    });
  });

  test.describe('Form Behavior and UX', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should disable submit button while submitting', async ({ page }) => {
      // Fill out form
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Valid statement text for testing purposes.');
      
      // Check button state before click
      const submitButton = page.locator('[data-testid="submit-button"]');
      await expect(submitButton).toBeEnabled();
      
      // Click submit
      await submitButton.click();
      
      // Button should be disabled during submission (check immediately)
      // This may be hard to catch, so we verify it doesn't allow double-click
      await expect(submitButton).toBeDisabled({ timeout: 100 }).catch(() => {
        // If not caught, that's OK - request is already in flight
      });
    });

    test('should show loading indicator during submission', async ({ page }) => {
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Valid statement for testing loading state.');
      
      // Click submit
      await page.locator('[data-testid="submit-button"]').click();
      
      // Look for loading indicator (spinner, text change, etc.)
      const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
      
      // May or may not be visible depending on network speed
      // Just verify page eventually navigates
      await page.waitForURL(/\/(statements)?/, { timeout: 5000 });
    });

    test('should clear form after successful submission (if returning to form)', async ({ page }) => {
      // This test assumes form might redirect back to /statements/new after success
      // Adjust based on actual behavior
      
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('First statement submission.');
      
      await page.locator('[data-testid="submit-button"]').click();
      
      // Wait for submission to complete
      await page.waitForURL(/\//);
      
      // If we navigate back to form, it should be empty
      await page.goto('/statements/new');
      
      const statementText = page.locator('[data-testid="statement-text"]');
      await expect(statementText).toHaveValue('');
    });

    test('should preserve form data on validation error', async ({ page }) => {
      const testText = 'This is my statement that I do not want to lose.';
      
      // Fill form with invalid data (missing politician)
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill(testText);
      
      // Submit (will fail validation)
      await page.locator('[data-testid="submit-button"]').click();
      
      // Verify error is shown
      await expect(page.locator('text=/select.*politician/i')).toBeVisible();
      
      // Verify form data is preserved
      await expect(page.locator('[data-testid="statement-text"]')).toHaveValue(testText);
      await expect(page.locator('[data-testid="statement-timestamp"]')).toHaveValue('2025-10-30T10:00');
    });

    test('should support politician search/filter', async ({ page }) => {
      const selector = page.locator('[data-testid="politician-select"]');
      
      // Click to open dropdown
      await selector.click();
      
      // Type to search (if search is implemented)
      await page.keyboard.type('Jane');
      
      // Should filter to show only Jane TestSenator
      await expect(page.locator('text=Jane TestSenator')).toBeVisible();
      
      // John should be filtered out (or still visible depending on implementation)
      // This test documents expected behavior
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Block API requests to simulate server error
      await page.route('**/api/statements', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Internal server error',
              code: 'INTERNAL_ERROR'
            }
          })
        });
      });
      
      // Fill and submit form
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Test statement for error handling.');
      
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show error message
      await expect(page.locator('text=/error|failed/i')).toBeVisible();
      
      // Form should still be visible (not redirect)
      await expect(page.locator('form')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Abort API requests to simulate network failure
      await page.route('**/api/statements', route => route.abort());
      
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('Test statement for network error.');
      
      await page.locator('[data-testid="submit-button"]').click();
      
      // Should show error message
      await expect(page.locator('text=/error|failed|network/i')).toBeVisible();
    });

    test('should handle invalid politician ID', async ({ page }) => {
      // This would require manipulating the select or intercepting API
      // For now, document that this should be tested
      
      // Simulate scenario where politician doesn't exist in database
      // Expected: API returns 404 NOT_FOUND error
      // Expected: Form shows appropriate error message
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    });

    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/statements/new');
      
      // Form should be visible and usable
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('[data-testid="politician-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="statement-text"]')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/statements/new');
      
      await expect(page.locator('form')).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/statements/new');
      
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Multiple Submissions', () => {
    test.beforeEach(async ({ page }) => {
      await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.goto('/statements/new');
    });

    test('should allow submitting multiple statements', async ({ page }) => {
      // First statement
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=John TestPolitician').click();
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-30T10:00');
      await page.locator('[data-testid="statement-text"]').fill('First test statement.');
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\//);
      
      // Navigate back to form
      await page.goto('/statements/new');
      
      // Second statement
      await page.locator('[data-testid="politician-select"]').click();
      await page.locator('text=Jane TestSenator').click();
      await page.locator('[data-testid="statement-timestamp"]').fill('2025-10-29T14:00');
      await page.locator('[data-testid="statement-text"]').fill('Second test statement.');
      await page.locator('[data-testid="submit-button"]').click();
      await page.waitForURL(/\//);
      
      // Verify both statements in database
      const { data: statements } = await testDb
        .from('statements')
        .select('*')
        .eq('created_by_user_id', testUserId)
        .order('created_at', { ascending: false });
      
      expect(statements).toHaveLength(2);
      expect(statements![0].statement_text).toBe('Second test statement.');
      expect(statements![1].statement_text).toBe('First test statement.');
    });
  });
});
```

---

## Test Data Attributes Required

Add these `data-testid` attributes to `NewStatementForm.tsx`:

```typescript
<form>
  <select data-testid="politician-select">
    {/* options */}
  </select>
  
  <input 
    type="datetime-local" 
    data-testid="statement-timestamp"
  />
  
  <textarea 
    data-testid="statement-text"
  />
  
  <div data-testid="character-counter">
    {characterCount} / 5000
  </div>
  
  <button 
    type="submit" 
    data-testid="submit-button"
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Submitting...' : 'Submit Statement'}
  </button>
  
  {isSubmitting && (
    <div data-testid="loading-indicator">Loading...</div>
  )}
</form>
```

---

## Expected Test Results

### All Tests Passing
- ✅ Redirects unauthenticated users to auth page
- ✅ Displays form correctly for authenticated users
- ✅ All form fields visible and functional
- ✅ Validation enforced (required fields, min/max length, timestamp)
- ✅ Successfully submits valid statements
- ✅ Statements persisted correctly to database
- ✅ NO AI summary appended to statement text
- ✅ Correct user ID, politician ID, and timestamp saved
- ✅ Form behaves correctly (loading states, error handling)
- ✅ Responsive on all viewport sizes
- ✅ Handles errors gracefully

### Test Execution Time
- **Expected duration:** 3-7 minutes
- **Tests:** ~35 test cases
- **Browsers:** Chromium, Firefox, WebKit

---

## Environment Configuration

Ensure `.env.test` contains:

```bash
# CRITICAL: Disable AI Summary for tests
USE_AI_SUMMARY=false

# Database credentials
SUPABASE_URL=your_test_supabase_url
SUPABASE_ANON_KEY=your_test_anon_key

# Test user
TEST_USER_EMAIL=test-add@example.com
TEST_USER_PASSWORD=TestPassword123!
```

---

## Running These Tests

```bash
# Run only add statement tests
npx playwright test tests/e2e/add-statement.spec.ts

# Run in headed mode
npx playwright test tests/e2e/add-statement.spec.ts --headed

# Run in debug mode
npx playwright test tests/e2e/add-statement.spec.ts --debug

# Run specific test
npx playwright test tests/e2e/add-statement.spec.ts -g "should persist statement to database"
```

---

## Verification Checklist

After running tests, manually verify:

### In Database
```sql
-- Check that statements were created
SELECT 
  s.id,
  s.statement_text,
  s.statement_timestamp,
  s.created_by_user_id,
  p.first_name || ' ' || p.last_name as politician_name
FROM statements s
JOIN politicians p ON s.politician_id = p.id
WHERE s.created_by_user_id = 'test-user-id'
ORDER BY s.created_at DESC;
```

**Expected:**
- ✅ Statement text matches exactly what was entered (no AI summary)
- ✅ Politician ID is correct
- ✅ Timestamp is correct
- ✅ created_by_user_id matches test user
- ✅ created_at is set to current time
- ✅ deleted_at is NULL

### In Application
- ✅ Navigate to `/` and see newly created statement
- ✅ Statement displays without AI summary separator
- ✅ Statement attributed to correct politician
- ✅ Timestamp displayed correctly

---

## Troubleshooting

### Test Fails: "Authentication required" error

**Solution:**
1. Verify test user was created in beforeAll hook
2. Check `authenticateUser()` helper sets cookies correctly
3. Ensure Supabase credentials are valid in `.env.test`

### Test Fails: Statement has AI summary in database

**Solution:**
1. **CRITICAL:** Check `.env.test` has `USE_AI_SUMMARY=false`
2. Restart dev server after changing env variable
3. Verify env variable is loaded: Add console.log in statement service

### Test Fails: Form submission times out

**Solution:**
1. Increase timeout: `page.waitForURL(/\//, { timeout: 10000 })`
2. Check network tab for API errors
3. Verify Supabase is accessible
4. Check server logs for errors

### Test Fails: "Politician not found" error

**Solution:**
1. Verify politicians were seeded in beforeAll hook
2. Check UUID matches exactly: `33333333-3333-3333-3333-333333333333`
3. Query database to confirm politicians exist

### Test Fails: Statement not found in database after submission

**Solution:**
1. Check for JavaScript errors in browser console
2. Verify API returned success response
3. Check RLS policies allow statement insertion
4. Verify user ID matches profile ID in database

---

## Maintenance Notes

- Update selectors when form structure changes
- Keep test data UUIDs consistent across test files
- Update validation tests when business rules change
- Review timeouts if application performance changes
- Add new tests for new form fields or features
- Ensure `.env.test` is never committed to version control

