# Testing Guide

This project uses **Vitest** as the testing framework, which provides a fast and modern testing experience for TypeScript, React, and API endpoints.

## Quick Start

```bash
# Pre-push check: Run linting and tests
make pp

# Show all available commands
make help
```

## Running Tests

```bash
# Using Makefile (recommended)
make test              # Run all tests once
make test-watch        # Run tests in watch mode
make test-coverage     # Run tests with coverage report
make lint              # Run linter
make lint-fix          # Run linter with auto-fix
make pp                # Run lint + tests (pre-push check)

# Using npm scripts directly
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Run tests with UI interface
npm run test:coverage  # Run tests with coverage report
```

## Test Structure

Tests are located alongside the source files with the following naming convention:
- `*.test.ts` - TypeScript/API tests
- `*.test.tsx` - React component tests

### Example Test Locations

```
src/
├── lib/utils/
│   ├── validation.ts
│   └── validation.test.ts          # Utility function tests
├── pages/api/
│   ├── health.ts
│   └── health.test.ts              # API endpoint tests
└── components/ui/
    ├── button.tsx
    └── button.test.tsx             # React component tests
```

## Testing Libraries

The project includes the following testing libraries:

- **vitest** - Test runner and assertion library
- **@vitest/ui** - Optional UI for running tests
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM elements
- **@testing-library/user-event** - User interaction simulation
- **happy-dom** - Lightweight DOM implementation for tests

## Writing Tests

### Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from './your-module';

describe('yourFunction', () => {
  it('should do something', () => {
    expect(yourFunction('input')).toBe('expected');
  });
});
```

### API Endpoint Tests

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from './endpoint';

describe('API Endpoint', () => {
  it('should return 200', async () => {
    const response = await GET({} as any);
    expect(response.status).toBe(200);
  });
});
```

### React Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render', () => {
    render(<YourComponent />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle clicks', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    await user.click(screen.getByRole('button'));
    // assertions...
  });
});
```

## CI/CD Integration

Tests are automatically run in the CI pipeline on every push and pull request. The test job runs after the build step and must pass for the pipeline to succeed.

## Coverage

To generate a coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory and include:
- Text summary in the console
- JSON report for tooling
- HTML report for detailed browsing

## Best Practices

1. **Write tests alongside code** - Place test files next to the source files they test
2. **Test behavior, not implementation** - Focus on what the code does, not how it does it
3. **Use descriptive test names** - Make it clear what each test is verifying
4. **Keep tests isolated** - Each test should be independent and not rely on other tests
5. **Mock external dependencies** - Use mocks for API calls, databases, etc.
6. **Test edge cases** - Don't just test the happy path

## Example Tests

The project includes example tests for:
- ✅ Validation utilities (`src/lib/utils/validation.test.ts`)
- ✅ API health endpoint (`src/pages/api/health.test.ts`)
- ✅ Button component (`src/components/ui/button.test.tsx`)

These examples demonstrate best practices for testing different types of code in the project.

