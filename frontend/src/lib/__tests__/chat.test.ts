import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

import api from "@/lib/api";
import { getConversations, getConversation, markAsRead, getUnreadCount } from "@/lib/chat";

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

describe("chat lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConversations", () => {
    it("fetches conversations from correct URL", async () => {
      const conversations = [
        { itemId: 1, itemTitle: "Drill", otherUserId: 2, lastMessage: "Hi", unreadCount: 1 },
      ];
      mockApi.get.mockResolvedValue({ data: { data: conversations } });

      const result = await getConversations();

      expect(mockApi.get).toHaveBeenCalledWith("/chat/conversations");
      expect(result).toEqual(conversations);
    });

    it("returns empty array when no conversations", async () => {
      mockApi.get.mockResolvedValue({ data: { data: [] } });

      const result = await getConversations();

      expect(result).toEqual([]);
    });
  });

  describe("getConversation", () => {
    it("fetches conversation with correct URL and params", async () => {
      const detail = {
        itemId: 1,
        itemTitle: "Drill",
        otherUserId: 2,
        otherUserName: "User",
        messages: [{ id: 1, message: "Hello" }],
      };
      mockApi.get.mockResolvedValue({ data: { data: detail } });

      const result = await getConversation(1, 2, 0, 50);

      expect(mockApi.get).toHaveBeenCalledWith("/chat/conversations/1/2", {
        params: { page: 0, size: 50 },
      });
      expect(result).toEqual(detail);
    });

    it("uses default page and size when not provided", async () => {
      mockApi.get.mockResolvedValue({ data: { data: { messages: [] } } });

      await getConversation(5, 10);

      expect(mockApi.get).toHaveBeenCalledWith("/chat/conversations/5/10", {
        params: { page: 0, size: 50 },
      });
    });

    it("passes custom page and size", async () => {
      mockApi.get.mockResolvedValue({ data: { data: { messages: [] } } });

      await getConversation(5, 10, 2, 25);

      expect(mockApi.get).toHaveBeenCalledWith("/chat/conversations/5/10", {
        params: { page: 2, size: 25 },
      });
    });
  });

  describe("markAsRead", () => {
    it("posts to correct URL", async () => {
      mockApi.post.mockResolvedValue({ data: {} });

      await markAsRead(1, 2);

      expect(mockApi.post).toHaveBeenCalledWith("/chat/conversations/1/2/read");
    });
  });

  describe("getUnreadCount", () => {
    it("fetches unread count from correct URL", async () => {
      mockApi.get.mockResolvedValue({ data: { data: { conversationsWithUnread: 3 } } });

      const result = await getUnreadCount();

      expect(mockApi.get).toHaveBeenCalledWith("/chat/unread-count");
      expect(result).toEqual({ conversationsWithUnread: 3 });
    });

    it("returns zero when no unread", async () => {
      mockApi.get.mockResolvedValue({ data: { data: { conversationsWithUnread: 0 } } });

      const result = await getUnreadCount();

      expect(result.conversationsWithUnread).toBe(0);
    });
  });
});
