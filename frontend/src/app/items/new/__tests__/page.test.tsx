import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import NewItemPage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => true),
  getUser: vi.fn(() => ({ id: 1, name: "Test", email: "t@t.com", trustScore: 4.5 })),
}));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));
vi.mock("@/components/layout/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const mockApiGet = api.get as ReturnType<typeof vi.fn>;

describe("NewItemPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  const renderPage = () => render(<NewItemPage />);

  it("renders form when authenticated", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    renderPage();
    await waitFor(() => { expect(screen.getByText("Tools")).toBeTruthy(); });
    expect(screen.getByText("List a New Item")).toBeTruthy();
    expect(screen.getByText("Create Listing")).toBeTruthy();
  });

  it("fetches categories from API on mount", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [{ id: 1, name: "Tools" }] } });
    renderPage();
    await waitFor(() => { expect(mockApiGet).toHaveBeenCalledWith("/categories"); });
  });

  it("shows loading state while categories load", async () => {
    let r: (v: unknown) => void;
    const d = new Promise((res) => { r = res; });
    mockApiGet.mockReturnValue(d);
    renderPage();
    await waitFor(() => { expect(screen.getByText(/loading categories/i)).toBeTruthy(); });
    (r as any)!({ data: { data: [] } });
  });

  it("shows error when categories API fails", async () => {
    mockApiGet.mockRejectedValue(new Error("fail"));
    renderPage();
    await waitFor(() => { expect(screen.getByText(/failed to load/i)).toBeTruthy(); });
  });

  it("shows empty state when no categories", async () => {
    mockApiGet.mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => { expect(screen.getByText(/no categories available/i)).toBeTruthy(); });
  });

  it("redirects to /login when not authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);
    mockApiGet.mockResolvedValue({ data: { data: [] } });
    renderPage();
    await waitFor(() => { expect(mockPush).toHaveBeenCalledWith("/login"); });
  });
});
