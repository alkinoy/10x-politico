import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/db/database.types";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.test");
}

// Use service role key for tests - has admin privileges and bypasses RLS
export const testDb = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Clean up test data before/after tests
 */
export async function cleanupTestData() {
  // Delete in order respecting foreign key constraints
  await testDb.from("statements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await testDb.from("politicians").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await testDb.from("parties").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  // Note: Don't delete profiles/users - those are managed separately
}

/**
 * Clean up specific test data by IDs
 */
export async function cleanupSpecificTestData(ids: {
  statementIds?: string[];
  politicianIds?: string[];
  partyIds?: string[];
}) {
  // Delete in order respecting foreign key constraints
  if (ids.statementIds && ids.statementIds.length > 0) {
    await testDb.from("statements").delete().in("id", ids.statementIds);
  }
  if (ids.politicianIds && ids.politicianIds.length > 0) {
    await testDb.from("politicians").delete().in("id", ids.politicianIds);
  }
  if (ids.partyIds && ids.partyIds.length > 0) {
    await testDb.from("parties").delete().in("id", ids.partyIds);
  }
}

/**
 * Seed test parties
 */
export async function seedTestParties() {
  const parties = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Test Democratic Party",
      abbreviation: "TDP",
      color_hex: "#0015BC",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Test Republican Party",
      abbreviation: "TRP",
      color_hex: "#E81B23",
    },
  ];

  const { error } = await testDb.from("parties").upsert(parties);
  if (error) throw error;

  return parties;
}

/**
 * Seed test politicians
 */
export async function seedTestPoliticians() {
  const politicians = [
    {
      id: "33333333-3333-3333-3333-333333333333",
      first_name: "John",
      last_name: "TestPolitician",
      party_id: "11111111-1111-1111-1111-111111111111",
      biography: "Test politician for e2e testing",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      first_name: "Jane",
      last_name: "TestSenator",
      party_id: "22222222-2222-2222-2222-222222222222",
      biography: "Test senator for e2e testing",
    },
  ];

  const { error } = await testDb.from("politicians").upsert(politicians);
  if (error) throw error;

  return politicians;
}

/**
 * Seed test statements
 */
export async function seedTestStatements(userId: string) {
  const statements = [
    {
      id: "55555555-5555-5555-5555-555555555555",
      politician_id: "33333333-3333-3333-3333-333333333333",
      statement_text:
        "We need comprehensive healthcare reform to ensure every citizen has access to quality medical care.",
      statement_timestamp: new Date("2025-10-30T10:00:00Z").toISOString(),
      created_by_user_id: userId,
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      politician_id: "44444444-4444-4444-4444-444444444444",
      statement_text: "Lower taxes for small businesses will stimulate economic growth and create more jobs.",
      statement_timestamp: new Date("2025-10-29T15:30:00Z").toISOString(),
      created_by_user_id: userId,
    },
    {
      id: "77777777-7777-7777-7777-777777777777",
      politician_id: "33333333-3333-3333-3333-333333333333",
      statement_text: "Climate change is the defining challenge of our generation and requires immediate action.",
      statement_timestamp: new Date("2025-10-28T09:15:00Z").toISOString(),
      created_by_user_id: userId,
    },
  ];

  const { error } = await testDb.from("statements").upsert(statements);
  if (error) throw error;

  return statements;
}

/**
 * Create a test user using Admin API (bypasses email confirmation)
 * This creates a user that can be authenticated via signInWithPassword
 */
export async function createTestUser(email: string, password: string) {
  // Use Admin API to create user with email_confirm true
  // This bypasses email confirmation and creates a proper auth user
  const { data, error } = await testDb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: "Test User",
    },
  });

  if (error) {
    // If user already exists, try to get their info
    if (error.message.includes("already registered")) {
      // User exists, return a dummy user object with known ID
      // In practice, we should use a known test user ID
      return null;
    }
    throw error;
  }

  return data.user;
}

/**
 * Get test user session
 */
export async function getTestUserSession(email: string, password: string) {
  const { data, error } = await testDb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
}

/**
 * Full test database setup
 */
export async function setupTestDatabase(userId: string) {
  await cleanupTestData();
  await seedTestParties();
  await seedTestPoliticians();
  await seedTestStatements(userId);
}
