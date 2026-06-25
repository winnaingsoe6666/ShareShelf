## Plan 09-03a Summary — Frontend Chat Data Layer

**Status:** Complete

### Files Modified
- `frontend/src/types/index.ts` — appended ChatMessage, Conversation, ConversationDetail, UnreadCount interfaces
- `frontend/src/lib/chat.ts` — new file with 4 API functions
- `frontend/src/lib/useChatSocket.ts` — new file with STOMP WebSocket hook

### Dependencies Installed
- `@stomp/stompjs` — STOMP client for WebSocket messaging
- `sockjs-client` — SockJS transport for fallback compatibility
- `@types/sockjs-client` — TypeScript types for sockjs-client

### What Was Done

**Task 1: Chat types + API functions**
- Added 4 interfaces to types/index.ts: ChatMessage (id, senderId, receiverId, itemId, message, readAt, createdAt), Conversation (item summary + other user + lastMessage + unreadCount), ConversationDetail (full message list), UnreadCount (conversationsWithUnread)
- Created chat.ts with getConversations, getConversation, markAsRead, getUnreadCount — all using the shared api Axios instance

**Task 2: useChatSocket hook**
- Created useChatSocket.ts exporting a React hook that manages STOMP over SockJS
- Connects to /ws with JWT via connectHeaders
- Subscribes to /topic/chat/{userId} for incoming messages
- Returns sendMessage function that publishes to /app/chat.send
- Auto-reconnects with 5000ms delay
- Cleans up on unmount via client.deactivate()

### Verification
- `npx tsc --noEmit` — no errors in chat files (4 pre-existing errors in unrelated test/component files)
