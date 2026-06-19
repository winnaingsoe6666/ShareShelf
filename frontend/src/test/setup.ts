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
