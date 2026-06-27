import type { AuthResponse, User } from "@/types";

const TOKEN_KEY = "shareshelf_token";
const REFRESH_KEY = "shareshelf_refresh_token";
const USER_KEY = "shareshelf_user";

// We use localStorage to persist the session across browser tab/window closes,
// keeping the user logged in even if they close and reopen the app.
export function saveAuth(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: auth.userId,
    name: auth.name,
    email: auth.email,
    trustScore: auth.trustScore,
    community: auth.community,
    avatarUrl: auth.avatarUrl,
    bio: auth.bio,
    isIdVerified: auth.isIdVerified,
    addressLine1: auth.addressLine1,
    addressLine2: auth.addressLine2,
    city: auth.city,
    state: auth.state,
    zipCode: auth.zipCode,
    socialLink: auth.socialLink,
  }));
}

export function updateUserSession(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setToken(token: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
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
