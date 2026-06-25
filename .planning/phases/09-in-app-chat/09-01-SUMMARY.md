---
phase: 09-in-app-chat
plan: 01
status: completed
---

## Summary: Plan 09-01 — Chat Data Model + WebSocket Infrastructure

### What Was Done

Created the foundational chat data model and real-time messaging infrastructure for Phase 09.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/main/resources/db/migration/V14__create_chat_messages.sql` | Flyway migration creating chat_messages table with FK constraints and 4 indexes |
| `backend/src/main/kotlin/com/shareshelf/chat/entity/ChatMessage.kt` | JPA entity mapping to chat_messages table |
| `backend/src/main/kotlin/com/shareshelf/chat/ChatRepository.kt` | JpaRepository with conversation, inbox, unread count, and mark-as-read queries |
| `backend/src/main/kotlin/com/shareshelf/auth/WebSocketAuthInterceptor.kt` | ChannelInterceptor that validates JWT on STOMP CONNECT frames |
| `backend/src/main/kotlin/com/shareshelf/config/WebSocketConfig.kt` | WebSocket+STOMP config with /ws endpoint, SockJS, /topic broker, /app prefix |

### Files Modified

| File | Change |
|------|--------|
| `backend/build.gradle.kts` | Added `spring-boot-starter-websocket` dependency |
| `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt` | Added `/ws/**` to permitAll() requestMatchers |

### Key Design Decisions

- **Item-scoped chat**: Every message is tied to an item via `item_id`. Conversations are identified by (itemId, user pair).
- **STOMP over SockJS**: WebSocket transport with SockJS fallback for browsers/networks that block WebSocket.
- **JWT on STOMP CONNECT**: Authentication happens at the STOMP level via ChannelInterceptor, not HTTP filter chain. The `/ws/**` path is permitted in Spring Security since auth is handled by WebSocketAuthInterceptor.
- **Message persistence first**: Messages are persisted to PostgreSQL before delivery. Offline users get messages on next page load via REST history.
- **Unread tracking**: `read_at` column is null for unread messages. Partial index on (receiver_id, read_at) WHERE read_at IS NULL optimizes unread count queries.

### Verification

- `./gradlew compileKotlin` BUILD SUCCESSFUL
