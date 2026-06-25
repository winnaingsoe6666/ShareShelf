import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MapSearchPage from "../page";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => true),
  getUser: vi.fn(() => ({ id: 1, name: "Test", email: "t@t.com", trustScore: 4.5 })),
  getToken: vi.fn(() => "mock-token"),
  clearAuth: vi.fn(),
  saveAuth: vi.fn(),
}));

const mapTranslations: Record<string, string> = {
  "itemMap.title": "Search by Map",
  "itemMap.subtitle": "Discover tools near you",
  "itemMap.loading": "Loading map...",
};

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => mapTranslations[key] || key),
}));
vi.mock("@/components/layout/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMapView = ({ items, onLocationFound, radius, onRadiusChange }: any) => (
      <div data-testid="map-view">
        <span data-testid="item-count">{items.length}</span>
        <span data-testid="radius">{radius}</span>
        <button data-testid="trigger-location" onClick={() => onLocationFound?.(16.84, 96.17)}>Locate</button>
      </div>
    );
    MockMapView.displayName = "MockMapView";
    return MockMapView;
  },
}));

import api from "@/lib/api";
const mockApiGet = api.get as ReturnType<typeof vi.fn>;

describe("MapSearchPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders page heading", async () => {
    mockApiGet.mockResolvedValue({ data: { data: { content: [] } } });
    render(<MapSearchPage />);
    await waitFor(() => { expect(screen.getByText("Search by Map")).toBeTruthy(); });
  });

  it("fetches items from API on mount", async () => {
    mockApiGet.mockResolvedValue({ data: { data: { content: [] } } });
    render(<MapSearchPage />);
    await waitFor(() => { expect(mockApiGet).toHaveBeenCalledWith("/items", expect.any(Object)); });
  });

  it("renders MapView when items are loaded", async () => {
    mockApiGet.mockResolvedValue({
      data: {
        data: {
          content: [
            { id: 1, title: "Item 1", latitude: 16.84, longitude: 96.17, distance: 500, dailyPrice: 5, status: "available", imageUrls: [], ownerName: "Test", ownerTrustScore: 4.5, createdAt: "2026-01-01", ownerId: 1 },
          ],
        },
      },
    });
    render(<MapSearchPage />);
    await waitFor(() => { expect(screen.getByTestId("map-view")).toBeTruthy(); });
  });

  it("shows loading state while items load", async () => {
    let resolver: (v: unknown) => void;
    const promise = new Promise((res) => { resolver = res; });
    mockApiGet.mockReturnValue(promise);
    render(<MapSearchPage />);
    expect(screen.getByText("Loading map...")).toBeTruthy();
    resolver!({ data: { data: { content: [] } } });
    await waitFor(() => { expect(screen.queryByText("Loading map...")).toBeNull(); });
  });

  it("shows error when API fails", async () => {
    mockApiGet.mockRejectedValue(new Error("Network error"));
    render(<MapSearchPage />);
    await waitFor(() => { expect(screen.getByText("Failed to load items")).toBeTruthy(); });
  });
});
