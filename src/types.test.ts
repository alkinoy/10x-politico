/**
 * Unit Tests for Type Guards
 * Tests for runtime type validation functions
 */

import { describe, it, expect } from "vitest";
import { isReportReason, isSortOrder, isTimeRange } from "./types";

describe("Type Guards", () => {
  describe("isReportReason", () => {
    it("should return true for valid report reasons", () => {
      // Arrange & Act & Assert
      expect(isReportReason("spam")).toBe(true);
      expect(isReportReason("inaccurate")).toBe(true);
      expect(isReportReason("inappropriate")).toBe(true);
      expect(isReportReason("off_topic")).toBe(true);
      expect(isReportReason("other")).toBe(true);
    });

    it("should return false for invalid report reasons", () => {
      // Arrange & Act & Assert
      expect(isReportReason("invalid-reason")).toBe(false);
      expect(isReportReason("SPAM")).toBe(false); // case sensitive
      expect(isReportReason("spam ")).toBe(false); // with trailing space
      expect(isReportReason(" spam")).toBe(false); // with leading space
      expect(isReportReason("")).toBe(false);
      expect(isReportReason("off-topic")).toBe(false); // wrong separator
      expect(isReportReason("offensive")).toBe(false);
    });

    it("should return false for non-string values", () => {
      // Arrange & Act & Assert
      expect(isReportReason(null)).toBe(false);
      expect(isReportReason(undefined)).toBe(false);
      expect(isReportReason(123)).toBe(false);
      expect(isReportReason(true)).toBe(false);
      expect(isReportReason({})).toBe(false);
      expect(isReportReason([])).toBe(false);
    });

    it("should handle edge cases", () => {
      // Arrange & Act & Assert
      expect(isReportReason(0)).toBe(false);
      expect(isReportReason(NaN)).toBe(false);
      expect(isReportReason(false)).toBe(false);
    });
  });

  describe("isSortOrder", () => {
    it("should return true for valid sort orders", () => {
      // Arrange & Act & Assert
      expect(isSortOrder("asc")).toBe(true);
      expect(isSortOrder("desc")).toBe(true);
    });

    it("should return false for invalid sort orders", () => {
      // Arrange & Act & Assert
      expect(isSortOrder("ascending")).toBe(false);
      expect(isSortOrder("descending")).toBe(false);
      expect(isSortOrder("ASC")).toBe(false); // case sensitive
      expect(isSortOrder("DESC")).toBe(false);
      expect(isSortOrder("asc ")).toBe(false); // with space
      expect(isSortOrder(" asc")).toBe(false);
      expect(isSortOrder("")).toBe(false);
      expect(isSortOrder("random")).toBe(false);
    });

    it("should return false for non-string values", () => {
      // Arrange & Act & Assert
      expect(isSortOrder(null)).toBe(false);
      expect(isSortOrder(undefined)).toBe(false);
      expect(isSortOrder(123)).toBe(false);
      expect(isSortOrder(true)).toBe(false);
      expect(isSortOrder({})).toBe(false);
      expect(isSortOrder([])).toBe(false);
    });

    it("should handle edge cases", () => {
      // Arrange & Act & Assert
      expect(isSortOrder(0)).toBe(false);
      expect(isSortOrder(1)).toBe(false);
      expect(isSortOrder(-1)).toBe(false);
      expect(isSortOrder(NaN)).toBe(false);
    });
  });

  describe("isTimeRange", () => {
    it("should return true for valid time ranges", () => {
      // Arrange & Act & Assert
      expect(isTimeRange("7d")).toBe(true);
      expect(isTimeRange("30d")).toBe(true);
      expect(isTimeRange("365d")).toBe(true);
      expect(isTimeRange("all")).toBe(true);
    });

    it("should return false for invalid time ranges", () => {
      // Arrange & Act & Assert
      expect(isTimeRange("1d")).toBe(false);
      expect(isTimeRange("14d")).toBe(false);
      expect(isTimeRange("90d")).toBe(false);
      expect(isTimeRange("7")).toBe(false); // missing 'd'
      expect(isTimeRange("d7")).toBe(false); // reversed
      expect(isTimeRange("7D")).toBe(false); // case sensitive
      expect(isTimeRange("ALL")).toBe(false);
      expect(isTimeRange("7 d")).toBe(false); // with space
      expect(isTimeRange("")).toBe(false);
      expect(isTimeRange("week")).toBe(false);
      expect(isTimeRange("month")).toBe(false);
      expect(isTimeRange("year")).toBe(false);
    });

    it("should return false for non-string values", () => {
      // Arrange & Act & Assert
      expect(isTimeRange(null)).toBe(false);
      expect(isTimeRange(undefined)).toBe(false);
      expect(isTimeRange(7)).toBe(false);
      expect(isTimeRange(30)).toBe(false);
      expect(isTimeRange(365)).toBe(false);
      expect(isTimeRange(true)).toBe(false);
      expect(isTimeRange({})).toBe(false);
      expect(isTimeRange([])).toBe(false);
    });

    it("should handle edge cases", () => {
      // Arrange & Act & Assert
      expect(isTimeRange(0)).toBe(false);
      expect(isTimeRange(NaN)).toBe(false);
      expect(isTimeRange(Infinity)).toBe(false);
      expect(isTimeRange("7d ")).toBe(false); // trailing space
      expect(isTimeRange(" 7d")).toBe(false); // leading space
    });

    it("should not accept similar but invalid values", () => {
      // Arrange & Act & Assert
      expect(isTimeRange("7days")).toBe(false);
      expect(isTimeRange("30days")).toBe(false);
      expect(isTimeRange("1year")).toBe(false);
      expect(isTimeRange("forever")).toBe(false);
    });
  });

  describe("Type Guards - Integration scenarios", () => {
    it("should correctly validate mixed arrays", () => {
      // Arrange
      const mixedReasons = ["spam", "invalid", "inaccurate", 123, null, "other"];

      // Act
      const validReasons = mixedReasons.filter(isReportReason);

      // Assert
      expect(validReasons).toEqual(["spam", "inaccurate", "other"]);
    });

    it("should correctly validate mixed sort orders", () => {
      // Arrange
      const mixedOrders = ["asc", "DESC", "desc", "", null, "ascending"];

      // Act
      const validOrders = mixedOrders.filter(isSortOrder);

      // Assert
      expect(validOrders).toEqual(["asc", "desc"]);
    });

    it("should correctly validate mixed time ranges", () => {
      // Arrange
      const mixedRanges = ["7d", "14d", "30d", "365d", "all", 7, null, "forever"];

      // Act
      const validRanges = mixedRanges.filter(isTimeRange);

      // Assert
      expect(validRanges).toEqual(["7d", "30d", "365d", "all"]);
    });
  });

  describe("Type Guards - API usage scenarios", () => {
    it("should validate report reason from query params", () => {
      // Arrange - simulating URL query param parsing
      const queryParam1 = "spam";
      const queryParam2 = "invalid-value";

      // Act & Assert
      expect(isReportReason(queryParam1)).toBe(true);
      expect(isReportReason(queryParam2)).toBe(false);
    });

    it("should validate sort order from API request", () => {
      // Arrange - simulating API request body
      const requestBody1 = { order: "asc" };
      const requestBody2 = { order: "invalid" };

      // Act & Assert
      expect(isSortOrder(requestBody1.order)).toBe(true);
      expect(isSortOrder(requestBody2.order)).toBe(false);
    });

    it("should validate time range from frontend filter", () => {
      // Arrange - simulating user selection
      const userSelection1 = "7d";
      const userSelection2 = "custom";

      // Act & Assert
      expect(isTimeRange(userSelection1)).toBe(true);
      expect(isTimeRange(userSelection2)).toBe(false);
    });

    it("should handle undefined values from optional parameters", () => {
      // Arrange
      const optionalParam: string | undefined = undefined;

      // Act & Assert
      expect(isReportReason(optionalParam)).toBe(false);
      expect(isSortOrder(optionalParam)).toBe(false);
      expect(isTimeRange(optionalParam)).toBe(false);
    });
  });
});
