.PHONY: pp lint test dev build preview clean install help

# Pre-push: Run linting and tests
pp: lint test
	@echo "✓ All checks passed! Ready to push."

# Run linter
lint:
	@echo "Running linter..."
	@npm run lint

# Run tests
test:
	@echo "Running tests..."
	@npm test

# Run linter with auto-fix
lint-fix:
	@echo "Running linter with auto-fix..."
	@npm run lint:fix

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	@npm run test:watch

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@npm run test:coverage

# Start development server
dev:
	@npm run dev

# Build for production
build:
	@npm run build

# Preview production build
preview:
	@npm run preview

# Install dependencies
install:
	@npm ci

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/ node_modules/.vite coverage/

# Show help
help:
	@echo "Available commands:"
	@echo "  make pp             - Run linting and tests (pre-push check)"
	@echo "  make lint           - Run linter"
	@echo "  make lint-fix       - Run linter with auto-fix"
	@echo "  make test           - Run tests"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo "  make dev            - Start development server"
	@echo "  make build          - Build for production"
	@echo "  make preview        - Preview production build"
	@echo "  make install        - Install dependencies"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make help           - Show this help message"

