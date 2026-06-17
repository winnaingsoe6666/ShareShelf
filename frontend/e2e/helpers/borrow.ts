import { Page, expect } from "@playwright/test";

/**
 * Submit a borrow request from the item detail page.
 * Assumes the user is on an item detail page for an available item they don't own.
 */
export async function requestBorrow(page: Page, message?: string): Promise<void> {
  // Click the "Request to Borrow" button
  await page.getByRole("button", { name: "Request to Borrow" }).click();

  // Wait for the modal
  await expect(page.getByRole("heading", { name: "Request to Borrow" })).toBeVisible();

  if (message) {
    await page.getByLabel("Message (optional)").fill(message);
  }

  await page.getByRole("button", { name: "Send Request" }).click();

  // Modal closes, success message appears
  await expect(page.getByText("Borrow request sent successfully!")).toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Navigate to the borrow page (My Borrows).
 */
export async function goToMyBorrows(page: Page): Promise<void> {
  await page.goto("/borrow");
  await expect(page.getByRole("heading", { name: "My Borrows" })).toBeVisible();
}

/**
 * Switch to the "Items I'm Lending" tab.
 */
export async function switchToLending(page: Page): Promise<void> {
  await page.getByRole("button", { name: /I'm Lending/i }).click();
}

/**
 * Approve a borrow request on the borrow page (as lender).
 */
export async function approveRequest(page: Page, itemTitle: string): Promise<void> {
  await goToMyBorrows(page);
  await switchToLending(page);

  // Find the card containing the item title and click Approve
  const card = page.locator(".space-y-4 > div").filter({ hasText: itemTitle }).first();
  await card.getByRole("button", { name: "Approve" }).click();

  // Verify status badge changes
  await expect(card.getByText("approved")).toBeVisible({ timeout: 10_000 });
}

/**
 * Reject a borrow request on the borrow page (as lender).
 */
export async function rejectRequest(page: Page, itemTitle: string): Promise<void> {
  await goToMyBorrows(page);
  await switchToLending(page);

  const card = page.locator(".space-y-4 > div").filter({ hasText: itemTitle }).first();
  await card.getByRole("button", { name: "Reject" }).click();

  await expect(card.getByText("rejected")).toBeVisible({ timeout: 10_000 });
}

/**
 * Mark a borrow as returned (as lender, when status is approved).
 */
export async function markReturned(page: Page, itemTitle: string): Promise<void> {
  await goToMyBorrows(page);
  await switchToLending(page);

  const card = page.locator(".space-y-4 > div").filter({ hasText: itemTitle }).first();
  await card.getByRole("button", { name: "Mark Returned" }).click();

  await expect(card.getByText("returned")).toBeVisible({ timeout: 10_000 });
}
