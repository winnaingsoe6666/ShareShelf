import api from "./api";
import type { Conversation, ConversationDetail, UnreadCount } from "@/types";

export async function getConversations(): Promise<Conversation[]> {
  const res = await api.get("/chat/conversations");
  return res.data.data;
}

export async function getConversation(
  itemId: number,
  otherUserId: number,
  page: number = 0,
  size: number = 50
): Promise<ConversationDetail> {
  const res = await api.get(`/chat/conversations/${itemId}/${otherUserId}`, {
    params: { page, size },
  });
  return res.data.data;
}

export async function markAsRead(itemId: number, otherUserId: number): Promise<void> {
  await api.post(`/chat/conversations/${itemId}/${otherUserId}/read`);
}

export async function getUnreadCount(): Promise<UnreadCount> {
  const res = await api.get("/chat/unread-count");
  return res.data.data;
}
