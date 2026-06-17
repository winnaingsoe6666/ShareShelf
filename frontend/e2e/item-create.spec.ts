/**
 * E2E Tests: Item Creation
 * Covers Journey 4 (Item Creation)
 */
import { test, expect } from "@playwright/test";
import { registerUser, loginUser } from "./helpers/auth";
import { createItem, browseItems } from "./helpers/items";
import { generateLender, generateItem } from "./helpers/testData";

test.describe("Item Creation", () => {
  let lender: ReturnType<typeof generateLender>;

  test.beforeAll(() => {
    lender = generateLender();
  });

  test("creates item with all fields", async ({ page }) => {
    await registerUser(page, lender);

    const item = generateItem();
    const detailUrl = await createItem(page, item);

    // Verify redirect to detail page
    expect(detailUrl).toMatch(/\/items\/\d+/);
    await expect(page.getByRole("heading", { name: item.title })).toBeVisible();
    await expect(page.getByText(item.description)).toBeVisible();

    // Price info should be visible
    await expect(page.getByText(/\$5.00/)).toBeVisible();
    await expect(page.getByText(/\$50.00/)).toBeVisible();

    // Category should show
    await expect(page.getByText("Tools")).toBeVisible();

    // Status badge
    await expect(page.getByText("available")).toBeVisible();
  });

  test("creates item with only required fields", async ({ page }) => {
    await loginUser(page, lender);

    const item = generateItem();
    await page.goto("/items/new");
    await page.getByLabel("Title *").fill(item.title);
    await page.getByRole("button", { name: "Create Listing" }).click();

    // Should still create successfully
    await page.waitForURL(/\/items\/\d+/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: item.title })).toBeVisible();
  });

  test("redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/items/new");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test("new item appears in the browse list", async ({ page }) => {
    await loginUser(page, lender);

    const item = generateItem();
    const detailUrl = await createItem(page, item);

    // Go back to browse
    await browseItems(page);

    // The created item should be visible
    await expect(page.getByText(item.title)).toBeVisible();
  });
});
