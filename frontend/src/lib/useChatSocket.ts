"use client";
import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";
import type { ChatMessage } from "@/types";

interface UseChatSocketOptions {
  userId: number | null;
  onMessage: (message: ChatMessage) => void;
  onUnreadUpdate?: () => void;
}

export function useChatSocket({ userId, onMessage, onUnreadUpdate }: UseChatSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  // Stabilize callbacks with refs so the effect doesn't re-run on every render
  const onMessageRef = useRef(onMessage);
  const onUnreadUpdateRef = useRef(onUnreadUpdate);
  onMessageRef.current = onMessage;
  onUnreadUpdateRef.current = onUnreadUpdate;

  const sendMessage = useCallback(
    (payload: { itemId: number; receiverId: number; message: string }) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(payload),
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!userId) return;

    const token = getToken();
    if (!token) return;

    // WebSocket URL: use dedicated env var, or derive from API URL, or fall back to /chat-ws
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      || (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "") + "/chat-ws"
      || "/chat-ws";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${userId}`, (message) => {
          const parsed: ChatMessage = JSON.parse(message.body);
          onMessageRef.current(parsed);
          onUnreadUpdateRef.current?.();
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  // Only re-run when userId changes — callbacks are read via refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { sendMessage, isConnected: clientRef.current?.connected ?? false };
}
