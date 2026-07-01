import { createAuthSession } from "@shareshelf/shared";
import { asyncStorageAdapter } from "./storage";

const authSession = createAuthSession(asyncStorageAdapter);

export const {
  saveAuth,
  updateUserSession,
  clearAuth,
  getToken,
  getRefreshToken,
  setToken,
  getUser,
  isAuthenticated,
  authResponseToUser,
} = authSession;
