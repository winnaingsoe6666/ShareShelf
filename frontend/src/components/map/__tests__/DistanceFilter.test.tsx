import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DistanceFilter from "@/components/map/DistanceFilter";

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: mockGeolocation,
  });
});

describe("DistanceFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Near Me button", () => {
    render(<DistanceFilter onLocationChange={vi.fn()} />);
    expect(screen.getByText("Near Me")).toBeInTheDocument();
  });

  it("renders 4 radius preset buttons", () => {
    render(<DistanceFilter onLocationChange={vi.fn()} />);
    expect(screen.getByText("1 km")).toBeInTheDocument();
    expect(screen.getByText("3 km")).toBeInTheDocument();
    expect(screen.getByText("5 km")).toBeInTheDocument();
    expect(screen.getByText("10 km")).toBeInTheDocument();
  });

  it("applies active style to selected radius", () => {
    render(<DistanceFilter onLocationChange={vi.fn()} />);
    const threeKm = screen.getByText("3 km");
    fireEvent.click(threeKm);
    expect(threeKm.className).toContain("bg-purple-600");
  });

  it("calls onLocationChange when geolocation succeeds", () => {
    const onLocationChange = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 16.84, longitude: 96.17 } });
    });
    render(<DistanceFilter onLocationChange={onLocationChange} />);
    fireEvent.click(screen.getByText("Near Me"));
    expect(onLocationChange).toHaveBeenCalledWith(16.84, 96.17, 3000);
  });

  it("shows Locating... while geolocation is pending", () => {
    let callback: Function | null = null;
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      callback = success;
    });
    render(<DistanceFilter onLocationChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Near Me"));
    expect(screen.getByText("Locating...")).toBeInTheDocument();
  });
});
