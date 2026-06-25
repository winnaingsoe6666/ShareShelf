import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockSearchParams, mockPush } = vi.hoisted(() => ({
  mockSearchParams: vi.fn(() => new URLSearchParams()),
  mockPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: mockSearchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/en",
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  saveAuth: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Must import after mocks are set up
import AuthCallbackPage from "@/app/[locale]/auth/callback/page";

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("shows loading state when params with tokens are present", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("?token=abc&refreshToken=def")
    );
    render(<AuthCallbackPage />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
  });

  it("shows error when no token params present", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
    render(<AuthCallbackPage />);
    expect(await screen.findByText("Authentication failed")).toBeInTheDocument();
  });

  it("shows error when only token is present without refreshToken", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("?token=abc123")
    );
    render(<AuthCallbackPage />);
    expect(await screen.findByText("Authentication failed")).toBeInTheDocument();
  });

  it("renders Back to Sign In link in error state", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
    render(<AuthCallbackPage />);
    expect(await screen.findByText("Back to Sign In")).toBeInTheDocument();
  });
});
