# E2E Tests Isolation Update

## Summary

Updated e2e tests to be completely isolated from existing database data. Tests now create their own test data before running and clean up only their own data afterward.

## Changes Made

### 1. Database Helper Functions

**File:** `tests/e2e/helpers/db-helpers.ts`

Added new helper function `cleanupSpecificTestData()` that allows targeted cleanup of specific records by ID, instead of wiping the entire database.

```typescript
export async function cleanupSpecificTestData(ids: {
  statementIds?: string[];
  politicianIds?: string[];
  partyIds?: string[];
})
```

### 2. statements-list.spec.ts

**Changes:**
- Uses unique test-specific UUIDs for parties, politicians, and statements
- Creates test data inline in `beforeAll` hook instead of using shared seed functions
- Cleans up only the specific test data in `afterAll` hook
- Updated assertions to search for specific test data instead of assuming exact counts or positions
- Tests now verify presence and order of test data, not absolute database state

**Key improvements:**
- Tests check for specific statement text instead of exact card counts
- Order validation finds test statements dynamically rather than assuming positions
- Tests work correctly regardless of other data in the database

### 3. add-statement.spec.ts

**Changes:**
- Uses unique test-specific UUIDs for parties and politicians
- Creates test data inline in `beforeAll` hook
- Cleans up only the specific test data in `afterAll` hook
- Uses test-specific politician IDs in assertions

## Benefits

1. **Isolation**: Tests no longer interfere with existing seeded data
2. **Reliability**: Tests pass regardless of database state
3. **Parallel execution**: Multiple test runs can execute simultaneously without conflicts
4. **Clarity**: Each test suite clearly defines its dependencies
5. **Safety**: Cleanup only removes test-created data, preserving any existing data

## Test Data

Each test suite uses distinct data to avoid conflicts:

### statements-list.spec.ts
- **Party IDs**: `aaaaaaaa-...`, `bbbbbbbb-...`
- **Party Names**: "Test Democratic Party (List)", "Test Republican Party (List)"
- **Politician IDs**: `cccccccc-...`, `dddddddd-...`
- **Politician Names**: "John ListTest", "Jane ListSenator"
- **Statement IDs**: `eeeeeeee-...`, `ffffffff-...`, `10101010-...`

### add-statement.spec.ts
- **Party IDs**: `20202020-...`, `30303030-...`
- **Party Names**: "Test Democratic Party (Add)", "Test Republican Party (Add)"
- **Politician IDs**: `40404040-...`, `50505050-...`
- **Politician Names**: "John AddTest", "Jane AddSenator"

**Note:** Both IDs and names are unique per test suite to avoid unique constraint violations on database columns with unique indexes (e.g., `parties.name`, politician full names).

## Running the Tests

Tests can now be run safely at any time:

```bash
npm run test:e2e
```

The tests will:
1. Create their own test data with unique IDs
2. Run all test cases
3. Clean up only the data they created
4. Leave any existing database data untouched

