import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock next/navigation for next-intl compatibility in jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
  redirect: () => { throw new Error("NEXT_REDIRECT"); },
  permanentRedirect: () => { throw new Error("NEXT_PERMANENT_REDIRECT"); },
}));

// Mock next-intl/navigation so createNavigation doesn't need IntlContext.
// Returns Link as plain <a>, and delegates hooks to next/navigation mock.
vi.mock("next-intl/navigation", async () => {
  // Dynamic import at mock-factory runtime — next/navigation is already mocked
  const nav = await import("next/navigation");
  return {
    createNavigation: vi.fn((_routing: any) => ({
      Link: ({ href, children, ...props }: any) =>
        React.createElement("a", { href, ...props }, children),
      redirect: nav.redirect,
      usePathname: nav.usePathname,
      useRouter: nav.useRouter,
      getPathname: ({ href }: { href: string }) => href,
    })),
  };
});

// Mock react-leaflet for jsdom (no window/document in test env)
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, className, ...props }: any) =>
    React.createElement("div", { className, "data-testid": "map-container", ...props }, children),
  TileLayer: ({ ...props }: any) =>
    React.createElement("div", { "data-testid": "tile-layer", ...props }),
  Marker: ({ children, position, ...props }: any) =>
    React.createElement("div", { "data-testid": "marker", "data-lat": position?.[0], "data-lng": position?.[1], ...props }, children),
  Popup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "popup", ...props }, children),
  useMap: () => ({
    setView: vi.fn(),
    getCenter: () => ({ lat: 16.84, lng: 96.17 }),
    getZoom: () => 14,
  }),
  useMapEvents: () => null,
}));

vi.mock("react-leaflet-cluster", () => ({
  MarkerClusterGroup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "marker-cluster", ...props }, children),
}));
