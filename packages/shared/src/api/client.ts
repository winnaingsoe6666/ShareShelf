import axios from "axios";
import type { StorageAdapter } from "../auth/session";
import type { ApiResponse, AuthResponse } from "../types";

export interface ApiClientConfig {
  baseURL: string;
  storage: StorageAdapter;
}

export function createApiClient({ baseURL, storage }: ApiClientConfig) {
  const TOKEN_KEY = "shareshelf_token";
  const REFRESH_KEY = "shareshelf_refresh_token";
  const USER_KEY = "shareshelf_user";

  const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  // Request interceptor — inject JWT token from storage
  api.interceptors.request.use(async (config) => {
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Prevent infinite refresh loops
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
  }

  // Response interceptor — handle 401 with refresh token flow
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Try refresh on 401 (exclude auth endpoints to avoid loops)
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.startsWith("/auth/")
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await storage.getItem(REFRESH_KEY);
        if (refreshToken) {
          try {
            const { data } = await axios.post<ApiResponse<AuthResponse>>(
              `${baseURL}/auth/refresh`,
              { refreshToken }
            );
            if (data.success && data.data) {
              const newToken = data.data.token;
              const newRefreshToken = data.data.refreshToken;
              await storage.setItem(TOKEN_KEY, newToken);
              await storage.setItem(REFRESH_KEY, newRefreshToken);
              await storage.setItem(
                USER_KEY,
                JSON.stringify({
                  id: data.data.userId,
                  name: data.data.name,
                  email: data.data.email,
                  trustScore: data.data.trustScore,
                  profileBonus: data.data.profileBonus,
                  community: data.data.community,
                  avatarUrl: data.data.avatarUrl,
                  bio: data.data.bio,
                  isIdVerified: data.data.isIdVerified,
                  addressLine1: data.data.addressLine1,
                  addressLine2: data.data.addressLine2,
                  city: data.data.city,
                  state: data.data.state,
                  zipCode: data.data.zipCode,
                  socialLink: data.data.socialLink,
                })
              );
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              processQueue(null, newToken);
              return api(originalRequest);
            }
          } catch {
            // Refresh failed — fall through to clear auth
          }
        }

        isRefreshing = false;
        processQueue(new Error("Refresh failed"), null);
      }

      // On 401 (auth endpoint or refresh failed), clear session
      if (error.response?.status === 401) {
        await storage.removeItem(TOKEN_KEY);
        await storage.removeItem(REFRESH_KEY);
        await storage.removeItem(USER_KEY);
      }

      return Promise.reject(error);
    }
  );

  return api;
}
