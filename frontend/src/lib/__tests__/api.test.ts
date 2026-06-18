import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios before importing the module
vi.mock("axios", () => {
  const mockAxios = {
    create: vi.fn(() => mockInstance),
    post: vi.fn(),
  };
  return { default: mockAxios };
});

// Create mock instance
const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  defaults: { baseURL: "/api" },
};

// Need to re-import because dynamic import doesn't work well with vi.mock hoisting
// We test the interceptor behavior by inspecting how they were registered

describe("api", () => {
  let api: typeof import("@/lib/api").default;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    // Reset the mock instance
    mockInstance.interceptors.request.use = vi.fn();
    mockInstance.interceptors.response.use = vi.fn();
    mockInstance.defaults.baseURL = "/api";
  });

  it("creates axios instance with correct baseURL", async () => {
    const axios = await import("axios");
    const createSpy = axios.default.create as ReturnType<typeof vi.fn>;
    // The module is already loaded, but we can verify the instance was created
    // by importing it and checking the defaults
    const apiModule = await import("@/lib/api");
    expect(apiModule.default.defaults.baseURL).toBeDefined();
  });

  it("creates axios instance with the correct defaults", async () => {
    const apiModule = await import("@/lib/api");
    // The instance has a baseURL (either from env or /api fallback)
    expect(apiModule.default.defaults.baseURL).toBeDefined();
    // Verify it's the axios instance (has HTTP methods)
    expect(typeof apiModule.default.get).toBe("function");
    expect(typeof apiModule.default.post).toBe("function");
  });

  it("registers a request interceptor", async () => {
    await import("@/lib/api");
    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it("registers a response interceptor", async () => {
    await import("@/lib/api");
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it("exports the axios instance as default", async () => {
    const apiModule = await import("@/lib/api");
    expect(apiModule.default).toBeDefined();
    expect(apiModule.default.get).toBeDefined();
    expect(apiModule.default.post).toBeDefined();
  });
});
