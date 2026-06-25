---
phase: 09-in-app-chat
plan: 04
status: done
---

## Summary

Added comprehensive tests for the chat feature across backend and frontend.

### Files Created

**Backend:**
- `backend/src/test/kotlin/com/shareshelf/chat/ChatServiceTest.kt` — 14 test methods
- `backend/src/test/kotlin/com/shareshelf/chat/ChatControllerTest.kt` — 10 test methods

**Frontend:**
- `frontend/src/lib/__tests__/chat.test.ts` — 8 test methods
- `frontend/src/components/chat/__tests__/ChatWindow.test.tsx` — 13 test methods
- `frontend/src/components/chat/__tests__/ConversationList.test.tsx` — 11 test methods

### Test Coverage

**ChatServiceTest (14 tests):**
- sendMessage: access gating for borrower with request, access gating for owner, AccessDeniedException for stranger, IllegalArgumentException for self-messaging, EntityNotFoundException for missing item, EntityNotFoundException for missing receiver
- getConversation: returns messages, returns empty when no conversation
- getConversations: returns sorted list, returns empty list, resolves otherUserId correctly when user is sender
- markAsRead: delegates to repository
- getUnreadCount: returns count, returns zero

**ChatControllerTest (10 tests):**
- GET /api/chat/conversations: returns list, returns empty list
- GET /api/chat/conversations/{itemId}/{otherUserId}: returns detail, passes page/size params, caps size at 100
- POST /api/chat/conversations/{itemId}/{otherUserId}/read: marks as read
- GET /api/chat/unread-count: returns count, returns zero

**chat.test.ts (8 tests):**
- getConversations: correct URL, empty array
- getConversation: correct URL with params, default page/size, custom page/size
- markAsRead: correct URL
- getUnreadCount: correct URL, zero case

**ChatWindow.test.tsx (13 tests):**
- Renders item title and user name in header
- Renders messages after loading
- Calls markAsRead on mount
- Calls getConversation with correct params
- Textarea has maxLength 2000
- Send button triggers sendMessage
- Empty text does not trigger send
- Input clears after sending
- Back button renders when onBack provided
- Loading state shown initially
- Enter key sends message
- Shift+Enter does not send

**ConversationList.test.tsx (11 tests):**
- Renders conversation items, user names, last messages
- Shows unread badge when count > 0
- No badge when count is 0
- Empty state when no conversations
- Calls onSelect on row click (with and without image URL)
- Loading state
- Selected conversation highlight
- 99+ display for counts over 99

### Verification

- Backend: `./gradlew test --tests "com.shareshelf.chat.*"` — BUILD SUCCESSFUL (24 tests)
- Frontend: `npx vitest run src/lib/__tests__/chat.test.ts src/components/chat/__tests__/` — 32 tests passed
