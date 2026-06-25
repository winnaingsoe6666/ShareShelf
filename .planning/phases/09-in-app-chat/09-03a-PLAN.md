---
phase: 09-in-app-chat
plan: 03a
type: execute
wave: 2
depends_on:
  - 09-01
files_modified:
  - frontend/src/types/index.ts
  - frontend/src/lib/chat.ts
  - frontend/src/lib/useChatSocket.ts
autonomous: true
requirements:
  - CHAT-03
must_haves:
  truths:
    - "ChatMessage and Conversation TypeScript interfaces exist in types/index.ts"
    - "chat.ts exports getConversations, getConversation, markAsRead, getUnreadCount API functions"
    - "useChatSocket hook connects to /ws STOMP endpoint with JWT, subscribes to /topic/chat/{userId}"
    - "useChatSocket delivers incoming messages via onMessage callback"
  artifacts:
    - path: "frontend/src/types/index.ts"
      provides: "Chat TypeScript interfaces"
      contains: "ChatMessage"
    - path: "frontend/src/lib/chat.ts"
      provides: "Chat API functions"
      contains: "getConversations"
    - path: "frontend/src/lib/useChatSocket.ts"
      provides: "WebSocket hook for real-time chat"
      contains: "useChatSocket"
  key_links:
    - from: "frontend/src/lib/useChatSocket.ts"
      to: "frontend/src/lib/auth.ts"
      via: "getToken() for WebSocket JWT"
      pattern: "getToken\\(\\)"
    - from: "frontend/src/lib/chat.ts"
      to: "frontend/src/lib/api.ts"
      via: "axios instance for REST calls"
      pattern: "import.*api.*from"
---

<objective>
Create the frontend chat data layer: TypeScript types, chat API functions, and WebSocket hook.

Purpose: Provides the foundation that chat components (09-03b) and page integrations (09-03c) build on. Defines the data contracts, REST API calls, and real-time WebSocket connection via STOMP.

Output:
- ChatMessage and Conversation interfaces in types/index.ts
- Chat API functions (getConversations, getConversation, markAsRead, getUnreadCount) in chat.ts
- useChatSocket React hook for STOMP WebSocket connection in useChatSocket.ts
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/09-in-app-chat/09-CONTEXT.md
@.planning/phases/09-in-app-chat/09-RESEARCH.md
@.planning/phases/09-in-app-chat/09-01-PLAN.md
</context>

