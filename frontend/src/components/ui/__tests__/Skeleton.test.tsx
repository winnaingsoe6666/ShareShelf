import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skeleton from "@/components/ui/Skeleton";

describe("Skeleton", () => {
  it("renders with loading role", () => {
    render(<Skeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies animate-skeleton-pulse class", () => {
    render(<Skeleton />);
    expect(screen.getByRole("status").className).toContain("animate-skeleton-pulse");
  });

  it("appends custom className", () => {
    render(<Skeleton className="h-24 w-full" />);
    expect(screen.getByRole("status").className).toContain("h-24");
    expect(screen.getByRole("status").className).toContain("w-full");
  });
});
