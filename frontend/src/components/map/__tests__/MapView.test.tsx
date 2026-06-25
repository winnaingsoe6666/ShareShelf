import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MapView from "@/components/map/MapView";
import type { Item } from "@/types";

const createItem = (overrides: Partial<Item> = {}): Item => ({
  id: 1,
  ownerId: 1,
  ownerName: "Test Owner",
  ownerTrustScore: 4.5,
  title: "Test Item",
  status: "available",
  imageUrls: [],
  createdAt: "2026-01-01T00:00:00Z",
  dailyPrice: 5,
  latitude: 16.84,
  longitude: 96.17,
  distance: 1200,
  ...overrides,
});

describe("MapView", () => {
  it("renders map container", () => {
    render(<MapView items={[]} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders tile layer", () => {
    render(<MapView items={[]} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("renders markers for items with coordinates", () => {
    const items = [
      createItem({ id: 1, latitude: 16.84, longitude: 96.17 }),
      createItem({ id: 2, latitude: 16.85, longitude: 96.18 }),
    ];
    render(<MapView items={items} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(2);
  });

  it("filters out items without coordinates", () => {
    const items = [
      createItem({ id: 1, latitude: 16.84, longitude: 96.17 }),
      createItem({ id: 2, latitude: undefined, longitude: undefined }),
    ];
    render(<MapView items={items} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(1);
  });

  it("renders marker cluster group", () => {
    const items = [createItem()];
    render(<MapView items={items} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    expect(screen.getByTestId("marker-cluster")).toBeInTheDocument();
  });

  it("renders popups with item details", () => {
    const items = [createItem({ title: "Power Drill", dailyPrice: 10, distance: 1500 })];
    render(<MapView items={items} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    const popup = screen.getByTestId("popup");
    expect(popup).toBeInTheDocument();
  });

  it("handles empty items gracefully", () => {
    render(<MapView items={[]} radius={3000} onRadiusChange={vi.fn()} onLocationFound={vi.fn()} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.queryAllByTestId("marker")).toHaveLength(0);
  });
});
