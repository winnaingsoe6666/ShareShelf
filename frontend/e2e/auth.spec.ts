/**
 * E2E Tests: Authentication Flows
 * Covers Journeys 1 (Registration) and 2 (Login)
 */
import { test, expect } from "@playwright/test";
import {
  registerUser,
  loginUser,
  logoutUser,
  clearSession,
  expectAuthenticated,
  expectGuest,
  expectTokenStored,
  expectTokenCleared,
} from "./helpers/auth";
import { generateBorrower } from "./helpers/testData";

test.describe("Registration", () => {
  test("successfully registers a new user and auto-logins", async ({ page }) => {
    const user = generateBorrower();

    await registerUser(page, user);

    // Should be on /items after auto-login
    expect(page.url()).toContain("/items");
    await expectTokenStored(page);
    await expectAuthenticated(page, user.name);
  });

  test("shows validation error for empty email", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Test User");
    // Leave email empty — HTML5 validation should trigger

    await page.getByRole("button", { name: "Create Account" }).click();

    // HTML5 validation prevents form submission — we should still be on /register
    expect(page.url()).toContain("/register");
  });

  test("shows validation error for short password", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill("test@e2e.test");
    await page.getByLabel("Password").fill("12"); // too short (< 6)

    await page.getByRole("button", { name: "Create Account" }).click();

    // Should still be on /register (either HTML5 validation or server error)
    expect(page.url()).toContain("/register");
  });
});

test.describe("Login", () => {
  test("successfully logs in with valid credentials", async ({ page }) => {
    // First register a user
    const user = generateBorrower();
    await registerUser(page, user);
    await logoutUser(page);

    // Then login
    await loginUser(page, user);

    expect(page.url()).toContain("/items");
    await expectTokenStored(page);
    await expectAuthenticated(page, user.name);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nonexistent@e2e.test");
    await page.getByLabel("Password").fill("wrongpassword");

    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show error message and stay on login page
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 10_000,
    });
    expect(page.url()).toContain("/login");
  });

  test("shows error for empty credentials", async ({ page }) => {
    await page.goto("/login");

    // Submit without filling anything
    await page.getByRole("button", { name: "Sign In" }).click();

    // HTML5 validation should prevent submission
    expect(page.url()).toContain("/login");
  });
});

test.describe("Logout", () => {
  test("clears session and redirects to home", async ({ page }) => {
    const user = generateBorrower();
    await registerUser(page, user);

    // Logout
    await logoutUser(page);

    // Verify sessionStorage is cleared
    await expectTokenCleared(page);

    // Verify guest navigation is shown
    await expectGuest(page);
  });
});

test.describe("Protected Routes", () => {
  test("/items/new redirects to /login when unauthenticated", async ({ page }) => {
    await clearSession(page);
    await page.goto("/items/new");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test("/borrow redirects to /login when unauthenticated", async ({ page }) => {
    await clearSession(page);
    await page.goto("/borrow");

    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test("/profile redirects to /login when unauthenticated", async ({ page }) => {
    await clearSession(page);
    await page.goto("/profile");

    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });
});

test.describe("Homepage Auth State", () => {
  test("homepage shows guest nav when not logged in", async ({ page }) => {
    await clearSession(page);
    await page.goto("/");

    await expect(page.getByText("Share tools,")).toBeVisible();
    await expectGuest(page);
  });

  test("homepage shows authenticated nav when logged in", async ({ page }) => {
    const user = generateBorrower();
    await registerUser(page, user);

    await page.goto("/");
    await expectAuthenticated(page, user.name);
  });
});
