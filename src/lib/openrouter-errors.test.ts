/**
 * Unit Tests for OpenRouter Error Classes
 * Tests for custom error types and their properties
 */

import { describe, it, expect } from "vitest";
import {
  OpenRouterError,
  OpenRouterAuthError,
  OpenRouterValidationError,
  OpenRouterRateLimitError,
  OpenRouterModelError,
  OpenRouterParseError,
  OpenRouterNetworkError,
} from "./openrouter-errors";

describe("OpenRouter Error Classes", () => {
  describe("OpenRouterError (base class)", () => {
    it("should create error with message", () => {
      // Arrange & Act
      const error = new OpenRouterError("Something went wrong");

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error.message).toBe("Something went wrong");
      expect(error.name).toBe("OpenRouterError");
    });

    it("should create error with message and status code", () => {
      // Arrange & Act
      const error = new OpenRouterError("Bad request", 400);

      // Assert
      expect(error.message).toBe("Bad request");
      expect(error.statusCode).toBe(400);
    });

    it("should create error with all parameters", () => {
      // Arrange
      const responseBody = { error: "detailed error" };

      // Act
      const error = new OpenRouterError("Request failed", 500, responseBody);

      // Assert
      expect(error.message).toBe("Request failed");
      expect(error.statusCode).toBe(500);
      expect(error.responseBody).toEqual(responseBody);
    });

    it("should have undefined statusCode when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterError("Error without status");

      // Assert
      expect(error.statusCode).toBeUndefined();
    });

    it("should have undefined responseBody when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterError("Error without response body", 400);

      // Assert
      expect(error.responseBody).toBeUndefined();
    });
  });

  describe("OpenRouterAuthError", () => {
    it("should create auth error with default message", () => {
      // Arrange & Act
      const error = new OpenRouterAuthError();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterAuthError);
      expect(error.message).toBe("OpenRouter API key is missing or invalid");
      expect(error.name).toBe("OpenRouterAuthError");
      expect(error.statusCode).toBe(401);
    });

    it("should create auth error with custom message", () => {
      // Arrange & Act
      const error = new OpenRouterAuthError("Custom auth error");

      // Assert
      expect(error.message).toBe("Custom auth error");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("OpenRouterAuthError");
    });

    it("should always have 401 status code", () => {
      // Arrange & Act
      const error1 = new OpenRouterAuthError();
      const error2 = new OpenRouterAuthError("Invalid API key");

      // Assert
      expect(error1.statusCode).toBe(401);
      expect(error2.statusCode).toBe(401);
    });
  });

  describe("OpenRouterValidationError", () => {
    it("should create validation error with message", () => {
      // Arrange & Act
      const error = new OpenRouterValidationError("Invalid request format");

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterValidationError);
      expect(error.message).toBe("Invalid request format");
      expect(error.name).toBe("OpenRouterValidationError");
      expect(error.statusCode).toBe(400);
    });

    it("should create validation error with validation errors array", () => {
      // Arrange
      const validationErrors = ["field1 is required", "field2 must be a string"];

      // Act
      const error = new OpenRouterValidationError("Validation failed", validationErrors);

      // Assert
      expect(error.message).toBe("Validation failed");
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.statusCode).toBe(400);
    });

    it("should handle empty validation errors array", () => {
      // Arrange & Act
      const error = new OpenRouterValidationError("Validation failed", []);

      // Assert
      expect(error.validationErrors).toEqual([]);
    });

    it("should have undefined validationErrors when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterValidationError("Validation failed");

      // Assert
      expect(error.validationErrors).toBeUndefined();
    });
  });

  describe("OpenRouterRateLimitError", () => {
    it("should create rate limit error with default message", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError();

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterRateLimitError);
      expect(error.message).toBe("OpenRouter API rate limit exceeded");
      expect(error.name).toBe("OpenRouterRateLimitError");
      expect(error.statusCode).toBe(429);
    });

    it("should create rate limit error with custom message", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError("Too many requests");

      // Assert
      expect(error.message).toBe("Too many requests");
      expect(error.statusCode).toBe(429);
    });

    it("should create rate limit error with retry after value", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError("Rate limit exceeded", 60);

      // Assert
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.retryAfter).toBe(60);
      expect(error.statusCode).toBe(429);
    });

    it("should have undefined retryAfter when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError();

      // Assert
      expect(error.retryAfter).toBeUndefined();
    });

    it("should handle retryAfter of 0", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError("Rate limit", 0);

      // Assert
      expect(error.retryAfter).toBe(0);
    });
  });

  describe("OpenRouterModelError", () => {
    it("should create model error with message", () => {
      // Arrange & Act
      const error = new OpenRouterModelError("Model not found");

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterModelError);
      expect(error.message).toBe("Model not found");
      expect(error.name).toBe("OpenRouterModelError");
      expect(error.statusCode).toBe(404);
    });

    it("should create model error with model ID", () => {
      // Arrange & Act
      const error = new OpenRouterModelError("Model not available", "gpt-4");

      // Assert
      expect(error.message).toBe("Model not available");
      expect(error.modelId).toBe("gpt-4");
      expect(error.statusCode).toBe(404);
    });

    it("should have undefined modelId when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterModelError("Model error");

      // Assert
      expect(error.modelId).toBeUndefined();
    });

    it("should handle full model identifier", () => {
      // Arrange & Act
      const error = new OpenRouterModelError("Model unavailable", "anthropic/claude-3.5-sonnet");

      // Assert
      expect(error.modelId).toBe("anthropic/claude-3.5-sonnet");
    });
  });

  describe("OpenRouterParseError", () => {
    it("should create parse error with message", () => {
      // Arrange & Act
      const error = new OpenRouterParseError("Failed to parse JSON");

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterParseError);
      expect(error.message).toBe("Failed to parse JSON");
      expect(error.name).toBe("OpenRouterParseError");
    });

    it("should create parse error with raw content", () => {
      // Arrange
      const rawContent = '{"invalid": json}';

      // Act
      const error = new OpenRouterParseError("Invalid JSON", rawContent);

      // Assert
      expect(error.message).toBe("Invalid JSON");
      expect(error.rawContent).toBe(rawContent);
    });

    it("should not have statusCode by default", () => {
      // Arrange & Act
      const error = new OpenRouterParseError("Parse failed");

      // Assert
      expect(error.statusCode).toBeUndefined();
    });

    it("should have undefined rawContent when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterParseError("Parse failed");

      // Assert
      expect(error.rawContent).toBeUndefined();
    });

    it("should handle empty string as raw content", () => {
      // Arrange & Act
      const error = new OpenRouterParseError("Empty response", "");

      // Assert
      expect(error.rawContent).toBe("");
    });
  });

  describe("OpenRouterNetworkError", () => {
    it("should create network error with default message", () => {
      // Arrange & Act
      const error = new OpenRouterNetworkError();

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(OpenRouterNetworkError);
      expect(error.message).toBe("Network error while communicating with OpenRouter");
      expect(error.name).toBe("OpenRouterNetworkError");
    });

    it("should create network error with custom message", () => {
      // Arrange & Act
      const error = new OpenRouterNetworkError("Connection timeout");

      // Assert
      expect(error.message).toBe("Connection timeout");
    });

    it("should create network error with original error", () => {
      // Arrange
      const originalError = new Error("fetch failed");

      // Act
      const error = new OpenRouterNetworkError("Network failure", originalError);

      // Assert
      expect(error.message).toBe("Network failure");
      expect(error.originalError).toBe(originalError);
    });

    it("should not have statusCode by default", () => {
      // Arrange & Act
      const error = new OpenRouterNetworkError();

      // Assert
      expect(error.statusCode).toBeUndefined();
    });

    it("should have undefined originalError when not provided", () => {
      // Arrange & Act
      const error = new OpenRouterNetworkError("Network error");

      // Assert
      expect(error.originalError).toBeUndefined();
    });
  });

  describe("Error inheritance and type checking", () => {
    it("should maintain proper inheritance chain", () => {
      // Arrange & Act
      const authError = new OpenRouterAuthError();
      const validationError = new OpenRouterValidationError("Invalid");
      const rateLimitError = new OpenRouterRateLimitError();

      // Assert
      expect(authError instanceof OpenRouterError).toBe(true);
      expect(authError instanceof Error).toBe(true);
      expect(validationError instanceof OpenRouterError).toBe(true);
      expect(rateLimitError instanceof OpenRouterError).toBe(true);
    });

    it("should distinguish between different error types", () => {
      // Arrange
      const authError = new OpenRouterAuthError();
      const validationError = new OpenRouterValidationError("Invalid");

      // Act & Assert
      expect(authError instanceof OpenRouterAuthError).toBe(true);
      expect(authError instanceof OpenRouterValidationError).toBe(false);
      expect(validationError instanceof OpenRouterValidationError).toBe(true);
      expect(validationError instanceof OpenRouterAuthError).toBe(false);
    });

    it("should be catchable as Error", () => {
      // Arrange
      const error = new OpenRouterAuthError();

      // Act & Assert
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("Error handling scenarios", () => {
    it("should handle error with all properties set", () => {
      // Arrange
      const responseBody = { error: { message: "Detailed error", code: "ERR_001" } };
      const error = new OpenRouterError("Request failed", 500, responseBody);

      // Act - simulate error catching
      const serialized = {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        responseBody: error.responseBody,
      };

      // Assert
      expect(serialized).toEqual({
        message: "Request failed",
        name: "OpenRouterError",
        statusCode: 500,
        responseBody: responseBody,
      });
    });

    it("should handle validation error with multiple validation messages", () => {
      // Arrange
      const validationErrors = [
        "model is required",
        "messages must be an array",
        "temperature must be between 0 and 2",
      ];

      // Act
      const error = new OpenRouterValidationError("Invalid request", validationErrors);

      // Assert
      expect(error.validationErrors).toHaveLength(3);
      expect(error.validationErrors).toContain("model is required");
    });

    it("should preserve error stack trace", () => {
      // Arrange & Act
      const error = new OpenRouterAuthError("Auth failed");

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("OpenRouterAuthError");
    });
  });

  describe("Real-world usage scenarios", () => {
    it("should create appropriate error for 401 response", () => {
      // Arrange & Act
      const error = new OpenRouterAuthError("Invalid API key provided");

      // Assert
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid API key provided");
    });

    it("should create appropriate error for 429 response with retry info", () => {
      // Arrange & Act
      const error = new OpenRouterRateLimitError("Rate limit exceeded", 120);

      // Assert
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(120);
    });

    it("should create appropriate error for invalid model", () => {
      // Arrange & Act
      const error = new OpenRouterModelError("Model does not exist", "invalid/model-name");

      // Assert
      expect(error.statusCode).toBe(404);
      expect(error.modelId).toBe("invalid/model-name");
    });

    it("should create appropriate error for network timeout", () => {
      // Arrange
      const timeoutError = new Error("ETIMEDOUT");

      // Act
      const error = new OpenRouterNetworkError("Request timed out", timeoutError);

      // Assert
      expect(error.originalError?.message).toBe("ETIMEDOUT");
    });
  });
});
