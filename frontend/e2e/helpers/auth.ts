import { Page, expect } from "@playwright/test";
import type { TestUser } from "./testData";

/**
 * Register a new user via the /register page.
 * Note: The app auto-logs in after registration and redirects to /items.
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

  await page.getByLabel("Full Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  if (user.community) {
    await page.getByLabel("Community (optional)").fill(user.community);
  }

  await page.getByRole("button", { name: "Create Account" }).click();

  // After auto-login, expect redirect to /items
  await page.waitForURL(/\/items(\?|$)/, { timeout: 15_000 });
}

/**
 * Log in with existing credentials via the /login page.
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);

  await page.getByRole("button", { name: "Sign In" }).click();

  // Expect redirect to /items after login
  await page.waitForURL(/\/items(\?|$)/, { timeout: 15_000 });
}

/**
 * Verify the user is authenticated — checks navbar shows authenticated links.
 */
export async function expectAuthenticated(page: Page, userName: string): Promise<void> {
  await expect(page.getByText("Add Item")).toBeVisible();
  await expect(page.getByText("My Borrows")).toBeVisible();
  await expect(page.getByText("Profile")).toBeVisible();
  await expect(page.getByText("Log Out")).toBeVisible();
}

/**
 * Verify the user is NOT authenticated — checks navbar shows guest links.
 */
export async function expectGuest(page: Page): Promise<void> {
  await expect(page.getByText("Log In")).toBeVisible();
  await expect(page.getByText("Sign Up")).toBeVisible();
}

/**
 * Log out via the navbar button.
 */
export async function logoutUser(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForURL("/");
  await expectGuest(page);
}

/**
 * Clear all auth state from sessionStorage.
 */
export async function clearSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    sessionStorage.removeItem("shareshelf_token");
    sessionStorage.removeItem("shareshelf_user");
  });
}

/**
 * Assert JWT token exists in sessionStorage.
 */
export async function expectTokenStored(page: Page): Promise<void> {
  const token = await page.evaluate(() => sessionStorage.getItem("shareshelf_token"));
  expect(token).toBeTruthy();
}

/**
 * Assert JWT token is NOT in sessionStorage.
 */
export async function expectTokenCleared(page: Page): Promise<void> {
  const token = await page.evaluate(() => sessionStorage.getItem("shareshelf_token"));
  expect(token).toBeNull();
}
