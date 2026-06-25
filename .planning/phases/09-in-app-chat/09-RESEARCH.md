# Research: Phase 09 — In-App Chat

## Decision: Item-Scoped Chat with WebSocket + STOMP

### Chat Scope
- **Item-scoped only** — every conversation is about a specific item
- Borrower clicks "Message Owner" on item detail page
- No general user-to-user messaging (keeps it simple and contextual)
- Conversation identity: (itemId, user1Id, user2Id) tuple

### Real-Time: WebSocket + STOMP over SockJS

**Why WebSocket + STOMP:**
- Spring Boot has native WebSocket+STOMP support (spring-boot-starter-websocket)
- STOMP provides pub/sub semantics out of the box
- SockJS fallback for browsers/networks that block WebSocket
- No external infrastructure needed (runs inside existing Spring Boot app)
- JWT authentication via STOMP CONNECT headers

**Why not alternatives:**
| Option | Rejected Because |
|--------|-----------------|
| RabbitMQ + STOMP | Overkill — single server, low user count, adds infra complexity |
| REST polling | Laggy UX, wastes bandwidth, not real-time |
| Firebase/Supabase | External dependency, vendor lock-in, cost |
| Server-Sent Events | One-way only — need bidirectional for chat |
| Socket.IO | Spring STOMP is more idiomatic for Spring Boot |

### Architecture

```
Browser A ──WebSocket──> Spring Boot ──> PostgreSQL
                              │
Browser B ──WebSocket──> Spring Boot ──> PostgreSQL
```

- Messages persisted to PostgreSQL FIRST, then delivered via STOMP
- If recipient is offline, message waits in DB — delivered on next page load via REST history
- STOMP topic: `/topic/chat/{userId}` — each user subscribes to their own topic
- REST endpoints serve as fallback for history and inbox

### Data Model

```
chat_messages
├── id BIGSERIAL PK
├── sender_id BIGINT FK → users
├── receiver_id BIGINT FK → users
├── item_id BIGINT FK → items
├── message TEXT
├── read_at TIMESTAMP (null = unread)
└── created_at TIMESTAMP
```

- No separate "conversation" table — conversations derived from (item_id, user pair)
- read_at tracks unread messages per receiver
- Indexes on (item_id, sender_id, receiver_id, created_at) for conversation queries
- Index on (receiver_id, read_at) WHERE read_at IS NULL for unread count

### Frontend Dependencies
- `@stomp/stompjs` — STOMP client (modern, maintained)
- `sockjs-client` — SockJS transport for fallback
- No heavy chat SDK needed — plain STOMP messages

### Security Considerations
- WebSocket handshake requires JWT in STOMP CONNECT header
- Users can only read conversations they are a participant of (sender or receiver)
- Message length capped at 2000 characters
- Rate limiting deferred (add later if abuse occurs)

### What This Phase Does NOT Include
- Group chat (only 1-to-1)
- File/image sharing in chat (use item images)
- Push notifications for new messages (future phase)
- Message search (future)
- Typing indicators (future)
- Message deletion/editing (future)
