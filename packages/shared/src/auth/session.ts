import type { AuthResponse, User } from "../types";

const TOKEN_KEY = "shareshelf_token";
const REFRESH_KEY = "shareshelf_refresh_token";
const USER_KEY = "shareshelf_user";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function authResponseToUser(auth: AuthResponse): User {
  return {
    id: auth.userId,
    name: auth.name,
    email: auth.email,
    trustScore: auth.trustScore,
    profileBonus: auth.profileBonus,
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
  };
}

export function createAuthSession(storage: StorageAdapter) {
  async function saveAuth(auth: AuthResponse): Promise<void> {
    await storage.setItem(TOKEN_KEY, auth.token);
    await storage.setItem(REFRESH_KEY, auth.refreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(authResponseToUser(auth)));
  }

  async function updateUserSession(user: User): Promise<void> {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function clearAuth(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(REFRESH_KEY);
    await storage.removeItem(USER_KEY);
  }

  async function getToken(): Promise<string | null> {
    return storage.getItem(TOKEN_KEY);
  }

  async function getRefreshToken(): Promise<string | null> {
    return storage.getItem(REFRESH_KEY);
  }

  async function setToken(token: string, refreshToken: string): Promise<void> {
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(REFRESH_KEY, refreshToken);
  }

  async function getUser(): Promise<User | null> {
    const raw = await storage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
  }

  return {
    saveAuth,
    updateUserSession,
    clearAuth,
    getToken,
    getRefreshToken,
    setToken,
    getUser,
    isAuthenticated,
    authResponseToUser,
  };
}
