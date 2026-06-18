import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — inject JWT token from sessionStorage
// (sessionStorage auto-clears on tab close, logging the user out)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("shareshelf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

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
    if (typeof window === "undefined") return Promise.reject(error);

    // Try refresh on 401 (exclude auth endpoints to avoid loops)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith("/auth/")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem("shareshelf_refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          if (data.success && data.data) {
            const newToken = data.data.token;
            const newRefreshToken = data.data.refreshToken;
            sessionStorage.setItem("shareshelf_token", newToken);
            sessionStorage.setItem("shareshelf_refresh_token", newRefreshToken);
            // Update stored user info
            sessionStorage.setItem("shareshelf_user", JSON.stringify({
              id: data.data.userId,
              name: data.data.name,
              email: data.data.email,
              trustScore: data.data.trustScore,
              community: data.data.community,
              avatarUrl: data.data.avatarUrl,
            }));
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

    // On 401 (auth endpoint or refresh failed), clear session and redirect
    if (error.response?.status === 401) {
      sessionStorage.removeItem("shareshelf_token");
      sessionStorage.removeItem("shareshelf_refresh_token");
      sessionStorage.removeItem("shareshelf_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
