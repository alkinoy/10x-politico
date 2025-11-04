/**
 * Politician Service
 * Handles business logic for politician-related operations
 */

import { getSupabaseClient } from "@/db/client";
import type {
  PoliticianDTO,
  PoliticianDetailDTO,
  PoliticiansQueryParams,
  PaginatedResponse,
  CreatePoliticianCommand,
} from "@/types";

export class PoliticianService {
  private supabase;

  constructor(runtime?: Record<string, string>) {
    // Use service role key for server-side operations
    this.supabase = getSupabaseClient(runtime);
  }

  /**
   * Retrieves paginated politicians with optional search and filtering
   *
   * @param queryParams - Query parameters for search, filter, sorting, and pagination
   * @returns Paginated response with politician data
   */
  async getAllPoliticians(queryParams: PoliticiansQueryParams): Promise<PaginatedResponse<PoliticianDTO>> {
    const { page = 1, limit = 50, search, party_id, sort = "last_name", order = "asc" } = queryParams;

    // Build base query with party join
    let countQuery = this.supabase.from("politicians").select("*", { count: "exact", head: true });

    let dataQuery = this.supabase.from("politicians").select(
      `
        id,
        first_name,
        last_name,
        party_id,
        biography,
        created_at,
        updated_at,
        parties!inner (
          id,
          name,
          abbreviation,
          color_hex
        )
      `
    );

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      countQuery = countQuery.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
      dataQuery = dataQuery.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
    }

    // Apply party filter if provided
    if (party_id) {
      countQuery = countQuery.eq("party_id", party_id);
      dataQuery = dataQuery.eq("party_id", party_id);
    }

    // Get total count
    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count politicians: ${countError.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Apply sorting and pagination
    const { data, error } = await dataQuery
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch politicians: ${error.message}`);
    }

    // Transform database results to DTOs
    const politicians: PoliticianDTO[] = (data || []).map((pol) => {
      // Type assertion for nested party data
      const parties = pol.parties as unknown as {
        id: string;
        name: string;
        abbreviation: string | null;
        color_hex: string | null;
      };

      return {
        id: pol.id,
        first_name: pol.first_name,
        last_name: pol.last_name,
        party_id: pol.party_id,
        party: {
          id: parties.id,
          name: parties.name,
          abbreviation: parties.abbreviation,
          color_hex: parties.color_hex,
        },
        biography: pol.biography,
        created_at: pol.created_at,
        updated_at: pol.updated_at,
      };
    });

    return {
      data: politicians,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Retrieves a single politician by ID with full party details and statement count
   *
   * @param politicianId - UUID of the politician
   * @returns Politician detail data or null if not found
   */
  async getPoliticianById(politicianId: string): Promise<PoliticianDetailDTO | null> {
    // Fetch politician with full party details
    const { data, error } = await this.supabase
      .from("politicians")
      .select(
        `
        id,
        first_name,
        last_name,
        party_id,
        biography,
        created_at,
        updated_at,
        parties!inner (
          id,
          name,
          abbreviation,
          description,
          color_hex
        )
      `
      )
      .eq("id", politicianId)
      .single();

    if (error) {
      // Handle "not found" vs other errors
      if (error.code === "PGRST116") {
        // PostgreSQL not found error
        return null;
      }
      throw new Error(`Failed to fetch politician: ${error.message}`);
    }

    // Count statements for this politician
    const { count: statementsCount } = await this.supabase
      .from("statements")
      .select("*", { count: "exact", head: true })
      .eq("politician_id", politicianId)
      .is("deleted_at", null);

    // Type assertion for nested party data
    const parties = data.parties as unknown as {
      id: string;
      name: string;
      abbreviation: string | null;
      description: string | null;
      color_hex: string | null;
    };

    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      party_id: data.party_id,
      party: {
        id: parties.id,
        name: parties.name,
        abbreviation: parties.abbreviation,
        description: parties.description,
        color_hex: parties.color_hex,
      },
      biography: data.biography,
      created_at: data.created_at,
      updated_at: data.updated_at,
      statements_count: statementsCount || 0,
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
   * Creates a new politician
   *
   * @param command - Politician creation data
   * @returns Created politician data with party information
   */
  async createPolitician(command: CreatePoliticianCommand): Promise<PoliticianDTO> {
    const { first_name, last_name, party_id, biography } = command;

    // Insert politician
    const { data, error } = await this.supabase
      .from("politicians")
      .insert({
        first_name,
        last_name,
        party_id,
        biography: biography || null,
      })
      .select(
        `
        id,
        first_name,
        last_name,
        party_id,
        biography,
        created_at,
        updated_at,
        parties!inner (
          id,
          name,
          abbreviation,
          color_hex
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create politician: ${error.message}`);
    }

    // Type assertion for nested party data
    const parties = data.parties as unknown as {
      id: string;
      name: string;
      abbreviation: string | null;
      color_hex: string | null;
    };

    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      party_id: data.party_id,
      party: {
        id: parties.id,
        name: parties.name,
        abbreviation: parties.abbreviation,
        color_hex: parties.color_hex,
      },
      biography: data.biography,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
