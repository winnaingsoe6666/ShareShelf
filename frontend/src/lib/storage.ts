import type { StorageAdapter } from "@shareshelf/shared";

/**
 * localStorage-based storage adapter for web.
 * Implements the StorageAdapter interface from @shareshelf/shared.
 */
export const localStorageAdapter: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};
