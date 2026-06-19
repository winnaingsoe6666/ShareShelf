import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => false),
  saveAuth: vi.fn(),
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import api from "@/lib/api";
import { isAuthenticated, saveAuth } from "@/lib/auth";

describe("RegisterPage", () => {
  beforeEach(() => { vi.clearAllMocks(); mockPush.mockReset(); });

  it("renders registration form when not authenticated", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Join ShareShelf")).toBeTruthy();
    expect(screen.getByText("Create Account")).toBeTruthy();
  });

  it("redirects to /items when already authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<RegisterPage />);
    await waitFor(() => { expect(mockPush).toHaveBeenCalledWith("/items"); });
  });

  it("shows error on failed registration", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { message: "Email exists" } },
    });
    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.click(screen.getByText("Create Account"));
    await waitFor(() => { expect(screen.getByText("Email exists")).toBeTruthy(); });
  });

  it("calls saveAuth and navigates on success", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { token: "t", userId: 1, name: "T", email: "t@t", trustScore: 4 } },
    });
    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.click(screen.getByText("Create Account"));
    await waitFor(() => {
      expect(saveAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/items");
    });
  });

  it("shows password strength indicator when password is typed", () => {
    render(<RegisterPage />);

    // No password strength visible initially
    expect(screen.queryByText("Weak")).toBeFalsy();
    expect(screen.queryByText("Strong")).toBeFalsy();

    // Type a strong password using fireEvent for synchronous update
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: "StrongPass1" } });

    // Verify the input value was set
    expect(passwordInput.value).toBe("StrongPass1");

    // Strength should show "Strong" — use regex because React may split the text nodes
    expect(screen.getByText(/Strong/)).toBeTruthy();
  });
});
