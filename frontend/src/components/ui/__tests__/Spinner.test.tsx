import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Spinner from "@/components/ui/Spinner";

describe("Spinner", () => {
  it("renders an SVG with animate-spin class", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("class")).toContain("animate-spin");
  });

  it("applies custom className to container div", () => {
    const { container } = render(<Spinner className="py-16" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("py-16");
  });

  it("renders only SVG elements, no text content", () => {
    const { container } = render(<Spinner />);
    expect(container.textContent).toBe("");
  });

  it("renders with flex centering classes", () => {
    const { container } = render(<Spinner />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("flex");
    expect(outerDiv.className).toContain("justify-center");
  });
});
