/**
 * OpenRouter Service Error Types
 *
 * Custom error classes for different failure scenarios when interacting
 * with the OpenRouter API. These errors provide specific context and
 * status codes for different types of failures.
 */

/**
 * Base error class for all OpenRouter-related errors
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Error thrown when API key is missing or invalid
 */
export class OpenRouterAuthError extends OpenRouterError {
  constructor(message = "OpenRouter API key is missing or invalid") {
    super(message, 401);
    this.name = "OpenRouterAuthError";
  }
}

/**
 * Error thrown when request validation fails
 */
export class OpenRouterValidationError extends OpenRouterError {
  constructor(
    message: string,
    public validationErrors?: string[]
  ) {
    super(message, 400);
    this.name = "OpenRouterValidationError";
  }
}

/**
 * Error thrown when API rate limits are exceeded
 */
export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(
    message = "OpenRouter API rate limit exceeded",
    public retryAfter?: number
  ) {
    super(message, 429);
    this.name = "OpenRouterRateLimitError";
  }
}

/**
 * Error thrown when the model is not available or doesn't exist
 */
export class OpenRouterModelError extends OpenRouterError {
  constructor(
    message: string,
    public modelId?: string
  ) {
    super(message, 404);
    this.name = "OpenRouterModelError";
  }
}

/**
 * Error thrown when response parsing fails
 */
export class OpenRouterParseError extends OpenRouterError {
  constructor(
    message: string,
    public rawContent?: string
  ) {
    super(message);
    this.name = "OpenRouterParseError";
  }
}

/**
 * Error thrown for network-related failures
 */
export class OpenRouterNetworkError extends OpenRouterError {
  constructor(
    message = "Network error while communicating with OpenRouter",
    public originalError?: Error
  ) {
    super(message);
    this.name = "OpenRouterNetworkError";
  }
}
