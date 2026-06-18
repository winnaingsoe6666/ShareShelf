import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies rounded-xl and border classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border-purple-200");
  });

  it("adds cursor-pointer class when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByText("Clickable");
    expect(card.className).toContain("cursor-pointer");
  });

  it("does not add cursor-pointer class when no onClick", () => {
    render(<Card>Not clickable</Card>);
    const card = screen.getByText("Not clickable");
    expect(card.className).not.toContain("cursor-pointer");
  });

  it("fires onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    fireEvent.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Card className="my-card">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("my-card");
  });
});
