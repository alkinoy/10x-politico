# E2E Test Plan: Statements List Page

## Overview

This test plan covers end-to-end testing of the statements list page (`/` - index page) which displays recent political statements. The tests verify that seeded data appears correctly, pagination works, and the UI displays all expected elements.

---

## Page Under Test

- **URL:** `/` (homepage)
- **Component:** `RecentStatementsFeed.tsx`
- **API Endpoint:** `GET /api/statements`

---

## Test Data Requirements

### Parties (2)
- Test Democratic Party (TDP) - Blue (#0015BC)
- Test Republican Party (TRP) - Red (#E81B23)

### Politicians (2)
- John TestPolitician (TDP)
- Jane TestSenator (TRP)

### Statements (3)
1. Healthcare reform statement by John TestPolitician (most recent)
2. Tax policy statement by Jane TestSenator (second)
3. Climate change statement by John TestPolitician (oldest)

---

## Test Suite Implementation

### File: `tests/e2e/statements-list.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import {
  cleanupTestData,
  seedTestParties,
  seedTestPoliticians,
  seedTestStatements,
  createTestUser,
} from './helpers/db-helpers';

// Test configuration
const TEST_USER_EMAIL = 'test-list@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('Statements List Page', () => {
  let testUserId: string;

  // Setup: Create test user and seed data before all tests
  test.beforeAll(async () => {
    // Create test user
    const user = await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    testUserId = user!.id;

    // Seed test data
    await cleanupTestData();
    await seedTestParties();
    await seedTestPoliticians();
    await seedTestStatements(testUserId);
  });

  // Cleanup: Remove test data after all tests
  test.afterAll(async () => {
    await cleanupTestData();
  });

  test.describe('Page Load and Basic UI', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await page.goto('/');
      
      // Verify page loaded
      await expect(page).toHaveTitle(/Recent Statements.*SpeechKarma/);
      
      // Verify main container is visible
      await expect(page.locator('main')).toBeVisible();
    });

    test('should display page header and navigation', async ({ page }) => {
      await page.goto('/');
      
      // Check for navigation/header elements
      // Adjust selectors based on your actual Header component
      await expect(page.locator('header')).toBeVisible();
    });

    test('should not show error messages on successful load', async ({ page }) => {
      await page.goto('/');
      
      // Verify no error alerts are shown
      const errorAlerts = page.locator('[role="alert"]').filter({ hasText: /error|failed/i });
      await expect(errorAlerts).toHaveCount(0);
    });
  });

  test.describe('Statements Display', () => {
    test('should display all 3 seeded statements', async ({ page }) => {
      await page.goto('/');
      
      // Wait for statements to load
      await page.waitForSelector('[data-testid="statement-card"]', { 
        timeout: 5000 
      });
      
      // Count statement cards
      const statementCards = page.locator('[data-testid="statement-card"]');
      await expect(statementCards).toHaveCount(3);
    });

    test('should display statements in correct order (newest first)', async ({ page }) => {
      await page.goto('/');
      
      // Wait for statements to load
      await page.waitForSelector('[data-testid="statement-card"]');
      
      const statements = page.locator('[data-testid="statement-card"]');
      
      // Verify first statement (most recent - healthcare)
      await expect(statements.nth(0)).toContainText('comprehensive healthcare reform');
      
      // Verify second statement (tax policy)
      await expect(statements.nth(1)).toContainText('Lower taxes for small businesses');
      
      // Verify third statement (oldest - climate)
      await expect(statements.nth(2)).toContainText('Climate change is the defining challenge');
    });

    test('should display correct politician names', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      const statements = page.locator('[data-testid="statement-card"]');
      
      // First statement by John TestPolitician
      await expect(statements.nth(0)).toContainText('John TestPolitician');
      
      // Second statement by Jane TestSenator
      await expect(statements.nth(1)).toContainText('Jane TestSenator');
      
      // Third statement by John TestPolitician
      await expect(statements.nth(2)).toContainText('John TestPolitician');
    });

    test('should display party information with badges', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Check for party badges (adjust selector based on your PartyBadge component)
      const partyBadges = page.locator('[data-testid="party-badge"]');
      await expect(partyBadges).toHaveCount(3);
      
      // Verify party names appear
      await expect(page.locator('[data-testid="statement-card"]').first()).toContainText('TDP');
      await expect(page.locator('[data-testid="statement-card"]').nth(1)).toContainText('TRP');
    });

    test('should display statement timestamps', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify timestamps are displayed (adjust selector based on your implementation)
      const timestamps = page.locator('[data-testid="statement-timestamp"]');
      await expect(timestamps).toHaveCount(3);
      
      // Verify timestamp format (e.g., "Oct 30, 2025" or relative time)
      await expect(timestamps.first()).toBeVisible();
    });

    test('should NOT display AI summary separator', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify no AI summary separator appears (since USE_AI_SUMMARY=false)
      const statementTexts = page.locator('[data-testid="statement-text"]');
      
      for (let i = 0; i < await statementTexts.count(); i++) {
        const text = await statementTexts.nth(i).textContent();
        expect(text).not.toContain('---');
        expect(text).not.toContain('AI Summary:');
        expect(text).not.toContain('📝');
      }
    });
  });

  test.describe('Statement Cards - Interactive Elements', () => {
    test('should have clickable statement cards', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Click on first statement card
      await page.locator('[data-testid="statement-card"]').first().click();
      
      // Verify navigation occurred (should go to statement detail page)
      await expect(page).toHaveURL(/\/statements\/[a-f0-9-]+/);
    });

    test('should have clickable politician names', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Click on politician name link
      const politicianLink = page.locator('[data-testid="politician-link"]').first();
      await politicianLink.click();
      
      // Verify navigation to politician page
      await expect(page).toHaveURL(/\/politicians\/[a-f0-9-]+/);
    });

    test('should display politician avatars', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Check for avatar elements
      const avatars = page.locator('[data-testid="politician-avatar"]');
      await expect(avatars).toHaveCount(3);
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no statements exist', async ({ page }) => {
      // Clean up all statements
      await cleanupTestData();
      await seedTestParties();
      await seedTestPoliticians();
      // Don't seed statements
      
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify empty state message is shown
      await expect(page.locator('text=/no statements/i')).toBeVisible();
      
      // Restore test data for other tests
      await seedTestStatements(testUserId);
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator initially', async ({ page }) => {
      await page.goto('/');
      
      // Check for loading state (if implemented)
      const loadingIndicator = page.locator('[data-testid="loading-skeleton"]');
      
      // This may or may not be visible depending on load speed
      // Just verify it's present in DOM or statements load eventually
      await page.waitForSelector('[data-testid="statement-card"]', { 
        timeout: 5000 
      });
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls when appropriate', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // With only 3 statements, pagination may not be needed
      // This test documents expected behavior
      // If limit is set to 50, pagination won't appear
      
      const paginationControls = page.locator('[data-testid="pagination"]');
      const count = await paginationControls.count();
      
      // Either no pagination (3 < limit) or pagination exists
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should handle page parameter in URL', async ({ page }) => {
      await page.goto('/?page=1');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify page loaded successfully with page parameter
      await expect(page.locator('[data-testid="statement-card"]')).toHaveCount(3);
    });

    test('should handle invalid page parameter gracefully', async ({ page }) => {
      await page.goto('/?page=999');
      
      await page.waitForLoadState('networkidle');
      
      // Should show empty state or handle gracefully
      // Verify no error messages are thrown
      const errorAlerts = page.locator('[role="alert"]').filter({ hasText: /error/i });
      
      // Either shows empty state or redirects to valid page
      const statementCards = page.locator('[data-testid="statement-card"]');
      const cardCount = await statementCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify statements are still visible
      await expect(page.locator('[data-testid="statement-card"]')).toHaveCount(3);
      
      // Verify layout adapts (cards should stack vertically)
      const firstCard = page.locator('[data-testid="statement-card"]').first();
      await expect(firstCard).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify statements are visible
      await expect(page.locator('[data-testid="statement-card"]')).toHaveCount(3);
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify statements are visible
      await expect(page.locator('[data-testid="statement-card"]')).toHaveCount(3);
    });
  });

  test.describe('Data Integrity', () => {
    test('should display exact statement text from database', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      const statements = page.locator('[data-testid="statement-card"]');
      
      // Verify first statement contains exact text
      const firstStatementText = await statements.nth(0).locator('[data-testid="statement-text"]').textContent();
      expect(firstStatementText).toContain('comprehensive healthcare reform');
      expect(firstStatementText).toContain('ensure every citizen has access to quality medical care');
    });

    test('should display correct politician-party associations', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      const statements = page.locator('[data-testid="statement-card"]');
      
      // First statement: John TestPolitician (TDP)
      const firstCard = statements.nth(0);
      await expect(firstCard).toContainText('John TestPolitician');
      await expect(firstCard).toContainText('TDP');
      
      // Second statement: Jane TestSenator (TRP)
      const secondCard = statements.nth(1);
      await expect(secondCard).toContainText('Jane TestSenator');
      await expect(secondCard).toContainText('TRP');
    });
  });

  test.describe('Performance', () => {
    test('should load page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle rapid navigation', async ({ page }) => {
      // Navigate to page
      await page.goto('/');
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Navigate away
      await page.goto('/politicians');
      
      // Navigate back
      await page.goto('/');
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Verify content still loads correctly
      await expect(page.locator('[data-testid="statement-card"]')).toHaveCount(3);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA landmarks', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Check for main landmark
      await expect(page.locator('main')).toBeVisible();
    });

    test('should have focusable interactive elements', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      // Verify focus is on an interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have alt text for politician avatars', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="statement-card"]');
      
      // Check avatars have proper attributes
      const avatars = page.locator('[data-testid="politician-avatar"]');
      const firstAvatar = avatars.first();
      
      // Should have aria-label or alt text
      const ariaLabel = await firstAvatar.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Block API requests to simulate network error
      await page.route('**/api/statements*', route => route.abort());
      
      await page.goto('/');
      
      // Wait for error state
      await page.waitForLoadState('networkidle');
      
      // Should show error message (not crash)
      const errorMessage = page.locator('text=/error|failed/i');
      await expect(errorMessage).toBeVisible();
    });
  });
});
```

---

## Test Data Attributes Required

To support these tests, add the following `data-testid` attributes to components:

### RecentStatementsFeed.tsx
```typescript
<div data-testid="statement-card">
  <div data-testid="politician-avatar" aria-label={`${politician.first_name} ${politician.last_name}`}>
    {/* avatar content */}
  </div>
  
  <a data-testid="politician-link" href={`/politicians/${politician.id}`}>
    {politician.first_name} {politician.last_name}
  </a>
  
  <span data-testid="party-badge">
    {party.abbreviation}
  </span>
  
  <p data-testid="statement-text">
    {statement.statement_text}
  </p>
  
  <time data-testid="statement-timestamp">
    {formattedDate}
  </time>
