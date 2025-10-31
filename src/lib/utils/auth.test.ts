/**
 * Unit Tests for Authentication Utilities
 * Tests for JWT validation, user authentication, and permission checks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { canUserModifyResource, getUserFromLocals } from "./auth";

describe("Authentication Utilities", () => {
  describe("canUserModifyResource", () => {
    // Arrange: Set up a fixed time for consistent testing
    const NOW = new Date("2024-01-15T12:00:00.000Z").getTime();

    beforeEach(() => {
      // Mock Date.now() to return fixed timestamp
      vi.spyOn(Date, "now").mockReturnValue(NOW);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe("Authentication checks", () => {
      it("should return false when user is not authenticated", () => {
        // Arrange
        const resourceOwnerId = "user-123";
        const authenticatedUserId = null;
        const resourceCreatedAt = new Date(NOW).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when authenticated user is not the owner", () => {
        // Arrange
        const resourceOwnerId = "user-123";
        const authenticatedUserId = "user-456";
        const resourceCreatedAt = new Date(NOW).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("Grace period checks - default 15 minutes", () => {
      const resourceOwnerId = "user-123";
      const authenticatedUserId = "user-123";

      it("should return true when resource was created 0 seconds ago", () => {
        // Arrange - created exactly now
        const resourceCreatedAt = new Date(NOW).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true when resource was created 5 minutes ago", () => {
        // Arrange - created 5 minutes ago
        const createdAt = NOW - 5 * 60 * 1000;
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true when resource was created exactly 15 minutes ago", () => {
        // Arrange - created exactly 15 minutes ago (boundary case)
        const createdAt = NOW - 15 * 60 * 1000;
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when resource was created 15 minutes and 1 second ago", () => {
        // Arrange - created just over 15 minutes ago
        const createdAt = NOW - (15 * 60 * 1000 + 1000);
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when resource was created 30 minutes ago", () => {
        // Arrange - created 30 minutes ago (well past grace period)
        const createdAt = NOW - 30 * 60 * 1000;
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when resource was created 1 hour ago", () => {
        // Arrange - created 1 hour ago
        const createdAt = NOW - 60 * 60 * 1000;
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("Custom grace periods", () => {
      const resourceOwnerId = "user-123";
      const authenticatedUserId = "user-123";

      it("should respect custom grace period of 5 minutes", () => {
        // Arrange
        const gracePeriodMinutes = 5;
        const createdAt = NOW - 4 * 60 * 1000; // 4 minutes ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(
          resourceOwnerId,
          authenticatedUserId,
          resourceCreatedAt,
          gracePeriodMinutes
        );

        // Assert
        expect(result).toBe(true);
      });

      it("should return false after custom grace period of 5 minutes", () => {
        // Arrange
        const gracePeriodMinutes = 5;
        const createdAt = NOW - 6 * 60 * 1000; // 6 minutes ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(
          resourceOwnerId,
          authenticatedUserId,
          resourceCreatedAt,
          gracePeriodMinutes
        );

        // Assert
        expect(result).toBe(false);
      });

      it("should respect custom grace period of 30 minutes", () => {
        // Arrange
        const gracePeriodMinutes = 30;
        const createdAt = NOW - 25 * 60 * 1000; // 25 minutes ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(
          resourceOwnerId,
          authenticatedUserId,
          resourceCreatedAt,
          gracePeriodMinutes
        );

        // Assert
        expect(result).toBe(true);
      });

      it("should handle grace period of 0 minutes (no grace period)", () => {
        // Arrange
        const gracePeriodMinutes = 0;
        const createdAt = NOW - 1000; // 1 second ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(
          resourceOwnerId,
          authenticatedUserId,
          resourceCreatedAt,
          gracePeriodMinutes
        );

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("Edge cases and error handling", () => {
      const resourceOwnerId = "user-123";
      const authenticatedUserId = "user-123";

      it("should handle timestamps with milliseconds", () => {
        // Arrange
        const createdAt = NOW - 5 * 60 * 1000 - 123; // 5 minutes and 123ms ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle future timestamps (edge case)", () => {
        // Arrange - resource created "in the future" (clock skew scenario)
        const createdAt = NOW + 5 * 60 * 1000;
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        // Should return true because timeSinceCreation will be negative
        expect(result).toBe(true);
      });

      it("should handle empty string for authenticatedUserId", () => {
        // Arrange
        const authenticatedUserIdEmpty = "";
        const resourceCreatedAt = new Date(NOW).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserIdEmpty, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("Combined scenarios", () => {
      it("should return true when all conditions are met: authenticated, owner, within grace period", () => {
        // Arrange
        const userId = "user-123";
        const createdAt = NOW - 10 * 60 * 1000; // 10 minutes ago
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(userId, userId, resourceCreatedAt);

        // Assert
        expect(result).toBe(true);
      });

      it("should return false when only one condition fails: not owner", () => {
        // Arrange
        const resourceOwnerId = "user-123";
        const authenticatedUserId = "user-456";
        const createdAt = NOW - 5 * 60 * 1000; // 5 minutes ago (within grace period)
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(resourceOwnerId, authenticatedUserId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when only one condition fails: outside grace period", () => {
        // Arrange
        const userId = "user-123";
        const createdAt = NOW - 20 * 60 * 1000; // 20 minutes ago (outside grace period)
        const resourceCreatedAt = new Date(createdAt).toISOString();

        // Act
        const result = canUserModifyResource(userId, userId, resourceCreatedAt);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe("getUserFromLocals", () => {
    it("should return user id when user object is present in locals", () => {
      // Arrange
      const locals = {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe("user-123");
    });

    it("should return null when user object is not present in locals", () => {
      // Arrange
      const locals = {
        someOtherProperty: "value",
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(null);
    });

    it("should return null when user is null", () => {
      // Arrange
      const locals = {
        user: null,
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(null);
    });

    it("should return null when user is not an object", () => {
      // Arrange
      const locals = {
        user: "not-an-object",
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(null);
    });

    it("should return null when user object exists but id is missing", () => {
      // Arrange
      const locals = {
        user: {
          email: "test@example.com",
        },
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(null);
    });

    it("should return null when locals is empty object", () => {
      // Arrange
      const locals = {};

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(null);
    });

    it("should handle user.id as different types gracefully", () => {
      // Arrange
      const locals = {
        user: {
          id: 12345, // number instead of string
        },
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe(12345);
    });

    it("should handle nested user objects correctly", () => {
      // Arrange
      const locals = {
        user: {
          id: "user-123",
          profile: {
            name: "John Doe",
          },
        },
      };

      // Act
      const result = getUserFromLocals(locals);

      // Assert
      expect(result).toBe("user-123");
    });
  });
});
