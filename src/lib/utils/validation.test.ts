import { describe, it, expect } from "vitest";
import {
  isValidUUID,
  validatePaginationParams,
  validateTimeRange,
  validateSortField,
  validateSortOrder,
  isValidISODate,
  isValidString,
} from "./validation";

describe("validation utilities", () => {
  describe("isValidUUID", () => {
    it("should return true for valid UUID v4", () => {
      expect(isValidUUID("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should return false for invalid UUIDs", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("123e4567-e89b-12d3-a456")).toBe(false);
      expect(isValidUUID("")).toBe(false);
      expect(isValidUUID("123")).toBe(false);
    });

    it("should return false for non-string inputs", () => {
      expect(isValidUUID(null as unknown as string)).toBe(false);
      expect(isValidUUID(undefined as unknown as string)).toBe(false);
      expect(isValidUUID(123 as unknown as string)).toBe(false);
    });
  });

  describe("validatePaginationParams", () => {
    it("should return default values when no params provided", () => {
      const result = validatePaginationParams();
      expect(result).toEqual({ page: 1, limit: 50 });
    });

    it("should validate and return correct pagination params", () => {
      expect(validatePaginationParams(2, 20)).toEqual({ page: 2, limit: 20 });
      expect(validatePaginationParams(5, 75)).toEqual({ page: 5, limit: 75 });
    });

    it("should enforce minimum page of 1", () => {
      expect(validatePaginationParams(0, 10)).toEqual({ page: 1, limit: 10 });
      expect(validatePaginationParams(-5, 10)).toEqual({ page: 1, limit: 10 });
    });

    it("should enforce maximum limit of 100", () => {
      expect(validatePaginationParams(1, 200)).toEqual({ page: 1, limit: 100 });
      expect(validatePaginationParams(1, 150)).toEqual({ page: 1, limit: 100 });
    });

    it("should enforce minimum limit of 1", () => {
      expect(validatePaginationParams(1, 0)).toEqual({ page: 1, limit: 50 }); // 0 is falsy, defaults to 50
      expect(validatePaginationParams(1, -10)).toEqual({ page: 1, limit: 1 }); // negative values are clamped to 1
    });
  });

  describe("validateTimeRange", () => {
    it("should return valid time ranges", () => {
      expect(validateTimeRange("7d")).toBe("7d");
      expect(validateTimeRange("30d")).toBe("30d");
      expect(validateTimeRange("365d")).toBe("365d");
      expect(validateTimeRange("all")).toBe("all");
    });

    it('should return "all" for invalid time ranges', () => {
      expect(validateTimeRange("invalid")).toBe("all");
      expect(validateTimeRange("14d")).toBe("all");
      expect(validateTimeRange("")).toBe("all");
    });

    it('should return "all" when no param provided', () => {
      expect(validateTimeRange()).toBe("all");
      expect(validateTimeRange(undefined)).toBe("all");
    });
  });

  describe("validateSortField", () => {
    const allowedFields = ["name", "date", "rating"] as const;

    it("should return valid sort field", () => {
      expect(validateSortField("name", allowedFields, "date")).toBe("name");
      expect(validateSortField("rating", allowedFields, "date")).toBe("rating");
    });

    it("should return default field for invalid sort field", () => {
      expect(validateSortField("invalid", allowedFields, "date")).toBe("date");
      expect(validateSortField("score", allowedFields, "name")).toBe("name");
    });

    it("should return default field when no param provided", () => {
      expect(validateSortField(undefined, allowedFields, "date")).toBe("date");
    });
  });

  describe("validateSortOrder", () => {
    it("should return valid sort orders", () => {
      expect(validateSortOrder("asc")).toBe("asc");
      expect(validateSortOrder("desc")).toBe("desc");
    });

    it('should return "desc" for invalid sort orders', () => {
      expect(validateSortOrder("invalid")).toBe("desc");
      expect(validateSortOrder("ascending")).toBe("desc");
      expect(validateSortOrder("")).toBe("desc");
    });

    it('should return "desc" when no param provided', () => {
      expect(validateSortOrder()).toBe("desc");
      expect(validateSortOrder(undefined)).toBe("desc");
    });
  });

  describe("isValidISODate", () => {
    it("should return true for valid ISO 8601 dates", () => {
      expect(isValidISODate("2024-01-15T10:30:00.000Z")).toBe(true);
      expect(isValidISODate("2023-12-31T23:59:59.999Z")).toBe(true);
    });

    it("should return false for invalid ISO dates", () => {
      expect(isValidISODate("2024-01-15")).toBe(false);
      expect(isValidISODate("2024-01-15T10:30:00")).toBe(false);
      expect(isValidISODate("not-a-date")).toBe(false);
      expect(isValidISODate("")).toBe(false);
    });

    it("should return false for non-string inputs", () => {
      expect(isValidISODate(null as unknown as string)).toBe(false);
      expect(isValidISODate(undefined as unknown as string)).toBe(false);
      expect(isValidISODate(123 as unknown as string)).toBe(false);
    });
  });

  describe("isValidString", () => {
    it("should return true for valid non-empty strings", () => {
      expect(isValidString("hello")).toBe(true);
      expect(isValidString("test string")).toBe(true);
      expect(isValidString("a")).toBe(true);
    });

    it("should return false for empty or whitespace strings", () => {
      expect(isValidString("")).toBe(false);
      expect(isValidString("   ")).toBe(false);
      expect(isValidString("\t\n")).toBe(false);
    });

    it("should validate max length when provided", () => {
      expect(isValidString("hello", 10)).toBe(true);
      expect(isValidString("hello", 5)).toBe(true);
      expect(isValidString("hello world", 10)).toBe(false);
      expect(isValidString("test", 3)).toBe(false);
    });

    it("should return false for non-string inputs", () => {
      expect(isValidString(null as unknown as string)).toBe(false);
      expect(isValidString(undefined as unknown as string)).toBe(false);
      expect(isValidString(123 as unknown as string)).toBe(false);
    });
  });
});
