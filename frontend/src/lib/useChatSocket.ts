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

    const client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL || ""}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${userId}`, (message) => {
          const parsed: ChatMessage = JSON.parse(message.body);
          onMessage(parsed);
          onUnreadUpdate?.();
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
  }, [userId, onMessage, onUnreadUpdate]);

  return { sendMessage, isConnected: clientRef.current?.connected ?? false };
}
