import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => false),
  saveAuth: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import api from "@/lib/api";
import { isAuthenticated, saveAuth } from "@/lib/auth";

describe("LoginPage", () => {
  beforeEach(() => { vi.clearAllMocks(); mockPush.mockReset(); });

  it("renders login form when not authenticated", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeTruthy();
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("redirects to /items when already authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<LoginPage />);
    await waitFor(() => { expect(mockPush).toHaveBeenCalledWith("/items"); });
  });

  it("shows error on failed login", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { status: 401 } });
    render(<LoginPage />);
    await user.click(screen.getByText("Sign In"));
    await waitFor(() => { expect(screen.getByText(/invalid email/i)).toBeTruthy(); });
  });

  it("calls saveAuth and navigates on success", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { token: "t", userId: 1, name: "T", email: "t@t", trustScore: 4 } },
    });
    render(<LoginPage />);
    await user.click(screen.getByText("Sign In"));
    await waitFor(() => {
      expect(saveAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/items");
    });
  });
});
