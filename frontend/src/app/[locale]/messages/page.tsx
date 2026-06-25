"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChatSocket } from "@/lib/useChatSocket";
import { getUser } from "@/lib/auth";
import type { ChatMessage } from "@/types";

export default function MessagesPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const user = getUser();

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedItemTitle, setSelectedItemTitle] = useState("");
  const [selectedItemImageUrl, setSelectedItemImageUrl] = useState<string | null>(null);

  // Handle query params for deep linking (e.g., from borrow page)
  useEffect(() => {
    const itemIdParam = searchParams.get("itemId");
    const userIdParam = searchParams.get("userId");
    if (itemIdParam && userIdParam) {
      setSelectedItemId(Number(itemIdParam));
      setSelectedOtherUserId(Number(userIdParam));
    }
  }, [searchParams]);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      // If the message belongs to the currently open conversation, it will be
      // handled by ChatWindow's own polling or optimistic updates.
      // For now, we just let the ConversationList refresh on next visit.
      void message;
    },
    []
  );

  const handleUnreadUpdate = useCallback(() => {
    // ConversationList will re-fetch on next mount; no-op here for now
  }, []);

  const { sendMessage } = useChatSocket({
    userId: user?.id ?? null,
    onMessage: handleIncomingMessage,
    onUnreadUpdate: handleUnreadUpdate,
  });

  const handleSelect = (
    itemId: number,
    otherUserId: number,
    otherUserName: string,
    itemTitle: string,
    itemImageUrl: string | null
  ) => {
    setSelectedItemId(itemId);
    setSelectedOtherUserId(otherUserId);
    setSelectedUserName(otherUserName);
    setSelectedItemTitle(itemTitle);
    setSelectedItemImageUrl(itemImageUrl);
  };

  const handleBack = () => {
    setSelectedItemId(null);
    setSelectedOtherUserId(null);
  };

  const hasSelection = selectedItemId !== null && selectedOtherUserId !== null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-0 md:px-4 py-0 md:py-8">
        <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] md:rounded-xl md:border md:border-purple-200 md:overflow-hidden bg-white">
          {/* Desktop: always show both panels */}
          {/* Mobile: show one or the other */}
          <div
            className={`${
              hasSelection ? "hidden md:flex" : "flex"
            } w-full md:w-80 md:border-r md:border-stone-200 flex-col shrink-0`}
          >
            <div className="px-4 py-3 border-b border-stone-200 bg-white shrink-0">
              <h2 className="font-heading text-lg font-semibold text-purple-900">{t("messagesPage.title")}</h2>
            </div>
            <ConversationList
              onSelect={handleSelect}
              selectedItemId={selectedItemId ?? undefined}
              selectedUserId={selectedOtherUserId ?? undefined}
            />
          </div>

          <div
            className={`${
              hasSelection ? "flex" : "hidden md:flex"
            } flex-1 flex-col min-w-0`}
          >
            {hasSelection && selectedItemId !== null && selectedOtherUserId !== null ? (
              <ChatWindow
                itemId={selectedItemId}
                otherUserId={selectedOtherUserId}
                otherUserName={selectedUserName}
                itemTitle={selectedItemTitle}
                itemImageUrl={selectedItemImageUrl}
                onBack={handleBack}
                sendMessage={sendMessage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400">
                <p className="text-sm">{t("messagesPage.selectConversation")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
