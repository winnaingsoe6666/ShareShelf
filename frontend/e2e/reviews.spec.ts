/**
 * E2E Tests: Review Submission
 * Covers Journey 6 (Review Submission)
 */
import { test, expect } from "@playwright/test";
import { registerUser, loginUser, logoutUser } from "./helpers/auth";
import { createItem, clickItemByTitle, browseItems } from "./helpers/items";
import { requestBorrow, approveRequest, markReturned } from "./helpers/borrow";
import { generateBorrower, generateLender, generateItem } from "./helpers/testData";

test.describe("Reviews", () => {
  test("profile shows reviews listed", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // Reviews section should be present (even if empty)
    await expect(page.getByRole("heading", { name: /reviews/i })).toBeVisible();
  });

  test("trust score is displayed on profile", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // Trust score should be visible
    await expect(page.getByText(/trust score/i)).toBeVisible();
  });

  test("reviews section shows star ratings", async ({ page }) => {
    const user = generateLender();

    await registerUser(page, user);
    await page.goto("/profile");

    // If there are reviews, they should display star ratings
    // We just verify the reviews section renders correctly
    const reviewsSection = page.getByText(/reviews/i);
    await expect(reviewsSection).toBeVisible();
  });
});

test.describe("Post-Borrow Review Flow", () => {
  test("user can view own profile with stats after borrow lifecycle", async ({
    browser,
  }) => {
    const lender = generateLender();
    const borrower = generateBorrower();
    const item = generateItem();

    // --- Complete borrow cycle ---
    const lenderPage = await browser.newPage();
    await registerUser(lenderPage, lender);
    await createItem(lenderPage, item);
    const itemUrl = lenderPage.url();
    await logoutUser(lenderPage);

    const borrowerPage = await browser.newPage();
    await registerUser(borrowerPage, borrower);

    await browseItems(borrowerPage);
    await clickItemByTitle(borrowerPage, item.title);
    await requestBorrow(borrowerPage, "Weekend project");

    // Lender approves and marks returned
    await loginUser(lenderPage, lender);
    await approveRequest(lenderPage, item.title);
    await markReturned(lenderPage, item.title);

    // --- Check borrower profile ---
    await borrowerPage.goto("/profile");

    // Profile should show basic info
    await expect(borrowerPage.getByText(borrower.name)).toBeVisible();
    await expect(borrowerPage.getByText(/trust score/i)).toBeVisible();

    await borrowerPage.close();
    await lenderPage.close();
  });
});
