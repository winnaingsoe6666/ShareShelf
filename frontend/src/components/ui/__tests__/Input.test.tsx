import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders label when label prop is provided", () => {
    render(<Input label="Email" />);
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label.className).toContain("text-purple-800");
  });

  it("does not render label when label prop is not provided", () => {
    render(<Input />);
    expect(document.querySelector("label")).not.toBeInTheDocument();
  });

  it("renders error message when error prop is provided", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByText("This field is required").className).toContain("text-red-600");
  });

  it("applies error border class when error prop is set", () => {
    render(<Input error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });

  it("does not show error border when no error", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).not.toContain("border-red-500");
    expect(input.className).toContain("border-purple-200");
    expect(input.className).toContain("ring-purple-500/20");
  });

  it("forwards disabled attribute", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole("textbox").className).toContain("custom-input");
  });
});
