import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthDivider from "@/components/ui/AuthDivider";

describe("AuthDivider", () => {
  it("renders or text", () => {
    render(<AuthDivider />);
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("renders two horizontal lines", () => {
    const { container } = render(<AuthDivider />);
    const lines = container.querySelectorAll(".h-px.bg-purple-200");
    expect(lines).toHaveLength(2);
  });
});
