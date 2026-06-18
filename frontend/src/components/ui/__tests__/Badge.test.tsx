import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Available</Badge>);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("applies default variant classes by default", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-purple-100");
    expect(badge.className).toContain("text-purple-700");
    expect(badge.className).toContain("rounded-lg");
    expect(badge.className).toContain("border-current/10");
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-800");
  });

  it("applies warning variant classes", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-amber-100");
    expect(badge.className).toContain("text-amber-800");
  });

  it("applies danger variant classes", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-800");
  });

  it("applies info variant classes", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-800");
  });
});
