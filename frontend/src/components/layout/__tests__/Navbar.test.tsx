import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockClearAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  getUser: vi.fn(() => ({ id: 1, name: "Test User", email: "test@test.com", trustScore: 4.5 })),
  clearAuth: vi.fn(),
  isAuthenticated: vi.fn(() => true),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
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
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
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
    // Mobile menu should not be visible initially
    // The mobile menu links are in a div that only renders when mobileOpen is true
    // Click the hamburger button
    const hamburger = document.querySelector(".md\\:hidden");
    expect(hamburger).toBeInTheDocument();
    fireEvent.click(hamburger!);
    // After click, mobile menu should appear - check for links in mobile menu
    const mobileLinks = document.querySelector(".border-t.border-stone-200");
    expect(mobileLinks).toBeInTheDocument();
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
