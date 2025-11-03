import { test, expect } from "@playwright/test";
import { cleanupSpecificTestData, testDb } from "./helpers/db-helpers";
import { authenticateUser } from "./helpers/auth-helpers";

// Test configuration
// Use one of the seeded test users from seed.sql
const TEST_USER_EMAIL = "alice@example.com";
const TEST_USER_PASSWORD = "password123";
// Alice's user ID from seed.sql
const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";

// Unique IDs for this test suite's data
const TEST_PARTY_ID = "20202020-2020-2020-2020-202020202020";
const TEST_POLITICIAN_ID = "40404040-4040-4040-4040-404040404040";

test.describe("Add Statement Page", () => {
  test("should redirect to auth page if not authenticated", async ({ page }) => {
    await page.goto("/statements/new");
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe("Add Statement Page - Authenticated", () => {
  // Setup: Seed required test data
  test.beforeAll(async () => {
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
    await testDb.from("statements").delete().eq("created_by_user_id", TEST_USER_ID);
  });

  // Final cleanup
  test.afterAll(async () => {
    await cleanupSpecificTestData({
      politicianIds: [TEST_POLITICIAN_ID],
      partyIds: [TEST_PARTY_ID],
    });
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
