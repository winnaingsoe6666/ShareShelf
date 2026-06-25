# Phase 09 Plan Outline — In-App Chat

| Plan ID | Objective | Wave | Depends On | Requirements |
|---------|-----------|------|------------|--------------|
| 09-01 | Data model + WebSocket infrastructure: Flyway V14 migration, ChatMessage entity, ChatRepository, WebSocket+STOMP config with JWT ChannelInterceptor, SecurityConfig update for `/ws/**` | 1 | -- | CHAT-01 |
| 09-02 | Backend chat service + REST + STOMP delivery: ChatService, ChatController (history/inbox/send/mark-read), STOMP broadcast to `/topic/chat/{userId}`, DTOs | 2 | 09-01 | CHAT-02 |
| 09-03a | Frontend chat foundation: TypeScript types (ChatMessage, Conversation), chat API lib (getConversations, getConversation, markAsRead, getUnreadCount), useChatSocket STOMP hook | 2 | 09-01 | CHAT-03 |
| 09-03b | Frontend chat components: ChatMessage bubble, ChatWindow (thread + textarea + infinite scroll), ConversationList (inbox + unread badges + empty state) | 2 | 09-01 | CHAT-03 |
| 09-03c | Frontend page integrations: /messages page (split view), "Message Owner" button on item detail, chat icon on borrow page, Navbar unread badge | 2 | 09-01 | CHAT-03 |
| 09-04 | Chat tests: backend JUnit 5 + MockK for ChatService/ChatController; frontend Vitest + RTL for ChatWindow, ConversationList, chat lib | 3 | 09-02, 09-03a, 09-03b, 09-03c | CHAT-04 |

## OUTLINE COMPLETE
