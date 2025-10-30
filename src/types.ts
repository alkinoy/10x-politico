/**
 * Data Transfer Objects (DTOs) and Command Models
 *
 * This file contains all DTO types used for API requests and responses.
 * All types are derived from the database entity types defined in database.types.ts
 * to ensure type safety and consistency between the database and API layers.
 */

import type { Tables } from "./db/database.types";

// ============================================================================
// Entity Type Aliases
// ============================================================================

/**
 * Database entity types for easier reference
 */
export type PartyEntity = Tables<"parties">;
export type PoliticianEntity = Tables<"politicians">;
export type StatementEntity = Tables<"statements">;
export type ProfileEntity = Tables<"profiles">;

// ============================================================================
// Party DTOs
// ============================================================================

/**
 * Complete party information (GET /api/parties, GET /api/parties/:id)
 * Maps directly to the parties table structure
 */
export type PartyDTO = PartyEntity;

/**
 * Abbreviated party information used in nested responses
 * Omits verbose fields like description
 */
export type PartyInPoliticianDTO = Pick<PartyEntity, "id" | "name" | "abbreviation" | "color_hex">;

/**
 * Minimal party information used in deeply nested responses (e.g., statements)
 */
export type PartyInStatementDTO = Pick<PartyEntity, "id" | "name" | "abbreviation" | "color_hex">;

// ============================================================================
// Party Command Models
// ============================================================================

/**
 * Create party command (POST /api/parties)
 * Requires name, optional fields for abbreviation, description, color_hex
 */
export interface CreatePartyCommand {
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  color_hex?: string | null;
}

/**
 * Update party command (PATCH /api/parties/:id)
 * All fields optional for partial updates
 */
export interface UpdatePartyCommand {
  name?: string;
  abbreviation?: string | null;
  description?: string | null;
  color_hex?: string | null;
}

// ============================================================================
// Politician DTOs
// ============================================================================

/**
 * Politician with nested party information (GET /api/politicians)
 * Extends politician entity with joined party data
 */
export type PoliticianDTO = Omit<PoliticianEntity, "party_id"> & {
  party_id: string;
  party: PartyInPoliticianDTO;
};

/**
 * Politician detail with additional computed fields (GET /api/politicians/:id)
 * Includes statement count and full party information
 */
export type PoliticianDetailDTO = Omit<PoliticianEntity, "party_id"> & {
  party_id: string;
  party: PartyDTO;
  statements_count: number;
};

// ============================================================================
// Politician Command Models
// ============================================================================

/**
 * Create politician command (POST /api/politicians)
 * Requires first_name, last_name, party_id; optional biography
 */
export interface CreatePoliticianCommand {
  first_name: string;
  last_name: string;
  party_id: string;
  biography?: string | null;
}

/**
 * Update politician command (PATCH /api/politicians/:id)
 * All fields optional for partial updates
 */
export interface UpdatePoliticianCommand {
  first_name?: string;
  last_name?: string;
  party_id?: string;
  biography?: string | null;
}

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Authenticated user profile (GET /api/profiles/me)
 * Extends profile entity with email from auth.users
 */
export type ProfileDTO = ProfileEntity & {
  email: string | null;
};

/**
 * Public profile information (GET /api/profiles/:id)
 * Exposes minimal user information for public consumption
 */
export type PublicProfileDTO = Pick<ProfileEntity, "id" | "display_name" | "created_at">;

/**
 * User information for statement creators (nested in statements)
 * Minimal information about who created a statement
 */
export type CreatedByDTO = Pick<ProfileEntity, "id" | "display_name">;

// ============================================================================
// Profile Command Models
// ============================================================================

/**
 * Update profile command (PATCH /api/profiles/me)
 * Only allows updating display_name
 */
export interface UpdateProfileCommand {
  display_name?: string;
}

// ============================================================================
// Statement DTOs
// ============================================================================

/**
 * Politician information nested in statement responses
 * Includes nested party information
 */
export type PoliticianInStatementDTO = Pick<PoliticianEntity, "id" | "first_name" | "last_name"> & {
  party: PartyInStatementDTO;
};

/**
 * Statement with nested politician and creator information
 * Used in list endpoints (GET /api/statements, GET /api/politicians/:politician_id/statements)
 */
