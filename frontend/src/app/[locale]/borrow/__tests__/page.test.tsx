import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock data
const mockUser = { id: 5, name: "Test User", email: "test@test.com", trustScore: 4.5 };

const mockRequests = [
  {
    id: 1, itemId: 10, itemTitle: "Drill", borrowerId: 5, borrowerName: "Test User",
    ownerId: 3, ownerName: "Alice", status: "approved" as const,
    startDate: "2026-01-01", endDate: "2026-01-05", message: "Need for weekend",
    createdAt: "2025-12-30T00:00:00Z",
  },
  {
    id: 2, itemId: 20, itemTitle: "Lawnmower", borrowerId: 5, borrowerName: "Test User",
    ownerId: 4, ownerName: "Bob", status: "pending" as const,
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: 3, itemId: 30, itemTitle: "Ladder", borrowerId: 99, borrowerName: "Stranger",
    ownerId: 5, ownerName: "Test User", status: "pending" as const,
    createdAt: "2026-02-01T00:00:00Z",
  },
];

const mockPush = vi.fn();

// Module-level mocks
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => true),
  getUser: vi.fn(() => mockUser),
  getToken: vi.fn(() => "mock-token"),
  clearAuth: vi.fn(),
  saveAuth: vi.fn(),
}));

// Mock nav + borrow translations so Navbar and page render with translations
const navTranslations: Record<string, string> = {
  "nav.browse": "Browse",
  "nav.community": "Community",
  "nav.addItem": "Add Item",
  "nav.myBorrows": "My Borrows",
  "nav.profile": "Profile",
  "nav.logOut": "Log Out",
  "nav.logIn": "Log In",
  "nav.signUp": "Sign Up",
  "nav.notifications": "Notifications",
  "nav.markAllRead": "Mark all read",
  "nav.noNotifications": "No notifications",
  "borrow.title": "My Borrows",
  "borrow.borrowing": "Items I'm Borrowing",
  "borrow.lending": "Items I'm Lending",
  "borrow.noRequests": "No requests found.",
  "borrow.owner": "Owner",
  "borrow.borrower": "Borrower",
  "borrow.requested": "Requested",
  "borrow.approve": "Approve",
  "borrow.reject": "Reject",
  "borrow.markReturned": "Mark Returned",
  "borrow.failedToLoad": "Failed to load borrow requests. Please try again.",
  "borrowPage.title": "My Borrows",
  "borrowPage.borrowing": "Borrowing",
  "borrowPage.lending": "Lending",
  "borrowPage.noBorrowing": "You haven't borrowed anything yet.",
  "borrowPage.noLending": "No one has borrowed your items yet.",
  "borrowPage.requestedOn": "Requested",
  "borrowPage.chat": "Chat",
  "borrowPage.failedToLoad": "Failed to load borrow requests.",
};

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => navTranslations[key] || key),
}));

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => "/borrow"),
}));

import BorrowPage from "../page";
import api from "@/lib/api";

describe("BorrowPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { content: mockRequests }, success: true },
    });
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true },
    });
  });

  // ── FIX-02 Tab Filter Tests ───────────────────────────────────────────

  it("borrowed tab shows only requests where borrowerId matches current user", async () => {
    render(<BorrowPage />);

    await waitFor(() => {
      expect(screen.queryByText("Drill")).toBeInTheDocument();
    });

    // Only requests where borrowerId === 5 (current user) should appear
    expect(screen.getByText("Drill")).toBeInTheDocument();
    expect(screen.getByText("Lawnmower")).toBeInTheDocument();
    // Ladder has borrowerId=99, should NOT appear in borrowed tab
    expect(screen.queryByText("Ladder")).not.toBeInTheDocument();
  });

  it("lent tab shows only requests where ownerId matches current user", async () => {
    render(<BorrowPage />);

    await waitFor(() => {
      expect(screen.queryByText("Drill")).toBeInTheDocument();
    });

    // Click "Lending" tab
    fireEvent.click(screen.getByRole("button", { name: "Lending" }));

    await waitFor(() => {
      // Only requests where ownerId === 5 (current user) should appear
      expect(screen.getByText("Ladder")).toBeInTheDocument();
    });

    // Drill and Lawnmower have different owners, should not appear in lent tab
    expect(screen.queryByText("Drill")).not.toBeInTheDocument();
    expect(screen.queryByText("Lawnmower")).not.toBeInTheDocument();
  });

  it("empty state shown when filtered requests are empty", async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { content: [] }, success: true },
    });

    render(<BorrowPage />);

    await waitFor(() => {
      expect(screen.getByText("You haven't borrowed anything yet.")).toBeInTheDocument();
    });
  });

  // ── FIX-06 Error Handling Tests ───────────────────────────────────────

  it("shows error banner when initial fetch fails", async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    render(<BorrowPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load borrow requests.")
      ).toBeInTheDocument();
    });

    // Error banner should use the established red-50 pattern
    const errorBanner = screen.getByText("Failed to load borrow requests.");
    expect(errorBanner.className).toContain("bg-red-50");
    expect(errorBanner.className).toContain("text-red-700");
  });

  it("shows action error message when approve/reject/return fails", async () => {
    // Setup: a borrowed request to confirm load, and a lent-pending request for approve action
    const actionMockRequests = [
      {
        id: 1, itemId: 10, itemTitle: "Drill", borrowerId: 5, borrowerName: "Test User",
        ownerId: 3, ownerName: "Alice", status: "approved" as const,
        createdAt: "2025-12-30T00:00:00Z",
      },
      {
        id: 3, itemId: 30, itemTitle: "Ladder", borrowerId: 99, borrowerName: "Stranger",
        ownerId: 5, ownerName: "Test User", status: "pending" as const,
        createdAt: "2026-02-01T00:00:00Z",
      },
    ];
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { content: actionMockRequests }, success: true },
    });
    (api.put as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Action failed"));

    render(<BorrowPage />);

    // Wait for borrowed-tab item to confirm page loaded
    await waitFor(() => {
      expect(screen.queryByText("Drill")).toBeInTheDocument();
    });

    // Switch to lent tab so Approve button for Ladder is visible
    fireEvent.click(screen.getByRole("button", { name: "Lending" }));

    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeInTheDocument();
    });

    // Click Approve — should trigger action error
    fireEvent.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to approve request. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("loading state shows skeleton placeholders", () => {
    // Use a never-resolving promise so loading stays true during render
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (api.get as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(<BorrowPage />);

    // Skeleton renders with role="status" and aria-label="Loading"
    const skeletons = screen.getAllByRole("status", { name: "Loading" });
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