<interfaces>
From 09-02-PLAN.md backend DTOs (this plan's frontend counterparts):
```
ConversationResponse: { itemId, itemTitle, itemImageUrl, otherUserId, otherUserName, lastMessage, lastMessageAt, unreadCount }
MessageResponse: { id, senderId, receiverId, itemId, message, readAt, createdAt }
ConversationDetailResponse: { itemId, itemTitle, itemImageUrl, otherUserId, otherUserName, messages: MessageResponse[] }
UnreadCountResponse: { conversationsWithUnread: number }
```

REST endpoints (from 09-02):
- GET /api/chat/conversations → ConversationResponse[]
- GET /api/chat/conversations/{itemId}/{otherUserId}?page=0&size=50 → ConversationDetailResponse
- POST /api/chat/conversations/{itemId}/{otherUserId}/read → marks read
- GET /api/chat/unread-count → UnreadCountResponse

WebSocket (from 09-01):
- Endpoint: /ws (SockJS)
- STOMP broker prefix: /topic
- Subscribe: /topic/chat/{userId}
- Send: /app/chat.send
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Chat types + API functions</name>
  <files>
    frontend/src/types/index.ts,
    frontend/src/lib/chat.ts
  </files>
  <read_first>
    - frontend/src/types/index.ts (existing type definitions — add ChatMessage, Conversation at the end)
    - frontend/src/lib/api.ts (Axios instance pattern — use same instance for chat API calls)
    - frontend/src/lib/auth.ts (getUser() for current user ID)
  </read_first>
  <action>
    **File 1: frontend/src/types/index.ts** — append these interfaces at the end:

    ```typescript
    export interface ChatMessage {
      id: number;
      senderId: number;
      receiverId: number;
      itemId: number;
      message: string;
      readAt: string | null;
      createdAt: string;
    }

    export interface Conversation {
      itemId: number;
      itemTitle: string;
      itemImageUrl: string | null;
      otherUserId: number;
      otherUserName: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
    }

    export interface ConversationDetail {
      itemId: number;
      itemTitle: string;
      itemImageUrl: string | null;
      otherUserId: number;
      otherUserName: string;
      messages: ChatMessage[];
    }

    export interface UnreadCount {
      conversationsWithUnread: number;
    }
    ```

    **File 2: frontend/src/lib/chat.ts** — new file:

    ```typescript
    import api from "./api";
    import type { Conversation, ConversationDetail, UnreadCount, ChatMessage } from "@/types";

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
    ```

    Follow the existing pattern in lib/api.ts — use the `api` Axios instance which already injects JWT via interceptor.
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -10
    </automated>
    TypeScript compilation succeeds with no errors.
  </verify>
  <acceptance_criteria>
    - types/index.ts exports ChatMessage interface with id, senderId, receiverId, itemId, message, readAt (string | null), createdAt
    - types/index.ts exports Conversation interface with itemId, itemTitle, itemImageUrl, otherUserId, otherUserName, lastMessage, lastMessageAt, unreadCount
    - types/index.ts exports ConversationDetail interface with messages: ChatMessage[]
    - types/index.ts exports UnreadCount interface with conversationsWithUnread
    - chat.ts exports getConversations function calling GET /chat/conversations
    - chat.ts exports getConversation function calling GET /chat/conversations/{itemId}/{otherUserId} with page/size params
    - chat.ts exports markAsRead function calling POST /chat/conversations/{itemId}/{otherUserId}/read
    - chat.ts exports getUnreadCount function calling GET /chat/unread-count
    - chat.ts imports api from "./api" (same Axios instance with JWT interceptor)
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    TypeScript interfaces for chat data and API functions for all 4 chat REST endpoints. Components and pages can now import these.
  </done>
</task>

<task type="auto">
  <name>Task 2: useChatSocket hook for STOMP WebSocket connection</name>
  <files>
    frontend/src/lib/useChatSocket.ts
  </files>
  <read_first>
    - frontend/src/lib/auth.ts (getToken() returns JWT from localStorage)
    - frontend/src/types/index.ts (ChatMessage interface for callback type)
    - .planning/phases/09-in-app-chat/09-RESEARCH.md (WebSocket + STOMP architecture: endpoint /ws, subscribe /topic/chat/{userId}, send /app/chat.send)
    - .planning/phases/09-in-app-chat/09-01-PLAN.md (WebSocketConfig: SockJS endpoint, STOMP broker prefix /topic, app destination /app)
  </read_first>
  <action>
    Create **frontend/src/lib/useChatSocket.ts** — a React hook that manages the STOMP WebSocket connection.

    Implementation:
    ```typescript
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

      const sendMessage = useCallback((payload: { itemId: number; receiverId: number; message: string }) => {
        if (clientRef.current?.connected) {
          clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(payload),
          });
        }
      }, []);

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
    ```

    Key decisions:
    - Uses @stomp/stompjs Client (modern, maintained) with SockJS factory for fallback (per RESEARCH.md)
    - JWT passed via connectHeaders Authorization (same token as HTTP, from auth.ts getToken())
    - Subscribes to /topic/chat/{userId} — each user gets their own topic (per RESEARCH.md)
    - reconnectDelay: 5000 for auto-reconnect
    - sendMessage publishes to /app/chat.send (mapped to @MessageMapping in backend)
    - onUnreadUpdate callback lets Navbar refresh unread count on new messages (D-16)
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -10
    </automated>
    TypeScript compilation succeeds.
  </verify>
  <acceptance_criteria>
    - useChatSocket.ts exports useChatSocket function accepting userId, onMessage, onUnreadUpdate
    - useChatSocket creates STOMP Client with SockJS factory pointing to /ws endpoint
    - useChatSocket passes JWT via connectHeaders: { Authorization: "Bearer {token}" }
    - useChatSocket subscribes to /topic/chat/{userId} on connect
    - useChatSocket calls onMessage callback when STOMP message arrives
    - useChatSocket calls onUnreadUpdate callback after receiving a message
    - useChatSocket returns sendMessage function that publishes to /app/chat.send
    - useChatSocket auto-reconnects with 5000ms delay
    - useChatSocket cleans up (deactivates) on unmount
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    useChatSocket hook manages STOMP WebSocket lifecycle. Components can use it to send/receive messages in real-time. JWT authentication matches backend WebSocketAuthInterceptor.
  </done>
</task>

</tasks>

<verification>
After this plan completes, verify:
1. `npx tsc --noEmit` succeeds in the frontend directory
2. ChatMessage, Conversation, ConversationDetail, UnreadCount interfaces exported from types/index.ts
3. chat.ts exports 4 API functions matching backend endpoints
4. useChatSocket connects to /ws with JWT and subscribes to /topic/chat/{userId}
</verification>

<success_criteria>
- ChatMessage and Conversation TypeScript interfaces exist
- chat.ts provides getConversations, getConversation, markAsRead, getUnreadCount
- useChatSocket hook manages STOMP connection with JWT auth, message subscription, and send
- All types compile with npx tsc --noEmit
</success_criteria>

<output>
Create `.planning/phases/09-in-app-chat/09-03a-SUMMARY.md` when done
</output>
