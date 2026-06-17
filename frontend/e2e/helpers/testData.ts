/**
 * Test data factory — generates unique user/item data for E2E tests.
 * Uses timestamp to avoid collisions across test runs.
 */
let counter = 0;

function nextId(): number {
  counter += 1;
  return Date.now() + counter;
}

export interface TestUser {
  name: string;
  email: string;
  password: string;
  community: string;
}

export interface TestItem {
  title: string;
  description: string;
  dailyPrice: string;
  depositAmount: string;
  categoryIndex: number; // 0-based index for category select
}

export function generateBorrower(): TestUser {
  const id = nextId();
  return {
    name: `Bob Borrower ${id}`,
    email: `borrower-${id}@e2e.test`,
    password: "testpass123",
    community: "E2E Test Neighborhood",
  };
}

export function generateLender(): TestUser {
  const id = nextId();
  return {
    name: `Alice Lender ${id}`,
    email: `lender-${id}@e2e.test`,
    password: "testpass123",
    community: "E2E Test Neighborhood",
  };
}

export function generateItem(): TestItem {
  const id = nextId();
  return {
    title: `Cordless Drill ${id}`,
    description: "A well-maintained cordless drill. Comes with two batteries and a charger case.",
    dailyPrice: "5.00",
    depositAmount: "50.00",
    categoryIndex: 0, // "Tools" — first in the hardcoded list
  };
}

export const VALID_CATEGORIES = [
  "Tools",
  "Electronics",
  "Outdoor & Camping",
  "Sports & Fitness",
  "Kitchen & Dining",
  "Gardening",
] as const;
