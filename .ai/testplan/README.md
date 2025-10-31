# E2E Test Plans - SpeechKarma

## Overview

This directory contains comprehensive end-to-end (e2e) test plans for the SpeechKarma application using Playwright. The test plans are designed to verify critical user journeys through automated browser testing.

---

## 📋 Test Plans

### 1. [Setup Guide](./00-e2e-setup.md)
**Status:** ✅ Complete  
**Purpose:** Installation, configuration, and setup for Playwright e2e testing

**Covers:**
- Playwright installation and configuration
- Environment setup (`.env.test`)
- Database helper utilities
- Authentication helpers
- CI/CD integration
- Directory structure
- Troubleshooting guide

**Start here first!** This document must be completed before running any tests.

---

### 2. [Statements List E2E Tests](./01-statements-list-e2e.md)
**Status:** ✅ Complete  
**Page:** `/` (homepage)  
**Component:** `RecentStatementsFeed.tsx`

**Test Coverage:**
- ✅ Page load and basic UI (3 tests)
- ✅ Statements display (6 tests)
- ✅ Interactive elements (3 tests)
- ✅ Empty state (1 test)
- ✅ Loading states (1 test)
- ✅ Pagination (3 tests)
- ✅ Responsive design (3 tests)
- ✅ Data integrity (2 tests)
- ✅ Performance (2 tests)
- ✅ Accessibility (3 tests)
- ✅ Error handling (1 test)

**Total Tests:** ~25  
**Key Validations:**
- Seeded data appears correctly
- Statements display in correct order
- Politician and party information visible
- No AI summary separators present
- Interactive elements work correctly

---

### 3. [Add Statement E2E Tests](./02-add-statement-e2e.md)
**Status:** ✅ Complete  
**Page:** `/statements/new`  
**Component:** `NewStatementForm.tsx`

**Test Coverage:**
- ✅ Authentication and access control (3 tests)
- ✅ Form elements and layout (5 tests)
- ✅ Form validation (6 tests)
- ✅ Statement submission (6 tests)
- ✅ Form behavior and UX (5 tests)
- ✅ Error handling (3 tests)
- ✅ Responsive design (3 tests)
- ✅ Multiple submissions (1 test)

**Total Tests:** ~35  
**Key Validations:**
- Authentication required
- Form validation works correctly
- Statements persist to database
- NO AI summary appended (critical!)
- Correct data saved (user ID, politician ID, timestamp)
- Error handling works gracefully

---

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Install Playwright
npm install -D @playwright/test
npm install -D dotenv
npx playwright install
```

### Configuration

```bash
# 2. Create .env.test file
cat > .env.test << EOF
SUPABASE_URL=your_supabase_test_url
SUPABASE_ANON_KEY=your_supabase_test_anon_key
USE_AI_SUMMARY=false
BASE_URL=http://localhost:4321
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
EOF
```

### Run Tests

```bash
# Run all e2e tests
npx playwright test

# Run specific test suite
npx playwright test tests/e2e/statements-list.spec.ts
npx playwright test tests/e2e/add-statement.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

---

## ⚠️ Critical Requirements

### AI Summary MUST Be Disabled

**In `.env.test`:**
```bash
USE_AI_SUMMARY=false
```

**Why?**
- Ensures predictable test data
- Eliminates external API dependencies
- Faster test execution
- Consistent results across runs

**Verification:**
After tests run, check database statements do NOT contain:
- `---` (separator)
- `📝 AI Summary:`
- AI-generated text

---

## 📁 Project Structure

```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── db-helpers.ts          # Database seeding & cleanup
│   │   └── auth-helpers.ts        # Authentication utilities
│   ├── statements-list.spec.ts    # Homepage tests
│   └── add-statement.spec.ts      # Add statement form tests
├── fixtures/
│   └── test-data.json             # Static test data (optional)
playwright.config.ts                # Playwright configuration
.env.test                           # Test environment variables
```

---

## 🧪 Test Data

### Fixed UUIDs for Test Data

Using consistent UUIDs makes debugging easier:

```typescript
// Parties
const TDP_ID = '11111111-1111-1111-1111-111111111111';
const TRP_ID = '22222222-2222-2222-2222-222222222222';

// Politicians
const JOHN_ID = '33333333-3333-3333-3333-333333333333';
const JANE_ID = '44444444-4444-4444-4444-444444444444';

// Statements (created during tests)
const STATEMENT_1_ID = '55555555-5555-5555-5555-555555555555';
const STATEMENT_2_ID = '66666666-6666-6666-6666-666666666666';
const STATEMENT_3_ID = '77777777-7777-7777-7777-777777777777';
```

### Test Users

```typescript
// List page tests
const TEST_USER_1 = {
  email: 'test-list@example.com',
  password: 'TestPassword123!',
};

// Add statement tests
const TEST_USER_2 = {
  email: 'test-add@example.com',
  password: 'TestPassword123!',
};
```

---

## 🔍 Database Verification

### Check Test Data Seeding

```sql
-- Verify parties
SELECT id, name, abbreviation FROM parties 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Verify politicians
SELECT id, first_name, last_name, party_id FROM politicians
WHERE id IN (
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Verify statements (after tests)
SELECT 
  id,
  politician_id,
  statement_text,
  LENGTH(statement_text) as text_length,
  statement_timestamp,
  created_by_user_id,
  created_at
FROM statements
WHERE created_by_user_id IN (
  SELECT id FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email LIKE 'test-%@example.com'
  )
)
ORDER BY created_at DESC;
```

### Verify NO AI Summary

