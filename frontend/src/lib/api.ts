import { createApiClient, createApi } from "@shareshelf/shared";
import { localStorageAdapter } from "./storage";

// Ensure baseURL always ends with /api — env var may or may not include it
const rawBase = process.env.NEXT_PUBLIC_API_URL || "/api";
const baseURL = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`;

// Raw axios instance with JWT injection + refresh token logic from shared package
const api = createApiClient({ baseURL, storage: localStorageAdapter });

// On 401 failure (after refresh failed), redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Structured API facade (api.auth.login, api.items.getItems, etc.)
const structuredApi = createApi(api);

export default api;
export { structuredApi };
