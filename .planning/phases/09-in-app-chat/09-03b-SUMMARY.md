# 09-03b SUMMARY — Chat UI Components

## Result: SUCCESS

All three chat UI components were created and compile without TypeScript errors.

## Files Created

### frontend/src/components/chat/ChatMessage.tsx
- "use client" default export function component
- Props: `{ message: ChatMessage; isOwn: boolean }`
- Bubble styling: emerald-100 for own messages (right-aligned, rounded-br-sm), stone-100 for received (left-aligned, rounded-bl-sm)
- Max-width 75% bubble with whitespace-pre-wrap for line breaks
- Timestamp in text-xs text-stone-400 below each bubble
- Read indicator (double checkmark in emerald-500) for own messages when readAt is not null

### frontend/src/components/chat/ChatWindow.tsx
- "use client" default export function component
- Props: `{ itemId, otherUserId, otherUserName, itemTitle, itemImageUrl, onBack?, sendMessage }`
- Loads initial 50 messages via getConversation on mount, marks as read via markAsRead
- Header: item thumbnail (clickable to /items/{id}) + itemTitle as Link + otherUserName + optional mobile back button
- Scrollable message container rendering ChatMessage bubbles
- Infinite scroll up: detects scrollTop < 100, loads next page, preserves scroll position
- Auto-growing textarea: ref-based height adjustment, max-height 150px, 2000 char max
- Send button (lucide Send icon) with disabled state when empty
- Enter sends, Shift+Enter for newline
- Optimistic UI: appends sent message immediately with temporary ID
- Auto-scrolls to bottom on new messages
- Character counter (n/2000)

### frontend/src/components/chat/ConversationList.tsx
- "use client" default export function component
- Props: `{ onSelect, selectedItemId?, selectedUserId? }`
- Loads conversations via getConversations on mount
- Each row: 40x40 item thumbnail (or placeholder), item title, other user name, last message preview (truncated), relative time ago
- Unread badge: blue dot + unreadCount on right side
- Empty state: icon + "No conversations yet" + "Browse items" link to /items
- Selected row highlighted with bg-stone-100
- timeAgo helper: just now / Xm / Xh / Xd / date

## Verification
- npx tsc --noEmit: all errors are pre-existing (en.json imports, MapView, test files) — zero errors in chat components
- All imports resolve to existing files: @/types, @/lib/chat, @/lib/auth, lucide-react
