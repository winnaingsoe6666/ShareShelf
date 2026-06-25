# Phase 9: In-App Chat - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-25
**Phase:** 09-in-app-chat
**Areas discussed:** Chat entry points, Conversation list UX, Chat window style, Unread badge behavior

---

## Chat entry points

| Option | Description | Selected |
|--------|-------------|----------|
| Only after borrow request | Button only appears after a borrow request is made (pending/approved/rejected). Keeps chat contextual to actual borrowing activity. | ✓ |
| Always visible on item page | Button always shows on item detail page, even before any borrow request. Lets users ask questions about availability, condition, etc. | |
| Item page + borrow page | Button shows on item page AND on the borrow request detail page. Two entry points for the same conversation. | |

**User's choice:** Only after borrow request
**Notes:** Chat is contextual to borrowing activity — button appears only after a request exists.

| Option | Description | Selected |
|--------|-------------|----------|
| Hide for owner | Button hidden for owners on their own items. They can access conversations from /messages page. | ✓ |
| Show "View Messages" | Owners see "View Messages" instead — links to existing conversations about that item from /messages. | |

**User's choice:** Hide for owner
**Notes:** Owners don't need a button on their own items — they access conversations from /messages.

| Option | Description | Selected |
|--------|-------------|----------|
| Item page + /messages only | Chat is only accessible from item detail page and /messages page. Keeps it simple. | |
| Also from /borrow page | Add a chat icon/button on each borrow request row in /borrow page. Quick access from the borrowing workflow. | ✓ |
| Also from browse cards | Add chat buttons on item cards in browse results too. Maximum discoverability. | |

**User's choice:** Also from /borrow page
**Notes:** Two entry points — item detail page and /borrow page.

| Option | Description | Selected |
|--------|-------------|----------|
| Only the borrower who requested | Only borrowers who made a request can message the owner. Keeps conversations focused on actual borrow activity. | ✓ |
| Any authenticated user | Any authenticated user can message the owner about any item. More flexible but could lead to spam. | |

**User's choice:** Only the borrower who requested (button appears only after that user made a request)
**Notes:** Clarified that any authenticated user CAN message, but the UI only shows the button after a request. Final answer: button appears only after THAT user has made a request.

---

## Conversation list UX

| Option | Description | Selected |
|--------|-------------|----------|
| Item + user + last message | Each conversation shows the item name/thumbnail, other user's name, and last message preview. Most chat apps do this. | ✓ |
| Grouped by item | Group conversations under item headings. One item can have multiple borrower conversations underneath. | |

**User's choice:** Item + user + last message (flat list)
**Notes:** Standard chat list layout.

| Option | Description | Selected |
|--------|-------------|----------|
| Most recent first | Most recent message at top. Standard chat app behavior. | ✓ |
| Unread first, then recency | Conversations with unread messages appear at top, then sorted by recency. | |

**User's choice:** Most recent first
**Notes:** Standard sorting behavior.

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state with link to browse | Show a friendly message like "No messages yet" with a link to browse items. | |
| Simple empty text | Show a simple "No messages yet" text. No link. | |
| Suggest items to discuss | Show recent items the user has borrowed or listed, suggesting they start a conversation. | ✓ |

**User's choice:** Suggest items to discuss
**Notes:** More helpful than a generic empty state.

| Option | Description | Selected |
|--------|-------------|----------|
| Paginated with Load more | Load 20 conversations initially, show "Load more" button at bottom. | |
| Load all at once | Load all conversations at once. Fine for most users. | |
| Infinite scroll | Infinite scroll — load more as user scrolls down. | ✓ |

**User's choice:** Infinite scroll
**Notes:** Modern UX pattern for loading content.

| Option | Description | Selected |
|--------|-------------|----------|
| Dot + count badge | Show a blue dot or number badge next to conversations with unread messages. | ✓ |
| Dot only | Show only a blue dot for unread. No count. | |
| Bold text | Bold the conversation row for unread messages. | |

