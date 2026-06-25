import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";

describe("GoogleSignInButton", () => {
  it("renders Google sign-in link with correct href", () => {
    render(<GoogleSignInButton />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/api/oauth2/authorization/google");
  });

  it("shows default text", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("has aria-label", () => {
    render(<GoogleSignInButton />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Sign in with Google");
  });

  it("shows custom text when provided", () => {
    render(<GoogleSignInButton text="Sign up with Google" />);
    expect(screen.getByText("Sign up with Google")).toBeInTheDocument();
  });

  it("has aria-label matching custom text", () => {
    render(<GoogleSignInButton text="Sign up with Google" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Sign up with Google");
  });

  it("renders Google G logo SVG", () => {
    const { container } = render(<GoogleSignInButton />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 48 48");
  });

  it("applies custom className", () => {
    render(<GoogleSignInButton className="my-custom" />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("my-custom");
  });
});
