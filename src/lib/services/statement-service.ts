/**
 * Statement Service
 * Handles business logic for statement-related operations
 */

import { getSupabaseClient } from "@/db/client";
import { chatCompletion } from "./openrouter-service";
import type {
  StatementDetailDTO,
  StatementDTO,
  DeletedStatementDTO,
  PaginatedResponse,
  PoliticianTimelineQueryParams,
  StatementsQueryParams,
  CreateStatementCommand,
  UpdateStatementCommand,
  ResponseFormat,
} from "@/types";

export class StatementService {
  private supabase;
  private runtime?: Record<string, string>;

  constructor(runtime?: Record<string, string>) {
    // Store runtime for environment variable access
    this.runtime = runtime;
    // Use service role key for server-side operations
    this.supabase = getSupabaseClient(runtime);
  }

  /**
   * Check if AI summary feature is enabled
   * @returns true if USE_AI_SUMMARY is set to 'true'
   */
  private isAiSummaryEnabled(): boolean {
    // Cloudflare Workers: use runtime.env
    // Node.js/dev: use import.meta.env or process.env
    const useAiSummary =
      this.runtime?.USE_AI_SUMMARY ||
      (typeof import.meta !== "undefined" && import.meta.env?.USE_AI_SUMMARY) ||
      (typeof process !== "undefined" && process.env?.USE_AI_SUMMARY);

    const isEnabled = useAiSummary === "true";

    // Log for debugging in Cloudflare
    console.warn("🔍 AI Summary Feature Check:", {
      runtimeValue: this.runtime?.USE_AI_SUMMARY,
      importMetaValue: typeof import.meta !== "undefined" ? import.meta.env?.USE_AI_SUMMARY : "N/A",
      processEnvValue: typeof process !== "undefined" ? process.env?.USE_AI_SUMMARY : "N/A",
      finalValue: useAiSummary,
      isEnabled,
    });

    return isEnabled;
  }

