import type { Page } from "@playwright/test";

/**
 * Authenticate user through the app's auth page
 */
export async function authenticateUser(page: Page, email: string, password: string) {
  // Navigate to the auth page
  await page.goto("/auth#signin");

  // Wait for the sign-in form to be fully loaded and interactive
  await page.waitForSelector("#signin-email", { state: "visible", timeout: 5000 });
  await page.waitForSelector("#signin-password", { state: "visible", timeout: 5000 });

  // Click into the email field first to ensure it's focused
  await page.locator("#signin-email").click();
  await page.waitForTimeout(100);

  // Type the email
  await page.locator("#signin-email").fill(email);
  await page.waitForTimeout(100);

  // Click into the password field
  await page.locator("#signin-password").click();
  await page.waitForTimeout(100);

  // Type the password
  await page.locator("#signin-password").fill(password);
  await page.waitForTimeout(500);

  // Click the sign-in button
  await page.locator('#signin-panel button[type="submit"]').click();

  // Wait for redirect after successful login (wait for URL to change away from /auth)
  await page.waitForURL((url) => !url.pathname.includes("/auth"), { timeout: 10000 });

  // Additional wait to ensure session is fully established
  await page.waitForTimeout(1000);
}

/**
 * Sign out user by clearing localStorage
 */
export async function signOutUser(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.context().clearCookies();
}
