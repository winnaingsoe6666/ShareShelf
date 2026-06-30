"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { getConversation, markAsRead } from "@/lib/chat";
import { getUser } from "@/lib/auth";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatWindowProps {
  itemId: number;
  otherUserId: number;
  otherUserName: string;
  itemTitle: string;
  itemImageUrl: string | null;
  otherUserAvatarUrl?: string | null;
  onBack?: () => void;
  sendMessage: (payload: { itemId: number; receiverId: number; message: string }) => void;
}

export default function ChatWindow({
  itemId,
  otherUserId,
  otherUserName,
  itemTitle,
  itemImageUrl,
  otherUserAvatarUrl = null,
  onBack,
  sendMessage,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const user = getUser();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial messages
  useEffect(() => {
    setIsLoading(true);
    getConversation(itemId, otherUserId, 0, 50)
      .then((data) => {
        setMessages(data.messages);
        setHasMore(data.messages.length >= 50);
        setPage(0);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Mark as read
    markAsRead(itemId, otherUserId).catch(() => {});
  }, [itemId, otherUserId, scrollToBottom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length > 2000) return;

    // Optimistic append
    const optimisticMsg: ChatMessageType = {
      id: Date.now(),
      senderId: user?.id ?? 0,
      receiverId: otherUserId,
      itemId,
      message: trimmed,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    sendMessage({ itemId, receiverId: otherUserId, message: trimmed });
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Infinite scroll: load older messages
  const handleScroll = () => {
    if (!scrollContainerRef.current || !hasMore || isLoading) return;
    if (scrollContainerRef.current.scrollTop === 0) {
      const nextPage = page + 1;
      setIsLoading(true);
      getConversation(itemId, otherUserId, nextPage, 50)
        .then((data) => {
          if (data.messages.length > 0) {
            setMessages((prev) => [...data.messages, ...prev]);
            setHasMore(data.messages.length >= 50);
            setPage(nextPage);
          } else {
            setHasMore(false);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white shrink-0">
        {onBack && (
          <button onClick={onBack} className="cursor-pointer text-stone-500 hover:text-stone-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {otherUserAvatarUrl ? (
          <img src={otherUserAvatarUrl} alt={otherUserName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-xs font-medium text-purple-600">{otherUserName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900">{otherUserName}</p>
          <a href={`/items/${itemId}`} className="text-xs text-stone-500 hover:text-emerald-600 truncate block">
            {itemTitle}
          </a>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {isLoading && messages.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-4">Loading messages...</p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-stone-200 bg-white shrink-0">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={2000}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || inputText.length > 2000}
          className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