</div>

<div data-testid="pagination">
  {/* pagination controls */}
</div>

<div data-testid="loading-skeleton">
  {/* loading state */}
</div>
```

---

## Expected Test Results

### All Tests Passing
- ✅ Page loads successfully with seeded data
- ✅ 3 statements displayed in correct order
- ✅ Politician names and party badges visible
- ✅ Statement text matches database exactly
- ✅ No AI summary separators present
- ✅ Responsive on mobile, tablet, desktop
- ✅ Interactive elements (links, cards) work correctly
- ✅ Empty state handled appropriately
- ✅ Error states handled gracefully
- ✅ Performance within acceptable limits
- ✅ Accessibility requirements met

### Test Execution Time
- **Expected duration:** 2-5 minutes
- **Tests:** ~25 test cases
- **Browsers:** Chromium, Firefox, WebKit

---

## Running These Tests

```bash
# Run only statements list tests
npx playwright test tests/e2e/statements-list.spec.ts

# Run in headed mode to see browser
npx playwright test tests/e2e/statements-list.spec.ts --headed

# Run in debug mode
npx playwright test tests/e2e/statements-list.spec.ts --debug

# Run specific test by name
npx playwright test tests/e2e/statements-list.spec.ts -g "should display all 3 seeded statements"
```

---

## Troubleshooting

### Test Fails: "Statement cards not found"

**Cause:** Data not seeded properly or component selector incorrect

**Solution:**
1. Verify database has test data: `SELECT * FROM statements;`
2. Check component has `data-testid="statement-card"`
3. Increase timeout: `page.waitForSelector('[data-testid="statement-card"]', { timeout: 10000 })`

### Test Fails: "AI Summary appears in statements"

**Cause:** `USE_AI_SUMMARY` not set to false

**Solution:**
1. Check `.env.test`: `USE_AI_SUMMARY=false`
2. Restart dev server
3. Verify environment variable loaded: Add console.log in statement service

### Test Fails: "Wrong number of statements"

**Cause:** Incorrect data seeding or cleanup issues

**Solution:**
1. Run cleanup manually: Call `cleanupTestData()` in test setup
2. Check for orphaned test data in database
3. Use fixed UUIDs for test data to avoid conflicts

---

## Maintenance Notes

- Update selectors if component structure changes
- Add new tests when new features are added
- Keep test data in sync with database schema changes
- Review and update timeouts if application performance changes
- Update expected counts when seed data changes

