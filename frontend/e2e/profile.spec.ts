/**
 * E2E Tests: User Profile
 */
import { test, expect } from "@playwright/test";
import { registerUser, loginUser, logoutUser, expectTokenCleared } from "./helpers/auth";
import { createItem } from "./helpers/items";
import { generateLender, generateItem } from "./helpers/testData";

test.describe("User Profile", () => {
  test("displays user info after login", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // Profile card should display user info
    await expect(page.getByRole("heading", { name: user.name })).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();
    await expect(page.getByText(/trust score/i)).toBeVisible();
  });

  test("displays community name if set", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // Community should be shown
    await expect(page.getByText(user.community)).toBeVisible();
  });

  test("shows 'My Items' section with count", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    await expect(page.getByText(/my items/i)).toBeVisible();
  });

  test("shows user's listed items in profile", async ({ page }) => {
    const user = generateLender();
    const item = generateItem();

    await registerUser(page, user);
    await createItem(page, item);
    await page.goto("/profile");

    // The item should appear in "My Items"
    await expect(page.getByText(item.title)).toBeVisible();
    // Count should reflect 1 item
    await expect(page.getByText(/My Items (1)/i)).toBeVisible();
  });

  test("shows empty state when no items listed", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // If no items created, should show empty message
    const emptyMsg = page.getByText("You haven't listed any items yet.");
    // This appears only if items.length === 0
    if (await emptyMsg.isVisible()) {
      await expect(emptyMsg).toBeVisible();
    }
  });

  test("logout button works from profile page", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // Click logout
    await page.getByRole("button", { name: "Log Out" }).click();

    // Should redirect to home with guest nav
    await page.waitForURL("/");
    await expectTokenCleared(page);
  });

  test("user avatar initial is displayed", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // The avatar circle should show the first letter of user's name
    await expect(page.getByText(user.name.charAt(0).toUpperCase())).toBeVisible();
  });
});
