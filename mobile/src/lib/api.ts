import { createApiClient, createApi } from "@shareshelf/shared";
import { asyncStorageAdapter } from "./storage";

// Ensure baseURL always ends with /api — env var may or may not include it
const rawBase = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";
const baseURL = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`;

// Raw axios instance with JWT injection + refresh token logic
export const apiClient = createApiClient({
  baseURL,
  storage: asyncStorageAdapter,
});

// Structured API facade
export const api = createApi(apiClient);
