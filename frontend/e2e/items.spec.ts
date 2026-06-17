/**
 * E2E Tests: Item Browsing & Search
 * Covers Journey 3 (Item Browsing & Search)
 */
import { test, expect } from "@playwright/test";
import { registerUser, logoutUser, loginUser } from "./helpers/auth";
import { createItem, clickItemByTitle, expectItemDetailVisible } from "./helpers/items";
import { generateLender, generateItem } from "./helpers/testData";

test.describe("Item Browsing & Search", () => {
  let lender: ReturnType<typeof generateLender>;
  let testItem: ReturnType<typeof generateItem>;

  test.beforeAll(() => {
    lender = generateLender();
    testItem = generateItem();
  });

  test("items page loads with grid layout", async ({ page }) => {
    // Register and create an item so there's something to browse
    await registerUser(page, lender);
    await createItem(page, testItem);

    // Go back to browse
    await page.goto("/items");

    // Verify grid is present
    await expect(page.getByRole("heading", { name: "Browse Items" })).toBeVisible();
    await expect(page.getByText("Add Item")).toBeVisible();

    // Should see the item we created in a grid
    const grid = page.locator(".grid");
    await expect(grid).toBeVisible();
    await expect(page.getByText(testItem.title)).toBeVisible();
  });

  test("search input filters items by keyword", async ({ page }) => {
    await loginUser(page, lender);
    await page.goto("/items");

    // Search for the item we created
    const searchInput = page.getByPlaceholder("Search items...");
    await searchInput.fill(testItem.title.substring(0, 5));

    // Only matching items should show
    await expect(page.getByText(testItem.title)).toBeVisible();

    // Search for something nonexistent
    await searchInput.fill("zzz_nonexistent_item_zzz");
    await expect(page.getByText("No items found")).toBeVisible();

    // Clear search
    await searchInput.fill("");
    // Items should reappear
    await expect(page.getByText(testItem.title)).toBeVisible();
  });

  test("category dropdown filters items", async ({ page }) => {
    await loginUser(page, lender);
    await page.goto("/items");

    // Select the category we used for the test item (Tools = index 0 → value "1")
    const categorySelect = page.getByRole("combobox");
    await categorySelect.selectOption("1");

    // Should show items in Tools category
    await expect(page.getByText(testItem.title)).toBeVisible();

    // Switch to a different category
    await categorySelect.selectOption("2"); // Electronics
    await expect(page.getByText("No items found")).toBeVisible();

    // Reset to all
    await categorySelect.selectOption("");
    await expect(page.getByText(testItem.title)).toBeVisible();
  });

  test("item detail page shows full info", async ({ page }) => {
    await loginUser(page, lender);
    await page.goto("/items");

    // Click into the item
    await clickItemByTitle(page, testItem.title);

    // Verify detail page elements
    await expectItemDetailVisible(page, testItem);
    await expect(page.getByText(/daily price/i)).toBeVisible();
    await expect(page.getByText(/owner/i)).toBeVisible();
    await expect(page.getByText(/listed/i)).toBeVisible();
    await expect(page.getByText("available")).toBeVisible();
  });

  test("empty state when no items match", async ({ page }) => {
    await loginUser(page, lender);
    await page.goto("/items");

    // Search for a term that shouldn't match anything
    const searchInput = page.getByPlaceholder("Search items...");
    await searchInput.fill("xyznonexistent999");

    await expect(page.getByText("No items found")).toBeVisible();
  });
});
