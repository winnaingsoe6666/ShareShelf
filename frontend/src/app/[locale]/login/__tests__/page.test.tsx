import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => false),
  saveAuth: vi.fn(),
  getToken: vi.fn(() => null),
  clearAuth: vi.fn(),
  getUser: vi.fn(() => null),
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

const loginTranslations: Record<string, string> = {
  "loginPage.title": "Log In",
  "loginPage.email": "Email",
  "loginPage.emailPlaceholder": "your@email.com",
  "loginPage.password": "Password",
  "loginPage.passwordPlaceholder": "••••••••",
  "loginPage.submit": "Log In",
  "loginPage.loggingIn": "Logging in...",
  "loginPage.noAccount": "Don't have an account?",
  "loginPage.register": "Sign Up",
  "loginPage.failed": "Login failed. Please check your credentials.",
};

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => loginTranslations[key] || key),
}));

import api from "@/lib/api";
import { isAuthenticated, saveAuth } from "@/lib/auth";

describe("LoginPage", () => {
  beforeEach(() => { vi.clearAllMocks(); mockPush.mockReset(); });

  it("renders login form when not authenticated", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Log In" })).toBeTruthy();
    expect(screen.getByText("Sign in to your account")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log In" })).toBeTruthy();
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
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log In" }));
    await waitFor(() => { expect(screen.getByText(/login failed/i)).toBeTruthy(); });
  });

  it("calls saveAuth and navigates on success", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { token: "t", userId: 1, name: "T", email: "t@t", trustScore: 4, profileBonus: 0 } },
    });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.click(screen.getByRole("button", { name: "Log In" }));
    await waitFor(() => {
      expect(saveAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/items");
    });
  });
});
