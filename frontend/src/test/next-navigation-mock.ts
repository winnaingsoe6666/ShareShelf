import { vi } from "vitest";

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

export const usePathname = vi.fn(() => "/en");
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const notFound = vi.fn();
export const redirect = vi.fn();
export const permanentRedirect = vi.fn();
export const useParams = vi.fn(() => ({}));
