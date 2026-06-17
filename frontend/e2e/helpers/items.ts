import { Page, expect } from "@playwright/test";
import type { TestItem } from "./testData";

/**
 * Navigate to the items browse page.
 */
export async function browseItems(page: Page): Promise<void> {
  await page.goto("/items");
  await expect(page.getByRole("heading", { name: "Browse Items" })).toBeVisible();
}

/**
 * Create a new item via /items/new.
 * Assumes user is already authenticated.
 * Returns the item detail page URL or item ID.
 */
export async function createItem(page: Page, item: TestItem): Promise<string> {
  await page.goto("/items/new");
  await expect(page.getByRole("heading", { name: "List a New Item" })).toBeVisible();

  await page.getByLabel("Title *").fill(item.title);
  if (item.description) {
    await page.getByRole("textbox", { name: /description/i }).fill(item.description);
  }
  if (item.dailyPrice) {
    await page.getByLabel(/Daily price/i).fill(item.dailyPrice);
  }
  if (item.depositAmount) {
    await page.getByLabel(/Deposit/i).fill(item.depositAmount);
  }
  if (item.categoryIndex >= 0) {
    // The category select uses a hardcoded list: Tools=1, Electronics=2, etc.
    await page.getByRole("combobox", { name: /category/i }).selectOption(
      String(item.categoryIndex + 1)
    );
  }

  await page.getByRole("button", { name: "Create Listing" }).click();

  // Should redirect to /items/[id]
  await page.waitForURL(/\/items\/\d+/, { timeout: 15_000 });

  return page.url();
}

/**
 * Get the item ID from a URL like /items/42.
 */
export function getItemIdFromUrl(url: string): number {
  const match = url.match(/\/items\/(\d+)/);
  if (!match) throw new Error(`Cannot extract item ID from URL: ${url}`);
  return Number(match[1]);
}

/**
 * Click an item card by title text on the browse page.
 */
export async function clickItemByTitle(page: Page, title: string): Promise<void> {
  // Item cards in the grid are Link elements wrapping ItemCard
  await page.getByRole("link").filter({ hasText: title }).first().click();
  await page.waitForURL(/\/items\/\d+/, { timeout: 10_000 });
}

/**
 * Verify item detail page shows expected information.
 */
export async function expectItemDetailVisible(page: Page, item: TestItem): Promise<void> {
  await expect(page.getByRole("heading", { name: item.title })).toBeVisible();
}
