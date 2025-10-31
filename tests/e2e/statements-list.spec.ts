import { test, expect } from "@playwright/test";

test.describe("Statements List Page", () => {
  test("should load the homepage and display statements", async ({ page }) => {
    await page.goto("/");

    // Verify page loads
    await expect(page.locator("main")).toBeVisible();

    // Check for page header
    await expect(page.locator("h1").filter({ hasText: /recent statements/i })).toBeVisible();

    // Wait for at least one statement to load
    await page.waitForSelector('[data-testid="statement-card"]', { timeout: 10000 });

    // Verify statements are visible
    const statementCards = page.locator('[data-testid="statement-card"]');
    await expect(statementCards.first()).toBeVisible();
  });

  test("should display politician names and allow navigation", async ({ page }) => {
    await page.goto("/");

    // Wait for statements
    await page.waitForSelector('[data-testid="statement-card"]');

    // Check if politician links exist
    const politicianLink = page.locator('[data-testid="politician-link"]').first();
    await expect(politicianLink).toBeVisible();

    // Click and verify navigation
    await politicianLink.click();
    await expect(page).toHaveURL(/\/politicians\/[a-f0-9-]+/);
  });

  test("should display statement timestamps", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="statement-card"]');

    // Verify at least one timestamp is visible
    const timestamp = page.locator('[data-testid="statement-timestamp"]').first();
    await expect(timestamp).toBeVisible();
  });
});
