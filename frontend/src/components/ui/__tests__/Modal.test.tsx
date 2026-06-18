import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders dialog when open is true", () => {
    render(<Modal open onClose={vi.fn()} title="Test Modal"><p>Modal body</p></Modal>);
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("returns null when open is false", () => {
    const { container } = render(<Modal open={false} onClose={vi.fn()} title="Hidden"><p>Body</p></Modal>);
    expect(container.innerHTML).toBe("");
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<Modal open onClose={handleClose} title="Modal"><p>Body</p></Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when a non-Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<Modal open onClose={handleClose} title="Modal"><p>Body</p></Modal>);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("calls onClose when overlay is clicked", () => {
    const handleClose = vi.fn();
    render(<Modal open onClose={handleClose} title="Modal"><p>Body</p></Modal>);
    // The overlay is the outer div with bg-black/50 class
    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
    // Simulate clicking the overlay (not the modal content)
    fireEvent.click(overlay!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders title in the modal header", () => {
    render(<Modal open onClose={vi.fn()} title="Delete Item"><p>Are you sure?</p></Modal>);
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
  });

  it("has a close button that calls onClose", () => {
    const handleClose = vi.fn();
    render(<Modal open onClose={handleClose} title="Modal"><p>Body</p></Modal>);
    // The close button is the X button next to the title
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(b => !b.textContent); // The X button has no text
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
