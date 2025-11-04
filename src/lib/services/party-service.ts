/**
 * Party Service
 * Handles business logic for party-related operations
 */

import { getSupabaseClient } from "@/db/client";
import type { PartyDTO, PartiesQueryParams, ListResponse, CreatePartyCommand } from "@/types";

export class PartyService {
  private supabase;

  constructor(runtime?: Record<string, string>) {
    // Use service role key for server-side operations
    this.supabase = getSupabaseClient(runtime);
  }

  /**
   * Retrieves all parties with optional sorting
   *
   * @param queryParams - Query parameters for sorting
   * @returns List response with party data
   */
  async getAllParties(queryParams: PartiesQueryParams): Promise<ListResponse<PartyDTO>> {
    const { sort = "name", order = "asc" } = queryParams;

    // Build query
    let query = this.supabase.from("parties").select("*");

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch parties: ${error.message}`);
    }

    return {
      data: (data || []) as PartyDTO[],
      count: count || data?.length || 0,
    };
  }

  /**
   * Retrieves a single party by ID
   *
   * @param partyId - UUID of the party
   * @returns Party data or null if not found
   */
  async getPartyById(partyId: string): Promise<PartyDTO | null> {
    const { data, error } = await this.supabase.from("parties").select("*").eq("id", partyId).single();

    if (error) {
      // Handle "not found" vs other errors
      if (error.code === "PGRST116") {
        // PostgreSQL not found error
        return null;
      }
      throw new Error(`Failed to fetch party: ${error.message}`);
    }

    return data as PartyDTO;
  }

  /**
   * Verifies if a party exists in the database
   *
   * @param partyId - UUID of the party
   * @returns true if party exists, false otherwise
   */
  async verifyPartyExists(partyId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from("parties").select("id").eq("id", partyId).single();

    return !error && !!data;
  }

  /**
   * Creates a new party
   *
   * @param command - Party creation data
   * @returns Created party data
   */
  async createParty(command: CreatePartyCommand): Promise<PartyDTO> {
    const { name, abbreviation, description, color_hex } = command;

    const { data, error } = await this.supabase
      .from("parties")
      .insert({
        name,
        abbreviation: abbreviation || null,
        description: description || null,
        color_hex: color_hex || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create party: ${error.message}`);
    }

    return data as PartyDTO;
  }
}
