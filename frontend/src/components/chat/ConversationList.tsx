"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/lib/chat";
import type { Conversation } from "@/types";

interface ConversationListProps {
  onSelect: (itemId: number, otherUserId: number, otherUserName: string, itemTitle: string, itemImageUrl: string | null) => void;
  selectedItemId?: number;
  selectedUserId?: number;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ConversationList({ onSelect, selectedItemId, selectedUserId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then((data) => setConversations(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-stone-400">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <p className="text-sm text-stone-500 mb-2">No conversations yet</p>
        <p className="text-xs text-stone-400">
          Start a conversation by browsing{" "}
          <a href="/items" className="text-emerald-600 hover:underline">items</a>
          {" "}and messaging an owner.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conv) => {
        const isSelected = conv.itemId === selectedItemId && conv.otherUserId === selectedUserId;
        return (
          <button
            key={`${conv.itemId}-${conv.otherUserId}`}
            onClick={() => onSelect(conv.itemId, conv.otherUserId, conv.otherUserName, conv.itemTitle, conv.itemImageUrl)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
              isSelected ? "bg-stone-100" : "hover:bg-stone-50"
            }`}
          >
            {conv.itemImageUrl ? (
              <img
                src={conv.itemImageUrl}
                alt={conv.itemTitle}
                className="h-10 w-10 rounded object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center shrink-0">
                <span className="text-xs text-purple-400">📦</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-900 truncate">{conv.itemTitle}</p>
                <span className="text-xs text-stone-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
              </div>
              <p className="text-xs text-stone-500 truncate">{conv.otherUserName}</p>
              <p className="text-sm text-stone-400 truncate mt-0.5">{conv.lastMessage}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