**User's choice:** Dot + count badge
**Notes:** Clear visual indicator with count.

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to chat page | Navigate to a dedicated /messages/[conversationId] page. Full page chat experience. | |
| Open chat modal | Open a chat modal/panel overlay on the current page. Stay in context. | |
| Desktop panel + mobile page | On desktop, show chat panel on the right side of /messages page. On mobile, navigate to chat page. | ✓ |

**User's choice:** Desktop panel + mobile page (responsive)
**Notes:** Split view on desktop, separate page on mobile. Common pattern in messaging apps.

---

## Chat window style

| Option | Description | Selected |
|--------|-------------|----------|
| Bubble style (left/right) | Messages aligned left for received, right for sent. Different background colors. Standard chat look. | ✓ |
| Thread style (left-aligned) | All messages left-aligned with sender name above. Simpler, more like a comment thread. | |

**User's choice:** Bubble style (left/right aligned)
**Notes:** Standard chat UI pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Item name + thumbnail (clickable) | Show item name + thumbnail at top of chat. Clicking it navigates to item detail page. | ✓ |
| Item name only | Show just the item name as text. No thumbnail, no link. | |
| Item + user info | Show item name + the other user's name/avatar. Two rows. | |

**User's choice:** Item name + thumbnail (clickable)
**Notes:** Contextual header with navigation to item.

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-growing textarea + send button | Textarea that grows as user types, capped at 2000 chars. Send button on the right. | ✓ |
| Single-line input (Enter to send) | Fixed single-line input. Enter sends, Shift+Enter for new line. Send button optional. | |

**User's choice:** Auto-growing textarea + send button
**Notes:** Better UX for multi-line messages.

| Option | Description | Selected |
|--------|-------------|----------|
| Load 50 initially + infinite scroll up | Load last 50 messages on open. Scroll up to load older messages. | ✓ |
| Load 20 + load more button | Load last 20 messages. "Load more" button at top. | |
| Load all messages | Load all messages at once. | |

**User's choice:** Load 50 initially + infinite scroll up
**Notes:** Balances initial load performance with history access.

---

## Unread badge behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Total unread messages | Badge shows total number of unread messages across all conversations. | |
| Unread conversation count | Badge shows number of conversations with unread messages. | ✓ |

**User's choice:** Unread conversation count
**Notes:** Less overwhelming than total message count.

| Option | Description | Selected |
|--------|-------------|----------|
| Real-time via WebSocket | Badge updates instantly when a new message arrives via WebSocket. No page refresh needed. | ✓ |
| On page refresh only | Badge updates when user navigates between pages or refreshes. Simpler but less responsive. | |

**User's choice:** Real-time via WebSocket
**Notes:** Responsive UX — badge updates without page refresh.

| Option | Description | Selected |
|--------|-------------|----------|
| Navbar only | Only show unread count in navbar. Keep item cards clean. | |
| Navbar + item cards | Show a small chat icon with unread count on item cards that have unread messages. | ✓ |
| Navbar + item cards + /borrow | Show badges on navbar, item cards, and the /borrow page for items with unread messages. | |

**User's choice:** Navbar + item cards
**Notes:** Two locations for unread indicators.

| Option | Description | Selected |
|--------|-------------|----------|
| On conversation open | Mark as read when user opens the conversation (views the messages). | ✓ |
| When message is visible | Mark as read when the message is visible on screen (intersection observer). | |
| After short delay | Mark as read after a short delay (e.g., 2 seconds) of viewing the conversation. | |

**User's choice:** On conversation open
**Notes:** Simple and predictable behavior.

---

## Claude's Discretion

- WebSocket connection lifecycle (when to connect/disconnect, reconnection strategy)
- STOMP message format and payload structure
- How to handle WebSocket authentication failures
- Rate limiting on message send (deferred — add if abuse occurs)
- Whether to show "online" status indicators
- Error handling for failed message delivery
- How to deduplicate conversations (item_id + user pair identity)

## Deferred Ideas

- Group chat (1-to-1 only for now)
- File/image sharing in chat
- Push notifications for new messages
- Message search
- Typing indicators
- Message deletion/editing
