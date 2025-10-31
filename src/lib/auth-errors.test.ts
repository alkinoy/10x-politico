/**
 * Unit Tests for Authentication Error Mapping
 * Tests for user-friendly error message transformation
 */

import { describe, it, expect } from "vitest";
import { mapAuthError } from "./auth-errors";

describe("Authentication Error Mapping", () => {
  describe("Invalid credentials errors", () => {
    it("should map 'invalid login credentials' to user-friendly message", () => {
      // Arrange
      const error = "invalid login credentials";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Invalid email or password. Please try again.");
    });

    it("should map 'Invalid login credentials' (capitalized) to user-friendly message", () => {
      // Arrange
      const error = "Invalid login credentials";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Invalid email or password. Please try again.");
    });

    it("should map 'invalid email or password' to user-friendly message", () => {
      // Arrange
      const error = "invalid email or password";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Invalid email or password. Please try again.");
    });

    it("should handle case variations of invalid credentials", () => {
      // Arrange
      const errors = ["INVALID LOGIN CREDENTIALS", "Invalid Login Credentials", "InVaLiD lOgIn CrEdEnTiAlS"];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Invalid email or password. Please try again.");
      });
    });
  });

  describe("Email already exists errors", () => {
    it("should map 'user already registered' to user-friendly message", () => {
      // Arrange
      const error = "user already registered";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("An account with this email already exists. Please sign in instead.");
    });

    it("should map 'email already exists' to user-friendly message", () => {
      // Arrange
      const error = "email already exists";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("An account with this email already exists. Please sign in instead.");
    });

    it("should map 'already been registered' to user-friendly message", () => {
      // Arrange
      const error = "already been registered";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("An account with this email already exists. Please sign in instead.");
    });

    it("should handle variations in error messages", () => {
      // Arrange
      const errors = [
        "User already registered",
        "Email already exists in database",
        "This email has already been registered",
        "USER ALREADY REGISTERED",
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("An account with this email already exists. Please sign in instead.");
      });
    });
  });

  describe("Weak password errors", () => {
    it("should map password too weak error to user-friendly message", () => {
      // Arrange
      const error = "password is too weak";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Password must be at least 6 characters long.");
    });

    it("should map password too short error to user-friendly message", () => {
      // Arrange
      const error = "password is too short";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Password must be at least 6 characters long.");
    });

    it("should map 'password must be at least' error to user-friendly message", () => {
      // Arrange
      const error = "password must be at least 6 characters";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Password must be at least 6 characters long.");
    });

    it("should handle complex password validation errors", () => {
      // Arrange
      const errors = [
        "Password is weak and should contain at least 6 characters",
        "Your password is too short, minimum 8 characters",
        "Password requirements: must be at least 6 characters",
        "PASSWORD IS TOO WEAK",
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Password must be at least 6 characters long.");
      });
    });
  });

  describe("Invalid email format errors", () => {
    it("should map 'invalid email' to user-friendly message", () => {
      // Arrange
      const error = "invalid email";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Please enter a valid email address.");
    });

    it("should map 'invalid email format' to user-friendly message", () => {
      // Arrange
      const error = "invalid email format";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Please enter a valid email address.");
    });

    it("should handle case variations", () => {
      // Arrange
      const errors = ["Invalid email", "INVALID EMAIL ADDRESS", "Invalid email format"];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Please enter a valid email address.");
      });
    });
  });

  describe("Rate limiting errors", () => {
    it("should map 'rate limit' to user-friendly message", () => {
      // Arrange
      const error = "rate limit exceeded";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Too many attempts. Please wait a moment and try again.");
    });

    it("should map 'too many requests' to user-friendly message", () => {
      // Arrange
      const error = "too many requests";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Too many attempts. Please wait a moment and try again.");
    });

    it("should handle various rate limit messages", () => {
      // Arrange
      const errors = [
        "Rate limit exceeded, please try again later",
        "Too many requests from this IP",
        "You've made too many requests",
        "RATE LIMIT EXCEEDED",
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Too many attempts. Please wait a moment and try again.");
      });
    });
  });

  describe("Email confirmation errors", () => {
    it("should map 'email not confirmed' to user-friendly message", () => {
      // Arrange
      const error = "email not confirmed";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Please check your email and confirm your account before signing in.");
    });

    it("should map 'confirm your email' to user-friendly message", () => {
      // Arrange
      const error = "please confirm your email";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Please check your email and confirm your account before signing in.");
    });

    it("should handle confirmation requirement messages", () => {
      // Arrange
      const errors = [
        "Email not confirmed yet",
        "You need to confirm your email first",
        "Please confirm your email address",
        "EMAIL NOT CONFIRMED",
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Please check your email and confirm your account before signing in.");
      });
    });
  });

  describe("Network errors", () => {
    it("should map 'network error' to user-friendly message", () => {
      // Arrange
      const error = "network error";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Unable to connect. Please check your internet connection and try again.");
    });

    it("should map 'fetch failed' to user-friendly message", () => {
      // Arrange
      const error = "fetch failed";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Unable to connect. Please check your internet connection and try again.");
    });

    it("should map 'connection error' to user-friendly message", () => {
      // Arrange
      const error = "connection error";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Unable to connect. Please check your internet connection and try again.");
    });

    it("should handle various network-related errors", () => {
      // Arrange
      const errors = [
        "Network request failed",
        "Failed to fetch from server",
        "Connection timeout",
        "NETWORK ERROR OCCURRED",
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe("Unable to connect. Please check your internet connection and try again.");
      });
    });
  });

  describe("Edge cases and fallback behavior", () => {
    it("should return original message for unknown error", () => {
      // Arrange
      const error = "Some unknown database error occurred";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Some unknown database error occurred");
    });

    it("should return generic message for empty string", () => {
      // Arrange
      const error = "";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("An unexpected error occurred. Please try again.");
    });

    it("should handle whitespace-only errors", () => {
      // Arrange
      const error = "   ";

      // Act
      const result = mapAuthError(error);

      // Assert
      // Non-empty string, so returns original
      expect(result).toBe("   ");
    });

    it("should preserve original error for specific non-auth errors", () => {
      // Arrange
      const errors = ["Database query failed", "Unexpected server error", "Session expired", "Token malformed"];

      // Act & Assert
      errors.forEach((error) => {
        expect(mapAuthError(error)).toBe(error);
      });
    });
  });

  describe("Complex and compound errors", () => {
    it("should match first applicable pattern in compound errors", () => {
      // Arrange - error contains both "password" and "weak" -> should match password validation
      const error = "Authentication failed: password is too weak";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Password must be at least 6 characters long.");
    });

    it("should handle errors with additional context", () => {
      // Arrange
      const error = "Error: invalid login credentials. Please check your input.";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Invalid email or password. Please try again.");
    });

    it("should prioritize more specific patterns", () => {
      // Arrange - contains "email" but in context of "invalid email" not "email exists"
      const error = "The email address format is invalid email";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Please enter a valid email address.");
    });
  });

  describe("Case sensitivity handling", () => {
    it("should handle mixed case errors correctly", () => {
      // Arrange
      const errors = [
        "Invalid Login Credentials",
        "User Already Registered",
        "Rate Limit Exceeded",
        "Network Error Occurred",
      ];

      // Act & Assert
      expect(mapAuthError(errors[0])).toBe("Invalid email or password. Please try again.");
      expect(mapAuthError(errors[1])).toBe("An account with this email already exists. Please sign in instead.");
      expect(mapAuthError(errors[2])).toBe("Too many attempts. Please wait a moment and try again.");
      expect(mapAuthError(errors[3])).toBe("Unable to connect. Please check your internet connection and try again.");
    });

    it("should handle ALL CAPS errors", () => {
      // Arrange
      const errors = ["INVALID LOGIN CREDENTIALS", "PASSWORD TOO WEAK", "RATE LIMIT EXCEEDED", "EMAIL NOT CONFIRMED"];

      // Act & Assert
      expect(mapAuthError(errors[0])).toBe("Invalid email or password. Please try again.");
      expect(mapAuthError(errors[1])).toBe("Password must be at least 6 characters long.");
      expect(mapAuthError(errors[2])).toBe("Too many attempts. Please wait a moment and try again.");
      expect(mapAuthError(errors[3])).toBe("Please check your email and confirm your account before signing in.");
    });
  });

  describe("Real-world Supabase error messages", () => {
    it("should handle actual Supabase invalid credentials error", () => {
      // Arrange
      const error = "Invalid login credentials";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Invalid email or password. Please try again.");
    });

    it("should handle actual Supabase duplicate user error", () => {
      // Arrange
      const error = "User already registered";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("An account with this email already exists. Please sign in instead.");
    });

    it("should handle actual Supabase weak password error", () => {
      // Arrange
      const error = "Password should be at least 6 characters";

      // Act
      const result = mapAuthError(error);

      // Assert
      expect(result).toBe("Password must be at least 6 characters long.");
    });
  });
});
