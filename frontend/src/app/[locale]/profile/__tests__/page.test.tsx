import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => true),
  getUser: vi.fn(() => ({ id: 1, name: "Test User", email: "t@t.com", trustScore: 4.5, community: "Downtown" })),
  saveAuth: vi.fn(),
  clearAuth: vi.fn(),
  getToken: vi.fn(() => "mock-token"),
}));

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => key),
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush, refresh: vi.fn() })),
}));
vi.mock("@/components/layout/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("@/components/ui/Spinner", () => ({
  default: ({ className }: { className?: string }) => <div data-testid="spinner" className={className}>Loading...</div>,
}));
vi.mock("@/components/ui/Card", () => ({
  default: ({ children, className, onClick }: any) => <div data-testid="card" className={className} onClick={onClick}>{children}</div>,
}));

import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

describe("ProfilePage", () => {
  beforeEach(() => { vi.clearAllMocks(); mockPush.mockReset(); });

  it("renders profile when authenticated", async () => {
    (api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === "/items") return Promise.resolve({ data: { data: { content: [] } } });
      if (url.startsWith("/review/user/")) return Promise.resolve({ data: { data: [] } });
    });
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeTruthy();
    });
    expect(screen.getByText("t@t.com")).toBeTruthy();
  });

  it("redirects to /login when not authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (api.get as ReturnType<typeof vi.fn>).mockImplementation(() => Promise.resolve({ data: { data: [] } }));
    render(<ProfilePage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
