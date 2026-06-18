import type { AuthResponse, User } from "@/types";

const TOKEN_KEY = "shareshelf_token";
const REFRESH_KEY = "shareshelf_refresh_token";
const USER_KEY = "shareshelf_user";

// sessionStorage auto-clears when the browser tab closes, logging the user out.
// localStorage would persist the session across tab/window lifetime,
// defeating the "logout on tab close" requirement.
export function saveAuth(auth: AuthResponse): void {
  sessionStorage.setItem(TOKEN_KEY, auth.token);
  sessionStorage.setItem(REFRESH_KEY, auth.refreshToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify({
    id: auth.userId,
    name: auth.name,
    email: auth.email,
    trustScore: auth.trustScore,
    community: auth.community,
    avatarUrl: auth.avatarUrl,
  }));
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setToken(token: string, refreshToken: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