```sql
-- Check that statements DON'T contain AI summary markers
SELECT 
  id,
  statement_text,
  CASE 
    WHEN statement_text LIKE '%---%' THEN 'HAS SEPARATOR ❌'
    WHEN statement_text LIKE '%AI Summary%' THEN 'HAS AI SUMMARY ❌'
    WHEN statement_text LIKE '%📝%' THEN 'HAS EMOJI ❌'
    ELSE 'CLEAN ✅'
  END as status
FROM statements
WHERE created_by_user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'test-%@example.com'
);
```

Expected: All statements should show `CLEAN ✅`

---

## 📊 Test Coverage Summary

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Statements List | ~25 | Page load, display, pagination, responsive, accessibility |
| Add Statement | ~35 | Auth, validation, submission, persistence, error handling |
| **Total** | **~60** | **Core user journeys** |

### Areas Covered

✅ **Authentication**
- Redirect to auth when not logged in
- Access granted when authenticated
- Session persistence

✅ **Data Display**
- Statements render correctly
- Politician information accurate
- Party badges displayed
- Timestamps formatted properly

✅ **Data Persistence**
- Statements saved to database
- Correct associations (user, politician)
- Exact text preserved (no AI modification)

✅ **Validation**
- Required fields enforced
- Min/max length constraints
- Timestamp constraints (no future dates)
- Form error messages displayed

✅ **User Experience**
- Loading states
- Error handling
- Form behavior (disable on submit)
- Responsive design (mobile, tablet, desktop)

✅ **Accessibility**
- ARIA landmarks
- Keyboard navigation
- Screen reader support
- Alt text for images

✅ **Performance**
- Page load times
- Rapid navigation handling

---

## 🐛 Common Issues and Solutions

### Issue: Tests fail with "Session not found"

**Solution:**
1. Check `.env.test` has correct Supabase credentials
2. Verify test user created in `beforeAll` hook
3. Ensure `authenticateUser()` sets cookies correctly

### Issue: Statements contain AI summary in tests

**Solution:**
1. **Check `.env.test` has `USE_AI_SUMMARY=false`**
2. Restart dev server after changing env
3. Clear test database and re-seed

### Issue: Tests timeout

**Solution:**
1. Increase timeout in test: `{ timeout: 10000 }`
2. Check application is running on correct port
3. Verify database connectivity

### Issue: Test data conflicts

**Solution:**
1. Use fixed UUIDs for test data
2. Run `cleanupTestData()` in `beforeAll` and `afterAll`
3. Isolate tests with unique data per suite

---

## 🎯 Test Execution Strategy

### Development

```bash
# Run tests in UI mode for development
npx playwright test --ui

# Run specific test while developing
npx playwright test -g "should display all 3 seeded statements"

# Run in headed mode to debug
npx playwright test --headed --debug
```

### Pre-Commit

```bash
# Run all tests before committing
npx playwright test

# Generate HTML report
npx playwright show-report
```

### CI/CD

```bash
# Run in CI mode (no retries, no browser reuse)
CI=true npx playwright test
```

See `00-e2e-setup.md` for GitHub Actions configuration.

---

## 📝 Adding New Tests

### 1. Create Test File

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { authenticateUser } from './helpers/auth-helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Update Test Plan

Create new markdown file in `.ai/testplan/`:
- `03-my-feature-e2e.md`

Include:
- Overview
- Test coverage
- Implementation code
- Expected results
- Troubleshooting

### 3. Update This README

Add new test plan to the list above.

---

## 🔄 Test Maintenance

### When to Update Tests

- ✅ Component structure changes
- ✅ New features added
- ✅ Validation rules change
- ✅ UI/UX redesign
- ✅ Database schema changes
- ✅ API endpoint changes

### Regular Maintenance Tasks

- [ ] Review and update test data
- [ ] Update timeouts if performance changes
- [ ] Add tests for new features
- [ ] Remove tests for deprecated features
- [ ] Update documentation
- [ ] Review accessibility requirements

---

## 📚 Resources

### Playwright Documentation
- [Official Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Supabase Testing
- [Testing Guide](https://supabase.com/docs/guides/testing)
- [Auth Testing](https://supabase.com/docs/guides/auth/testing)

### Project Documentation
- [PRD](./../prd.md)
- [API Documentation](../../API_ENDPOINT_DOCUMENTATION.md)
- [Database Schema](../../supabase/migrations/20251029143000_initial_schema.sql)

---

## ✅ Checklist Before Running Tests

- [ ] Playwright installed (`npx playwright --version`)
- [ ] `.env.test` created with correct values
- [ ] **`USE_AI_SUMMARY=false` in `.env.test`**
- [ ] Supabase test database accessible
- [ ] Application running on `http://localhost:4321`
- [ ] Test users created (done by test setup)
- [ ] Test data seeded (done by test setup)

---

## 📞 Support

If you encounter issues:

1. Check test plan troubleshooting sections
2. Review common issues above
3. Check Playwright logs: `playwright-report/`
4. Review test screenshots: `test-results/`
5. Enable debug mode: `npx playwright test --debug`

---

## 🎉 Success Criteria

All tests passing means:

✅ **Homepage displays statements correctly**
- Data from database appears on page
- Sorting and pagination work
- No AI summary separators visible
- Responsive on all devices

✅ **Add statement form works correctly**
- Form validation enforced
- Statements save to database
- Exact text preserved (no AI modification)
- Error handling works

✅ **Application is production-ready**
- Core user journeys verified
- Data integrity maintained
- User experience tested
- Accessibility requirements met

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Status:** ✅ Ready for Implementation

