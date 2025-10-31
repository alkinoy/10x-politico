# Testing Guide for SpeechKarma

## Quick Start

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI (visual test runner)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test File Organization

```
src/
├── lib/
│   ├── auth-errors.test.ts          # ✅ 37 tests - Error message mapping
│   ├── openrouter-errors.test.ts    # ✅ 41 tests - Error class hierarchy
│   └── utils/
│       ├── auth.test.ts             # ✅ 26 tests - Auth & permissions
│       └── validation.test.ts       # ✅ 24 tests - Input validation
├── types.test.ts                    # ✅ 20 tests - Type guards
├── components/ui/
│   └── button.test.tsx              # ✅ 15 tests - Button component
└── pages/api/
    ├── health.test.ts               # ✅ 5 tests - Health endpoint
    └── auth/
        └── signout.test.ts          # ✅ 3 tests - Sign-out endpoint
```

## Writing New Tests

### Test File Naming
- Place test files next to the code they test
- Use `.test.ts` for TypeScript utilities
- Use `.test.tsx` for React components
- Mirror the source file name: `foo.ts` → `foo.test.ts`

### Test Structure Template

```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "./module";

describe("Module Name", () => {
  describe("functionToTest", () => {
    it("should handle happy path scenario", () => {
      // Arrange
      const input = "test input";
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe("expected output");
    });

    it("should handle edge case", () => {
      // Arrange
      const input = null;
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### Best Practices

#### 1. Follow Arrange-Act-Assert Pattern
```typescript
it("should validate email format", () => {
  // Arrange - Set up test data
  const email = "test@example.com";
  
  // Act - Execute the function
  const isValid = validateEmail(email);
  
  // Assert - Verify the result
  expect(isValid).toBe(true);
});
```

#### 2. Write Descriptive Test Names
```typescript
// ❌ Bad - Too vague
it("works", () => { ... });

// ✅ Good - Clear and specific
it("should return true when email format is valid", () => { ... });
```

#### 3. Test Edge Cases
Always test:
- Empty values (`""`, `null`, `undefined`)
- Boundary conditions (min/max values)
- Invalid types
- Case sensitivity
- Whitespace handling

```typescript
describe("validatePaginationParams", () => {
  it("should return default values for undefined input", () => { ... });
  it("should enforce minimum page of 1", () => { ... });
  it("should enforce maximum limit of 100", () => { ... });
  it("should handle negative values", () => { ... });
});
```

#### 4. Group Related Tests
```typescript
describe("Authentication Utilities", () => {
  describe("canUserModifyResource", () => {
    describe("Authentication checks", () => {
      it("should return false when user is not authenticated", () => { ... });
      it("should return false when user is not the owner", () => { ... });
    });
    
    describe("Grace period checks", () => {
      it("should return true within grace period", () => { ... });
      it("should return false after grace period", () => { ... });
    });
  });
});
```

#### 5. Mock External Dependencies
```typescript
import { vi } from "vitest";

// Mock at the top of the file
vi.mock("@/db/client", () => ({
  getSupabaseClient: vi.fn(() => ({
    // Mock implementation
  })),
}));

describe("Service tests", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks between tests
  });
  
  it("should call database with correct params", async () => {
    // Test implementation
  });
});
```

## Testing Cheat Sheet

### Common Assertions

```typescript
// Equality
expect(value).toBe(expected);           // Strict equality (===)
expect(value).toEqual(expected);        // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(value).toBeCloseTo(0.3);         // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain("substring");

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(object).toHaveProperty("key");
expect(object).toMatchObject({ key: "value" });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("error message");
expect(() => fn()).toThrow(CustomError);

// Instances
expect(instance).toBeInstanceOf(Class);
```

### Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("should handle button click", async () => {
  // Arrange
  const user = userEvent.setup();
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  // Act
  await user.click(screen.getByRole("button"));
  
  // Assert
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Mocking Date.now()

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  const NOW = new Date("2024-01-15T12:00:00.000Z").getTime();
  vi.spyOn(Date, "now").mockReturnValue(NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

## Test Coverage Guidelines

### Current Coverage (76.19%)

| Priority | Coverage Target | Status |
|----------|----------------|--------|
| Utility Functions | 100% | ✅ Achieved |
| Type Guards | 100% | ✅ Achieved |
| Error Handlers | 100% | ✅ Achieved |
| Business Logic | 80%+ | 🔄 In Progress |
| API Endpoints | 80%+ | 📝 Planned |
| UI Components | 60%+ | 📝 Planned |

### What to Test

✅ **Always Test:**
- Pure functions
- Business logic
- Validation functions
- Error handling
- Edge cases
- Permission checks
- Data transformations

⚠️ **Consider Testing:**
- Complex component logic
- Form validation
- State management
- API request/response handling

❌ **Don't Test:**
- Third-party libraries
- Framework internals
- Trivial getters/setters
- Simple presentational components
- Configuration files

## Continuous Integration

Tests run automatically on:
- Pre-commit (via husky)
- Pull requests
- Main branch pushes

### Pre-commit Hook
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"  // Run tests for changed files
    ]
  }
}
```

## Debugging Tests

### Run Specific Test File
```bash
npx vitest src/lib/auth-errors.test.ts
```

### Run Tests Matching Pattern
```bash
npx vitest -t "grace period"
```

### Debug in VSCode
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

### View Coverage HTML Report
```bash
npm run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

## Common Issues & Solutions

### Issue: Tests timeout
```typescript
// Increase timeout for slow tests
it("should handle long operation", async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Async tests not completing
```typescript
// ❌ Missing await
it("should fetch data", () => {
  const result = fetchData(); // Returns Promise
  expect(result).toBe(data);  // Won't work!
});

// ✅ Proper async handling
it("should fetch data", async () => {
  const result = await fetchData();
  expect(result).toBe(data);
});
```

### Issue: Flaky tests
```typescript
// ❌ Tests depend on execution order
let sharedState = 0;
it("test 1", () => { sharedState++; });
it("test 2", () => { expect(sharedState).toBe(1); }); // Flaky!

// ✅ Independent tests
it("test 1", () => {
  const state = 0;
  expect(state + 1).toBe(1);
});
it("test 2", () => {
  const state = 0;
  expect(state).toBe(0);
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Test Coverage Report](./.ai/unit-tests-summary.md)
- [Project Test Plan](./.ai/testplans/)

## Getting Help

1. Check existing test files for examples
2. Review the [unit-tests-summary.md](./.ai/unit-tests-summary.md)
3. Ask team members in #testing channel
4. Consult Vitest documentation

---

**Remember:** Good tests are:
- ✅ Fast
- ✅ Independent
- ✅ Repeatable
- ✅ Self-validating
- ✅ Timely (written with the code)

