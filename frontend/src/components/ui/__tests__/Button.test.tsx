import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows spinner when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    // SVG spinner is rendered inside the button
    expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("disables button when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies primary variant classes", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-green-600");
    expect(button.className).toContain("text-white");
    expect(button.className).toContain("shadow-md");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-2");
    expect(button.className).toContain("border-purple-600");
    expect(button.className).toContain("text-purple-600");
    expect(button.className).toContain("bg-transparent");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-purple-200");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button").className).toContain("text-purple-600");
  });

  it("applies danger variant classes", () => {
    render(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole("button").className).toContain("bg-red-600");
  });

  it("applies sm size classes", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("px-3");
  });

  it("applies md size classes", () => {
    render(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button").className).toContain("px-4");
  });

  it("applies lg size classes", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("px-6");
  });

  it("appends custom className", () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom");
  });
});
