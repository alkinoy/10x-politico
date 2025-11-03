import { test, expect } from "@playwright/test";
import { cleanupSpecificTestData, createTestUser, testDb } from "./helpers/db-helpers";
import { authenticateUser } from "./helpers/auth-helpers";

// Test configuration
// Use a valid email format that cloud Supabase will accept
const TEST_USER_EMAIL = "test.user@example.com";
const TEST_USER_PASSWORD = "TestPassword123!";

// Unique IDs for this test suite's data
const TEST_PARTY_ID = "20202020-2020-2020-2020-202020202020";
const TEST_POLITICIAN_ID = "40404040-4040-4040-4040-404040404040";

test.describe("Add Statement Page", () => {
  let testUserId: string;

  // Setup: Create test user and seed required data
  test.beforeAll(async () => {
    // Create test user
    const user = await createTestUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    if (!user) {
      throw new Error("Failed to create test user");
    }
    testUserId = user.id;

    // Clean up any existing test data with these IDs
    await cleanupSpecificTestData({
      politicianIds: [TEST_POLITICIAN_ID],
      partyIds: [TEST_PARTY_ID],
    });

    // Seed test party
    const { error: partyError } = await testDb.from("parties").insert({
      id: TEST_PARTY_ID,
      name: "Test Party",
      abbreviation: "TP",
      color_hex: "#0015BC",
    });
    if (partyError) throw partyError;

    // Seed test politician
    const { error: politicianError } = await testDb.from("politicians").insert({
      id: TEST_POLITICIAN_ID,
      first_name: "Test",
      last_name: "Politician",
      party_id: TEST_PARTY_ID,
      biography: "Test politician for e2e testing",
    });
    if (politicianError) throw politicianError;
  });

  // Cleanup after each test
  test.afterEach(async () => {
    // Delete any statements created during tests
    await testDb.from("statements").delete().eq("created_by_user_id", testUserId);
  });

  // Final cleanup
  test.afterAll(async () => {
    await cleanupSpecificTestData({
      politicianIds: [TEST_POLITICIAN_ID],
      partyIds: [TEST_PARTY_ID],
    });
  });

  test("should redirect to auth page if not authenticated", async ({ page }) => {
    await page.goto("/statements/new");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("should display form when authenticated", async ({ page }) => {
    await authenticateUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await page.goto("/statements/new");

    // Verify form elements are visible
    await expect(page.locator('[data-testid="politician-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="statement-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
  });
});
