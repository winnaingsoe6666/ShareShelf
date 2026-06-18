import { describe, it, expect, beforeEach } from "vitest";
import { saveAuth, clearAuth, getToken, getRefreshToken, getUser, isAuthenticated, setToken } from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const mockAuth = {
    token: "eyJhbGciOiJIUzI1NiJ9.test",
    refreshToken: "eyJhbGciOiJIUzI1NiJ9.refresh",
    userId: 42,
    name: "John Doe",
    email: "john@example.com",
    trustScore: 4.5,
    community: "Downtown",
    avatarUrl: undefined as string | undefined,
  };

  describe("saveAuth", () => {
    it("stores token in sessionStorage", () => {
      saveAuth(mockAuth);
      expect(sessionStorage.getItem("shareshelf_token")).toBe("eyJhbGciOiJIUzI1NiJ9.test");
    });

    it("stores refresh token in sessionStorage", () => {
      saveAuth(mockAuth);
      expect(sessionStorage.getItem("shareshelf_refresh_token")).toBe("eyJhbGciOiJIUzI1NiJ9.refresh");
    });

    it("stores serialized user in sessionStorage", () => {
      saveAuth(mockAuth);
      const userStr = sessionStorage.getItem("shareshelf_user");
      expect(userStr).not.toBeNull();
      const parsed = JSON.parse(userStr!);
      expect(parsed.id).toBe(42);
      expect(parsed.name).toBe("John Doe");
      expect(parsed.email).toBe("john@example.com");
      expect(parsed.trustScore).toBe(4.5);
      expect(parsed.community).toBe("Downtown");
    });
  });

  describe("getToken", () => {
    it("returns null when no token stored", () => {
      expect(getToken()).toBeNull();
    });

    it("returns the stored token", () => {
      sessionStorage.setItem("shareshelf_token", "my-token");
      expect(getToken()).toBe("my-token");
    });
  });

  describe("getRefreshToken", () => {
    it("returns null when no refresh token stored", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("returns the stored refresh token", () => {
      sessionStorage.setItem("shareshelf_refresh_token", "my-refresh");
      expect(getRefreshToken()).toBe("my-refresh");
    });
  });

  describe("getUser", () => {
    it("returns null when no user stored", () => {
      expect(getUser()).toBeNull();
    });

    it("parses and returns the stored user", () => {
      sessionStorage.setItem("shareshelf_user", JSON.stringify({ id: 1, name: "Test", email: "t@t.com", trustScore: 3 }));
      const user = getUser();
      expect(user).not.toBeNull();
      expect(user!.id).toBe(1);
      expect(user!.name).toBe("Test");
    });

    it("returns null for invalid JSON", () => {
      sessionStorage.setItem("shareshelf_user", "not-json");
      expect(getUser()).toBeNull();
    });
  });

  describe("clearAuth", () => {
    it("removes token, refresh token, and user from sessionStorage", () => {
      saveAuth(mockAuth);
      clearAuth();
      expect(sessionStorage.getItem("shareshelf_token")).toBeNull();
      expect(sessionStorage.getItem("shareshelf_refresh_token")).toBeNull();
      expect(sessionStorage.getItem("shareshelf_user")).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when no token stored", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("returns true when token exists", () => {
      sessionStorage.setItem("shareshelf_token", "exists");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("setToken", () => {
    it("updates token and refresh token in sessionStorage", () => {
      saveAuth(mockAuth);
      setToken("new-token", "new-refresh");
      expect(sessionStorage.getItem("shareshelf_token")).toBe("new-token");
      expect(sessionStorage.getItem("shareshelf_refresh_token")).toBe("new-refresh");
    });
  });
});
