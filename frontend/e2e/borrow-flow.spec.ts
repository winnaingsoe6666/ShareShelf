/**
 * E2E Tests: Borrow Request Lifecycle
 * Covers Journey 5 (Borrow Request Lifecycle) — the most critical flow
 *
 * Tests the full borrow lifecycle across two user sessions:
 *   Borrower → Request → Lender approves/rejects → Return
 */
import { test, expect } from "@playwright/test";
import { registerUser, loginUser, logoutUser } from "./helpers/auth";
import { createItem, clickItemByTitle, browseItems } from "./helpers/items";
import {
  requestBorrow,
  goToMyBorrows,
  switchToLending,
  approveRequest,
  rejectRequest,
  markReturned,
} from "./helpers/borrow";
import { generateBorrower, generateLender, generateItem } from "./helpers/testData";

test.describe("Borrow Request Lifecycle", () => {
  let lender: ReturnType<typeof generateLender>;
  let borrower: ReturnType<typeof generateBorrower>;
  let item: ReturnType<typeof generateItem>;

  test.beforeAll(() => {
    lender = generateLender();
    borrower = generateBorrower();
    item = generateItem();
  });

  test("full borrow lifecycle: request → approve → return", async ({
    browser,
  }) => {
    // --- SETUP: Lender creates item ---
    const lenderPage = await browser.newPage();
    await registerUser(lenderPage, lender);
    await createItem(lenderPage, item);
    const itemUrl = lenderPage.url();
    await logoutUser(lenderPage);

    // --- SETUP: Borrower registers ---
    const borrowerPage = await browser.newPage();
    await registerUser(borrowerPage, borrower);

    // --- BORROWER: Find and request the item ---
    await browseItems(borrowerPage);
    await clickItemByTitle(borrowerPage, item.title);

    // Should see "Request to Borrow" button (borrower is not the owner)
    const requestBtn = borrowerPage.getByRole("button", {
      name: "Request to Borrow",
    });
    await expect(requestBtn).toBeVisible();

    await requestBorrow(borrowerPage, "I need this for a weekend project!");

    // --- LENDER: Approve the request ---
    await loginUser(lenderPage, lender);
    await goToMyBorrows(lenderPage);
    await switchToLending(lenderPage);

    // Verify pending request appears
    await expect(lenderPage.getByText("pending")).toBeVisible();
    await expect(lenderPage.getByText(item.title)).toBeVisible();

    // Approve it
    await approveRequest(lenderPage, item.title);

    // --- BORROWER: Verify approval on borrow page ---
    await goToMyBorrows(borrowerPage);
    // Switch to "Items I'm Borrowing" tab (default)
    await expect(borrowerPage.getByText("approved")).toBeVisible({
      timeout: 10_000,
    });

    // --- LENDER: Mark as returned ---
    await markReturned(lenderPage, item.title);

    // Verify returned status
    await expect(lenderPage.getByText("returned")).toBeVisible();

    // Cleanup
    await borrowerPage.close();
    await lenderPage.close();
  });

  test("lender can reject a borrow request", async ({ browser }) => {
    const rejectLender = generateLender();
    const rejectBorrower = generateBorrower();
    const rejectItem = generateItem();

    // Setup
    const lenderPage = await browser.newPage();
    await registerUser(lenderPage, rejectLender);
    await createItem(lenderPage, rejectItem);
    await logoutUser(lenderPage);

    const borrowerPage = await browser.newPage();
    await registerUser(borrowerPage, rejectBorrower);

    // Borrower requests
    await browseItems(borrowerPage);
    await clickItemByTitle(borrowerPage, rejectItem.title);
    await requestBorrow(borrowerPage, "Can I borrow this?");

    // Lender rejects
    await loginUser(lenderPage, rejectLender);
    await rejectRequest(lenderPage, rejectItem.title);

    // Verify rejected
    await expect(lenderPage.getByText("rejected")).toBeVisible();

    await borrowerPage.close();
    await lenderPage.close();
  });

  test("owner cannot request their own item", async ({ page }) => {
    const owner = generateLender();
    const ownerItem = generateItem();

    await registerUser(page, owner);
    await createItem(page, ownerItem);

    // Owner should see "This is your listing" not "Request to Borrow"
    await expect(page.getByText("This is your listing")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Request to Borrow" })
    ).not.toBeVisible();
  });
});