  /**
   * Generate AI summary for a statement using OpenRouter
   * @param statementText - The original statement text
   * @returns AI-generated summary or null if generation fails
   */
  private async generateAiSummary(statementText: string): Promise<string | null> {
    console.warn("📝 Starting AI summary generation...");

    // Check if AI summary is enabled
    if (!this.isAiSummaryEnabled()) {
      console.warn("❌ AI Summary is disabled");
      return null;
    }

    console.warn("✅ AI Summary is enabled, proceeding with generation");

    try {
      // Define JSON schema for the summary response
      const responseFormat: ResponseFormat = {
        type: "json_schema",
        json_schema: {
          name: "statement_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "A concise summary of the political statement in 1-2 sentences",
              },
            },
            required: ["summary"],
            additionalProperties: false,
          },
        },
      };

      console.warn("🤖 Calling OpenRouter API to generate summary...");
      console.warn("📄 Statement text length:", statementText.length, "characters");

      // Generate summary using OpenRouter
      const result = await chatCompletion<{ summary: string }>({
        model: "openai/gpt-4o-mini",
        systemMessage:
          "You are a political analyst. Create very concise, objective summaries of political statements. Keep summaries to 1-2 sentences maximum. Focus on the key message or claim.",
        userMessage: `Summarize this political statement concisely:\n\n"${statementText}"`,
        responseFormat,
        parameters: {
          temperature: 0.3, // Low temperature for consistent, factual summaries
          max_tokens: 150,
        },
        runtime: this.runtime, // Pass runtime for API key access in Cloudflare
      });

      console.warn("✅ AI Summary generated successfully:", result.content.summary);
      return result.content.summary;
    } catch (error) {
      // Log error but don't fail the statement creation
      console.error("❌ Failed to generate AI summary:", error);
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return null;
    }
  }

  /**
   * Append AI summary to statement text with clear separator
   * @param statementText - Original statement text
   * @param summary - AI-generated summary
   * @returns Statement text with appended summary
   */
  private appendSummaryToStatement(statementText: string, summary: string): string {
    return `${statementText}\n\n---\n\n📝 AI Summary: ${summary}`;
  }

  /**
   * Retrieves paginated statements for a specific politician
   * Applies time range filtering, sorting, and calculates permission flags
   *
   * @param politicianId - UUID of the politician
   * @param queryParams - Query parameters for filtering, sorting, and pagination
   * @param authenticatedUserId - ID of authenticated user (for permission calculation)
   * @returns Paginated response with statement details
   */
  async getStatementsForPolitician(
    politicianId: string,
    queryParams: PoliticianTimelineQueryParams,
    authenticatedUserId: string | null
  ): Promise<PaginatedResponse<StatementDetailDTO>> {
    const { page = 1, limit = 50, time_range = "all", sort_by = "created_at", order = "desc" } = queryParams;

    // Calculate time range filter
    const timeFilter = this.getTimeRangeFilter(time_range);

    // Build count query for pagination
    let countQuery = this.supabase
      .from("statements")
      .select("*", { count: "exact", head: true })
      .eq("politician_id", politicianId)
      .is("deleted_at", null);

    // Apply time filter to count query if specified
    if (timeFilter) {
      countQuery = countQuery.gte("created_at", timeFilter.toISOString());
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count statements: ${countError.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Build main data query with joins
    let dataQuery = this.supabase
      .from("statements")
      .select(
        `
        id,
        politician_id,
        statement_text,
        statement_timestamp,
        created_by_user_id,
        created_at,
        updated_at,
        politicians!inner (
          id,
          first_name,
          last_name,
          parties!inner (
            id,
            name,
            abbreviation,
            color_hex
          )
        ),
        created_by:profiles!created_by_user_id (
          id,
          display_name
        )
      `
      )
      .eq("politician_id", politicianId)
      .is("deleted_at", null);

    // Apply time filter to data query if specified
    if (timeFilter) {
      dataQuery = dataQuery.gte("created_at", timeFilter.toISOString());
    }

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Apply sorting and pagination
    const { data, error } = await dataQuery
      .order(sort_by, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch statements: ${error.message}`);
    }

    // Transform database results to DTOs with permission flags
    const statements: StatementDetailDTO[] = (data || []).map((stmt) => {
      // Type assertion for nested data
      const politicians = stmt.politicians as unknown as {
        id: string;
        first_name: string;
        last_name: string;
        parties: {
          id: string;
          name: string;
          abbreviation: string | null;
          color_hex: string | null;
        };
      };

      const created_by = stmt.created_by as unknown as {
        id: string;
        display_name: string;
      };

      return {
        id: stmt.id,
        politician_id: stmt.politician_id,
        statement_text: stmt.statement_text,
        statement_timestamp: stmt.statement_timestamp,
        created_by_user_id: stmt.created_by_user_id,
        created_at: stmt.created_at,
        updated_at: stmt.updated_at,
        politician: {
          id: politicians.id,
          first_name: politicians.first_name,
          last_name: politicians.last_name,
          party: {
            id: politicians.parties.id,
            name: politicians.parties.name,
            abbreviation: politicians.parties.abbreviation,
            color_hex: politicians.parties.color_hex,
          },
        },
        created_by: {
          id: created_by.id,
          display_name: created_by.display_name,
        },
        ...this.calculatePermissions(stmt, authenticatedUserId),
      };
    });

    return {
      data: statements,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Calculates time range filter based on time_range parameter
   *
   * @param timeRange - Time range string ('7d', '30d', '365d', 'all')
   * @returns Date object for filtering or null for 'all'
   */
  private getTimeRangeFilter(timeRange: string): Date | null {
    const now = new Date();

    switch (timeRange) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "365d":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case "all":
      default:
        return null;
    }
  }

  /**
   * Calculates permission flags (can_edit, can_delete) for a statement
   * Based on ownership and 15-minute grace period
   *
   * @param statement - Statement data from database
   * @param authenticatedUserId - ID of authenticated user
   * @returns Permission flags object
   */
  private calculatePermissions(
    statement: { created_by_user_id: string; created_at: string },
    authenticatedUserId: string | null
  ): { can_edit: boolean; can_delete: boolean } {
    // No permissions for unauthenticated users
    if (!authenticatedUserId) {
      return { can_edit: false, can_delete: false };
    }

    // Check ownership
    const isOwner = statement.created_by_user_id === authenticatedUserId;

    // Check grace period (15 minutes)
    const gracePeriodMs = 15 * 60 * 1000;
    const timeSinceCreation = Date.now() - new Date(statement.created_at).getTime();
    const withinGracePeriod = timeSinceCreation <= gracePeriodMs;

    // Can modify if owner and within grace period
    const canModify = isOwner && withinGracePeriod;

    return {
      can_edit: canModify,
      can_delete: canModify,
    };
  }

  /**
   * Verifies if a politician exists in the database
   *
   * @param politicianId - UUID of the politician
   * @returns true if politician exists, false otherwise
   */
  async verifyPoliticianExists(politicianId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from("politicians").select("id").eq("id", politicianId).single();

    return !error && !!data;
  }

  /**
   * Retrieves paginated recent statements feed
   * Public endpoint with optional politician filtering
   *
   * @param queryParams - Query parameters for filtering, sorting, and pagination
   * @returns Paginated response with statement details
   */
  async getAllStatements(queryParams: StatementsQueryParams): Promise<PaginatedResponse<StatementDTO>> {
    const { page = 1, limit = 50, politician_id, sort_by = "created_at", order = "desc" } = queryParams;

    // Build count query for pagination
    let countQuery = this.supabase
      .from("statements")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    // Apply politician filter if specified
    if (politician_id) {
      countQuery = countQuery.eq("politician_id", politician_id);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count statements: ${countError.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Build main data query with joins
    let dataQuery = this.supabase
      .from("statements")
      .select(
        `
        id,
        politician_id,
        statement_text,
        statement_timestamp,
        created_by_user_id,
        created_at,
        updated_at,
        politicians!inner (
          id,
          first_name,
          last_name,
          parties!inner (
            id,
            name,
            abbreviation,
            color_hex
          )
        ),
        created_by:profiles!created_by_user_id (
          id,
          display_name
        )
      `
      )
      .is("deleted_at", null);

    // Apply politician filter if specified
    if (politician_id) {
      dataQuery = dataQuery.eq("politician_id", politician_id);
    }

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Apply sorting and pagination
    const { data, error } = await dataQuery
      .order(sort_by, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch statements: ${error.message}`);
    }

    // Transform database results to DTOs
    const statements: StatementDTO[] = (data || []).map((stmt) => {
      // Type assertion for nested data
      const politicians = stmt.politicians as unknown as {
        id: string;
        first_name: string;
        last_name: string;
        parties: {
          id: string;
          name: string;
          abbreviation: string | null;
          color_hex: string | null;
        };
      };

      const created_by = stmt.created_by as unknown as {
        id: string;
        display_name: string;
      };

      return {
        id: stmt.id,
        politician_id: stmt.politician_id,
        statement_text: stmt.statement_text,
        statement_timestamp: stmt.statement_timestamp,
        created_by_user_id: stmt.created_by_user_id,
        created_at: stmt.created_at,
        updated_at: stmt.updated_at,
        politician: {
          id: politicians.id,
          first_name: politicians.first_name,
          last_name: politicians.last_name,
          party: {
            id: politicians.parties.id,
            name: politicians.parties.name,
            abbreviation: politicians.parties.abbreviation,
            color_hex: politicians.parties.color_hex,
          },
        },
        created_by: {
          id: created_by.id,
          display_name: created_by.display_name,
        },
      };
    });

    return {
      data: statements,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Retrieves a single statement by ID with full details and permission flags
   *
   * @param statementId - UUID of the statement
   * @param authenticatedUserId - ID of authenticated user (for permission calculation)
   * @returns Statement detail with permission flags or null if not found
   */
  async getStatementById(statementId: string, authenticatedUserId: string | null): Promise<StatementDetailDTO | null> {
    const { data, error } = await this.supabase
      .from("statements")
      .select(
        `
        id,
        politician_id,
        statement_text,
        statement_timestamp,
        created_by_user_id,
        created_at,
        updated_at,
        deleted_at,
        politicians!inner (
          id,
          first_name,
          last_name,
          parties!inner (
            id,
            name,
            abbreviation,
            color_hex
          )
        ),
        created_by:profiles!created_by_user_id (
          id,
          display_name
        )
      `
      )
      .eq("id", statementId)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return null;
    }

    // Type assertion for nested data
    const politicians = data.politicians as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      parties: {
        id: string;
        name: string;
        abbreviation: string | null;
        color_hex: string | null;
      };
    };

    const created_by = data.created_by as unknown as {
      id: string;
      display_name: string;
    };

    return {
      id: data.id,
      politician_id: data.politician_id,
      statement_text: data.statement_text,
      statement_timestamp: data.statement_timestamp,
      created_by_user_id: data.created_by_user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      politician: {
        id: politicians.id,
        first_name: politicians.first_name,
        last_name: politicians.last_name,
        party: {
          id: politicians.parties.id,
          name: politicians.parties.name,
          abbreviation: politicians.parties.abbreviation,
          color_hex: politicians.parties.color_hex,
        },
      },
      created_by: {
        id: created_by.id,
        display_name: created_by.display_name,
      },
      ...this.calculatePermissions(data, authenticatedUserId),
    };
  }

  /**
   * Creates a new statement
   * Validates input, checks politician exists, optionally generates AI summary, and inserts into database
   *
   * @param command - Statement creation data
   * @param authenticatedUserId - ID of authenticated user (statement creator)
   * @returns Created statement with full details or null if creation failed
   */
  async createStatement(
    command: CreateStatementCommand,
    authenticatedUserId: string
  ): Promise<StatementDetailDTO | null> {
    console.warn("📝 Creating new statement...");
    console.warn("👤 User ID:", authenticatedUserId);
    console.warn("🏛️ Politician ID:", command.politician_id);

    // Verify politician exists
    const politicianExists = await this.verifyPoliticianExists(command.politician_id);
    if (!politicianExists) {
      throw new Error("Politician not found");
    }

    // Generate AI summary if enabled
    console.warn("🤖 Attempting to generate AI summary...");
    let finalStatementText = command.statement_text;
    const aiSummary = await this.generateAiSummary(command.statement_text);

    // Append AI summary if generated successfully
    if (aiSummary) {
      console.warn("✅ AI summary generated, appending to statement");
      console.warn("📝 Summary:", aiSummary);
      finalStatementText = this.appendSummaryToStatement(command.statement_text, aiSummary);
      console.warn("📄 Final statement length:", finalStatementText.length, "characters");
    } else {
      console.warn("ℹ️ No AI summary generated, using original statement text");
    }

    // Insert statement with potentially modified text
    console.warn("💾 Inserting statement into database...");
    const { data, error } = await this.supabase
      .from("statements")
      .insert({
        politician_id: command.politician_id,
        statement_text: finalStatementText,
        statement_timestamp: command.statement_timestamp,
        created_by_user_id: authenticatedUserId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("❌ Failed to insert statement:", error);
      throw new Error(`Failed to create statement: ${error?.message || "Unknown error"}`);
    }

    console.warn("✅ Statement created successfully, ID:", data.id);

    // Fetch the complete statement with joins
    return this.getStatementById(data.id, authenticatedUserId);
  }

  /**
   * Updates an existing statement (within grace period)
   * Validates ownership, grace period, and update data
   *
   * @param statementId - UUID of the statement to update
   * @param command - Statement update data
   * @param authenticatedUserId - ID of authenticated user
   * @returns Updated statement with full details
   * @throws Error if statement not found, not owned, deleted, or grace period expired
   */
  async updateStatement(
    statementId: string,
    command: UpdateStatementCommand,
    authenticatedUserId: string
  ): Promise<StatementDetailDTO> {
    // Fetch existing statement
    const { data: existingStatement, error: fetchError } = await this.supabase
      .from("statements")
      .select("id, created_by_user_id, created_at, deleted_at")
      .eq("id", statementId)
      .single();

    if (fetchError || !existingStatement) {
      throw new Error("Statement not found");
    }

    // Check if statement is deleted
    if (existingStatement.deleted_at) {
      throw new Error("Statement has been deleted");
    }

    // Check ownership
    if (existingStatement.created_by_user_id !== authenticatedUserId) {
      throw new Error("You do not own this statement");
    }

    // Check grace period (15 minutes)
    const gracePeriodMs = 15 * 60 * 1000;
    const timeSinceCreation = Date.now() - new Date(existingStatement.created_at).getTime();

    if (timeSinceCreation > gracePeriodMs) {
      throw new Error("Grace period (15 minutes) has expired");
    }

    // Build update object (only include fields that are provided)
    const updates: Record<string, unknown> = {};

    if (command.statement_text !== undefined) {
      updates.statement_text = command.statement_text;
    }

    if (command.statement_timestamp !== undefined) {
      updates.statement_timestamp = command.statement_timestamp;
    }

    // If nothing to update, just return current statement
    if (Object.keys(updates).length === 0) {
      const currentStatement = await this.getStatementById(statementId, authenticatedUserId);
      if (!currentStatement) {
        throw new Error("Statement not found");
      }
      return currentStatement;
    }

    // Update the statement
    const { error: updateError } = await this.supabase.from("statements").update(updates).eq("id", statementId);

    if (updateError) {
      throw new Error(`Failed to update statement: ${updateError.message}`);
    }

    // Fetch and return the updated statement
    const updatedStatement = await this.getStatementById(statementId, authenticatedUserId);

    if (!updatedStatement) {
      throw new Error("Failed to fetch updated statement");
    }

    return updatedStatement;
  }

  /**
   * Soft-deletes a statement (within grace period)
   * Validates ownership and grace period, then sets deleted_at timestamp
   *
   * @param statementId - UUID of the statement to delete
   * @param authenticatedUserId - ID of authenticated user
   * @returns Deleted statement info with deletion timestamp
   * @throws Error if statement not found, not owned, already deleted, or grace period expired
   */
  async deleteStatement(statementId: string, authenticatedUserId: string): Promise<DeletedStatementDTO> {
    // Fetch existing statement
    const { data: existingStatement, error: fetchError } = await this.supabase
      .from("statements")
      .select("id, created_by_user_id, created_at, deleted_at")
      .eq("id", statementId)
      .single();

    if (fetchError || !existingStatement) {
      throw new Error("Statement not found");
    }

    // Check if already deleted
    if (existingStatement.deleted_at) {
      throw new Error("Statement has already been deleted");
    }

    // Check ownership
    if (existingStatement.created_by_user_id !== authenticatedUserId) {
      throw new Error("You do not own this statement");
    }

    // Check grace period (15 minutes)
    const gracePeriodMs = 15 * 60 * 1000;
    const timeSinceCreation = Date.now() - new Date(existingStatement.created_at).getTime();

    if (timeSinceCreation > gracePeriodMs) {
      throw new Error("Grace period (15 minutes) has expired");
    }

    // Soft delete by setting deleted_at timestamp
    const deletedAt = new Date().toISOString();

    const { error: deleteError } = await this.supabase
      .from("statements")
      .update({ deleted_at: deletedAt })
      .eq("id", statementId);

    if (deleteError) {
      throw new Error(`Failed to delete statement: ${deleteError.message}`);
    }

    return {
      id: statementId,
      deleted_at: deletedAt,
    };
  }
}
