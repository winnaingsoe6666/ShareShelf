import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LocationPicker from "@/components/map/LocationPicker";

describe("LocationPicker", () => {
  it("renders map container with overlay when no pin is set", () => {
    render(<LocationPicker onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByText("Click on the map to set the location")).toBeInTheDocument();
  });

  it("renders marker when lat/lng are provided", () => {
    render(<LocationPicker latitude={16.84} longitude={96.17} onChange={vi.fn()} onClear={vi.fn()} />);
    const marker = screen.getByTestId("marker");
    expect(marker).toBeInTheDocument();
    expect(marker.getAttribute("data-lat")).toBe("16.84");
    expect(marker.getAttribute("data-lng")).toBe("96.17");
  });

  it("does not render marker when lat/lng are undefined", () => {
    render(<LocationPicker latitude={undefined} longitude={undefined} onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByTestId("marker")).toBeNull();
  });

  it("shows Remove pin link when pin is placed and onClear is called on click", () => {
    const onClear = vi.fn();
    render(<LocationPicker latitude={16.84} longitude={96.17} onChange={vi.fn()} onClear={onClear} />);
    const removeBtn = screen.getByText("Remove pin");
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it("hides Remove pin link when no pin is set", () => {
    render(<LocationPicker onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByText("Remove pin")).toBeNull();
  });

  it("renders map container with default center", () => {
    render(<LocationPicker onChange={vi.fn()} onClear={vi.fn()} />);
    const container = screen.getByTestId("map-container");
    expect(container).toBeInTheDocument();
  });
});
