import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockClearAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  getUser: vi.fn(() => ({ id: 1, name: "Test User", email: "test@test.com", trustScore: 4.5 })),
  clearAuth: vi.fn(),
  isAuthenticated: vi.fn(() => true),
  getToken: vi.fn(() => "mock-token"),
  saveAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: { count: 0 } } })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => "/"),
}));

// Mock useLocale and useTranslations from next-intl.
// useTranslations returns a lookup that maps nav keys to their English text.
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
};

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => navTranslations[key] || key),
}));

import Navbar from "@/components/layout/Navbar";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockClearAuth.mockClear();
  });

  it("renders brand name", () => {
    render(<Navbar />);
    expect(screen.getByText("ShareShelf")).toBeInTheDocument();
  });

  it("shows logged-in links when authenticated", () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    render(<Navbar />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
    expect(screen.getByText("My Borrows")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
  });

  it("shows logged-out links when not authenticated", () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);
    render(<Navbar />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Add Item")).not.toBeInTheDocument();
    expect(screen.queryByText("My Borrows")).not.toBeInTheDocument();
    expect(screen.queryByText("Community")).not.toBeInTheDocument();
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
  });

  it("renders notification bell when logged in", () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    render(<Navbar />);
    const bell = screen.getByLabelText("Notifications");
    expect(bell).toBeInTheDocument();
  });

  it("does not render notification bell when logged out", () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);
    render(<Navbar />);
    expect(screen.queryByLabelText("Notifications")).not.toBeInTheDocument();
  });

  it("calls clearAuth and navigates home on logout", () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(clearAuth).mockImplementation(mockClearAuth);
    render(<Navbar />);
    fireEvent.click(screen.getByText("Log Out"));
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("toggles mobile menu when hamburger is clicked", () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    render(<Navbar />);
    const hamburger = document.querySelector(".md\\:hidden");
    expect(hamburger).toBeInTheDocument();
    fireEvent.click(hamburger!);
    const mobileMenu = document.querySelector(".animate-slide-up");
    expect(mobileMenu).toBeInTheDocument();
  });

  it("always shows Browse link regardless of auth state", () => {
    // Logged in
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const { unmount } = render(<Navbar />);
    expect(screen.getAllByText("Browse").length).toBeGreaterThanOrEqual(1);
    unmount();

    // Logged out
    vi.mocked(isAuthenticated).mockReturnValue(false);
    render(<Navbar />);
    expect(screen.getAllByText("Browse").length).toBeGreaterThanOrEqual(1);
  });
});
