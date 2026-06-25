"use client";

import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className="max-w-[75%]">
        <div
          className={`px-4 py-2 ${
            isOwn
              ? "bg-emerald-100 rounded-2xl rounded-br-sm"
              : "bg-stone-100 rounded-2xl rounded-bl-sm"
          }`}
        >
          <p className="text-sm text-stone-900 whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-stone-400">{time}</span>
          {isOwn && message.readAt && (
            <span className="text-xs text-emerald-500">&#10003;&#10003;</span>
          )}
        </div>
      </div>
    </div>
  );
}
