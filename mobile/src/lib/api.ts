import { createApiClient, createApi } from "@shareshelf/shared";
import { asyncStorageAdapter } from "./storage";

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

// Raw axios instance with JWT injection + refresh token logic
export const apiClient = createApiClient({
  baseURL,
  storage: asyncStorageAdapter,
});

// Structured API facade
export const api = createApi(apiClient);
