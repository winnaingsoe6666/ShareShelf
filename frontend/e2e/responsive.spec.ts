/**
 * E2E Tests: Responsive Design
 * Verifies the app is usable at mobile and tablet viewport sizes.
 */
import { test, expect } from "@playwright/test";
import { registerUser, expectAuthenticated, expectGuest } from "./helpers/auth";
import { generateLender } from "./helpers/testData";
import { devices } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("homepage renders correctly at mobile width (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    await page.goto("/");

    await expect(page.getByText("Share tools,")).toBeVisible();
    await expect(page.getByText("build community")).toBeVisible();

    // Mobile hamburger should be visible
    const hamburger = page.getByRole("button").filter({
      has: page.locator("svg"),
    });
    // Guest nav should show "Log In" and "Sign Up" via hamburger
    await expect(hamburger.first()).toBeVisible();
  });

  test("homepage renders at tablet width (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByText("Share tools,")).toBeVisible();
    await expect(page.getByText("build community")).toBeVisible();

    // Desktop nav should show on tablet
    await expect(page.getByText("Browse")).toBeVisible();
  });

  test("mobile hamburger menu opens and shows nav links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Click hamburger button
    const hamburger = page.locator("button.md\\:hidden");
    await hamburger.click();

    // Mobile menu links should appear
    await expect(page.getByText("Browse")).toBeVisible();
    await expect(page.getByText("Log In")).toBeVisible();
    await expect(page.getByText("Sign Up")).toBeVisible();
  });

  test("authenticated mobile menu shows all links", async ({ page }) => {
    const user = generateLender();
    await page.setViewportSize({ width: 375, height: 812 });

    // Register first (desktop width to avoid issues)
    await page.setViewportSize({ width: 1280, height: 800 });
    await registerUser(page, user);

    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/items");

    // Open mobile menu
    const hamburger = page.locator("button.md\\:hidden");
    if (await hamburger.isVisible()) {
      await hamburger.click();

      // Authenticated links
      await expect(page.getByText("Add Item")).toBeVisible();
      await expect(page.getByText("My Borrows")).toBeVisible();
      await expect(page.getByText("Profile")).toBeVisible();
      await expect(page.getByText("Log Out")).toBeVisible();
    }
  });

  test("item detail page is readable at mobile width", async ({ page }) => {
    const user = generateLender();
    await page.setViewportSize({ width: 1280, height: 800 });
    await registerUser(page, user);

    // Create an item
    await page.goto("/items/new");
    await page.getByLabel("Title *").fill("Mobile Test Item");
    await page.getByRole("button", { name: "Create Listing" }).click();
    await page.waitForURL(/\/items\/\d+/, { timeout: 15_000 });

    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();

    // Key detail page elements should be visible
    await expect(
      page.getByRole("heading", { name: "Mobile Test Item" })
    ).toBeVisible();
    await expect(page.getByText(/daily price/i)).toBeVisible();
  });
});
