/**
 * Validation utilities for API endpoints
 * Provides type-safe validation functions for common input patterns
 */

/**
 * Validates if a string is a valid UUID format (any version)
 * @param uuid - String to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates and normalizes pagination parameters
 * Ensures page >= 1 and limit is between 1 and 100
 * @param page - Requested page number
 * @param limit - Requested items per page
 * @returns Validated pagination parameters
 */
export function validatePaginationParams(
  page?: number,
  limit?: number
): {
  page: number;
  limit: number;
} {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(100, Math.max(1, limit || 50));

  return { page: validatedPage, limit: validatedLimit };
}

/**
 * Validates time range parameter
 * @param timeRange - Time range string to validate
 * @returns Valid time range or 'all' as default
 */
export function validateTimeRange(timeRange?: string): "7d" | "30d" | "365d" | "all" {
  if (!timeRange || !["7d", "30d", "365d", "all"].includes(timeRange)) {
    return "all";
  }
  return timeRange as "7d" | "30d" | "365d" | "all";
}

/**
 * Validates sort field parameter
 * @param sortBy - Sort field to validate
 * @param allowedFields - Array of allowed field names
 * @param defaultField - Default field to return if invalid
 * @returns Valid sort field
 */
export function validateSortField<T extends string>(
  sortBy: string | undefined,
  allowedFields: readonly T[],
  defaultField: T
): T {
  if (!sortBy || !allowedFields.includes(sortBy as T)) {
    return defaultField;
  }
  return sortBy as T;
}

/**
 * Validates sort order parameter
 * @param order - Sort order to validate
 * @returns Valid sort order ('asc' or 'desc')
 */
export function validateSortOrder(order?: string): "asc" | "desc" {
  if (!order || !["asc", "desc"].includes(order)) {
    return "desc";
  }
  return order as "asc" | "desc";
}

/**
 * Validates if a string is a valid ISO 8601 date
 * @param dateString - Date string to validate
 * @returns true if valid ISO 8601 date, false otherwise
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString || typeof dateString !== "string") {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Validates if a string is not empty and within max length
 * @param value - String to validate
 * @param maxLength - Maximum allowed length
 * @returns true if valid, false otherwise
 */
export function isValidString(value: string, maxLength?: number): boolean {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  if (maxLength && value.length > maxLength) {
    return false;
  }

  return true;
}
