# Plan 09-02 Summary: Chat Service Layer, REST Endpoints, and STOMP Controller

## Status: COMPLETE

## What Was Built

### ChatDtos.kt (5 data classes)
- `SendMessageRequest` — with `@field:NotBlank` and `@field:Size(max=2000)` validation on message field
- `MessageResponse` — single message DTO with id, senderId, receiverId, itemId, message, readAt, createdAt
- `ConversationResponse` — inbox row with itemTitle, itemImageUrl, otherUserName, unreadCount
- `ConversationDetailResponse` — full conversation with paginated messages list
- `UnreadCountResponse` — navbar badge with conversationsWithUnread count

### ChatService.kt
- `@Service` with constructor injection of ChatRepository, BorrowRepository, UserRepository, ItemRepository, ObjectMapper
- `getConversations(userId)` — returns latest message per conversation sorted by lastMessageAt DESC, with per-conversation unread counts
- `getConversation(itemId, otherUserId, userId, page, size)` — paginated message history (default 50)
- `sendMessage(senderId, request)` — `@Transactional`, validates sender != receiver, item/user existence, and access (borrow request OR item owner)
- `markAsRead(itemId, senderId, receiverId)` — `@Transactional`, delegates to repository
- `getUnreadCount(userId)` — returns count of distinct conversations with unread messages

### ChatController.kt (4 REST endpoints)
- `GET /api/chat/conversations` — conversation list for authenticated user
- `GET /api/chat/conversations/{itemId}/{otherUserId}` — paginated message history with optional page/size params
- `POST /api/chat/conversations/{itemId}/{otherUserId}/read` — mark messages as read
- `GET /api/chat/unread-count` — unread conversation count for navbar badge

### ChatStompController.kt
- `@Controller` (not @RestController) with `@MessageMapping("/chat.send")`
- Extracts userId from `java.security.Principal` (set by WebSocketAuthInterceptor)
- Persists message via ChatService, then broadcasts to both `/topic/chat/{receiverId}` and `/topic/chat/{senderId}` via SimpMessagingTemplate

### ChatRepository.kt (modified)
- Added `countUnreadByItemAndReceiver(itemId, receiverId, senderId)` for per-conversation unread counts
- Added `countUnreadConversationsByReceiverId(receiverId)` for distinct conversation count with unread messages

### BorrowRepository.kt (modified)
- Added `findByItemIdAndBorrowerId(itemId, borrowerId)` for checking any borrow request regardless of status

## Key Design Decisions
- Access gating: sender must be item owner OR have any borrow request (any status) for the item
- STOMP broadcasts to both sender and receiver topics for multi-tab sync
- Messages are persisted to DB before STOMP broadcast (offline users get them on next REST load)
- Per-conversation unread counts use separate query instead of batch to keep implementation simple

## Verification
- `./gradlew compileKotlin` — BUILD SUCCESSFUL