export type StatementDTO = Omit<StatementEntity, "deleted_at" | "politician_id" | "created_by_user_id"> & {
  politician_id: string;
  politician: PoliticianInStatementDTO;
  created_by_user_id: string;
  created_by: CreatedByDTO;
};

/**
 * Statement detail with permission flags
 * Used in detail endpoint (GET /api/statements/:id) and timeline endpoint
 * Includes can_edit and can_delete flags based on ownership and grace period
 */
export type StatementDetailDTO = StatementDTO & {
  can_edit: boolean;
  can_delete: boolean;
};

/**
 * Deleted statement response (DELETE /api/statements/:id)
 * Returns minimal information after soft delete
 */
export interface DeletedStatementDTO {
  id: string;
  deleted_at: string;
}

// ============================================================================
// Statement Command Models
// ============================================================================

/**
 * Create statement command (POST /api/statements)
 * Requires politician_id, statement_text, and statement_timestamp
 * created_by_user_id is automatically set from authenticated user
 */
export interface CreateStatementCommand {
  politician_id: string;
  statement_text: string;
  statement_timestamp: string;
}

/**
 * Update statement command (PATCH /api/statements/:id)
 * Allows updating statement_text and statement_timestamp
 * Subject to ownership and grace period validation
 */
export interface UpdateStatementCommand {
  statement_text?: string;
  statement_timestamp?: string;
}

// ============================================================================
// Report DTOs and Command Models
// ============================================================================

/**
 * Report reason enumeration
 * Defines valid values for report reasons
 */
export type ReportReason = "spam" | "inaccurate" | "inappropriate" | "off_topic" | "other";

/**
 * Create report command (POST /api/statements/:statement_id/reports)
 * Requires reason, optional comment
 * reported_by_user_id is optional (allows anonymous reports)
 */
export interface CreateReportCommand {
  reason: ReportReason;
  comment?: string | null;
}

/**
 * Report response DTO
 * Returns report information after creation
 * Note: This assumes a future reports table structure
 */
export interface ReportDTO {
  id: string;
  statement_id: string;
  reason: ReportReason;
  comment: string | null;
  reported_by_user_id: string | null;
  created_at: string;
}

// ============================================================================
// Pagination and Response Wrapper Types
// ============================================================================

/**
 * Pagination metadata
 * Used in paginated list responses
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Generic paginated response wrapper
 * Wraps data array with pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationDTO;
}

/**
 * Generic single item response wrapper
 * Wraps single data item
 */
export interface SingleResponse<T> {
  data: T;
}

/**
 * Generic list response wrapper (no pagination)
 * Wraps data array with optional count
 */
export interface ListResponse<T> {
  data: T[];
  count?: number;
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Common sorting parameters
 */
export type SortOrder = "asc" | "desc";

/**
 * Party list query parameters
 */
export interface PartiesQueryParams {
  sort?: "name" | "created_at";
  order?: SortOrder;
}

/**
 * Politician list query parameters
 */
export interface PoliticiansQueryParams {
  search?: string;
  party_id?: string;
  sort?: "last_name" | "created_at";
  order?: SortOrder;
  page?: number;
  limit?: number;
}

/**
 * Statement list query parameters
 */
export interface StatementsQueryParams {
  page?: number;
  limit?: number;
  politician_id?: string;
  sort_by?: "created_at" | "statement_timestamp";
  order?: SortOrder;
}

/**
 * Politician timeline query parameters (statements for specific politician)
 */
export interface PoliticianTimelineQueryParams {
  page?: number;
  limit?: number;
  time_range?: "7d" | "30d" | "365d" | "all";
  sort_by?: "created_at" | "statement_timestamp";
  order?: SortOrder;
}

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Error codes used in API responses
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "GRACE_PERIOD_EXPIRED"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: ErrorCode;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// Type Guards and Utilities
// ============================================================================

/**
 * Type guard to check if a value is a valid ReportReason
 */
export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === "string" && ["spam", "inaccurate", "inappropriate", "off_topic", "other"].includes(value);
}

/**
 * Type guard to check if a value is a valid SortOrder
 */
export function isSortOrder(value: unknown): value is SortOrder {
  return typeof value === "string" && ["asc", "desc"].includes(value);
}

/**
 * Type guard to check if a value is a valid time range
 */
export function isTimeRange(value: unknown): value is "7d" | "30d" | "365d" | "all" {
  return typeof value === "string" && ["7d", "30d", "365d", "all"].includes(value);
}
