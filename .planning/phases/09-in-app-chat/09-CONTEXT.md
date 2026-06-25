# Phase 9: In-App Chat - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Item-scoped real-time messaging between borrowers and item owners via WebSocket + STOMP. Users can message item owners about specific items after making a borrow request. Messages are persisted to PostgreSQL and delivered in real-time via STOMP to online recipients. The /messages page shows conversation history with unread badges. This phase delivers the backend WebSocket infrastructure, REST endpoints for history/inbox, frontend chat UI, and unread message tracking.

This phase does NOT include: group chat, file/image sharing in chat, push notifications, typing indicators, message deletion/editing, or message search.

</domain>

<decisions>
## Implementation Decisions

### Chat Entry Points
- **D-01:** "Message Owner" button appears on item detail page only after the logged-in user has made a borrow request for that item
- **D-02:** Button is hidden when the logged-in user IS the item owner
- **D-03:** Chat is accessible from item detail page AND /borrow page (each borrow request row has a chat icon/button)
- **D-04:** Any authenticated user can message an owner, but the UI only reveals the button after that user has made a request

### Conversation List UX (/messages page)
- **D-05:** Flat list layout — each conversation shows item name/thumbnail, other user's name, and last message preview
- **D-06:** Sorted by most recent message first
- **D-07:** Empty state suggests items to discuss (shows recent items the user has borrowed or listed)
- **D-08:** Infinite scroll for loading conversations
- **D-09:** Unread messages indicated with a blue dot + count badge on each conversation row
- **D-10:** Responsive behavior: on desktop, clicking a conversation opens a chat panel on the right side of /messages; on mobile, navigates to a dedicated chat page

### Chat Window Style
- **D-11:** Bubble-style messages — sent messages right-aligned, received messages left-aligned with different background colors
- **D-12:** Chat header shows item name + thumbnail (clickable, navigates to item detail page)
- **D-13:** Auto-growing textarea for message input with a send button on the right, capped at 2000 characters
- **D-14:** Load last 50 messages on conversation open, infinite scroll up to load older messages

### Unread Badge Behavior
- **D-15:** Navbar badge shows count of conversations with unread messages (not total message count)
- **D-16:** Badge updates in real-time via WebSocket (no page refresh needed)
- **D-17:** Unread badges appear on navbar AND on item cards in browse results
- **D-18:** Messages marked as read when user opens the conversation (views the messages)

### Claude's Discretion
- WebSocket connection lifecycle (when to connect/disconnect, reconnection strategy)
- STOMP message format and payload structure
- How to handle WebSocket authentication failures
- Rate limiting on message send (deferred from research — add if abuse occurs)
- Whether to show "online" status indicators
- Error handling for failed message delivery
- How to deduplicate conversations (item_id + user pair identity)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 9 success criteria and scope (CHAT-01 through CHAT-04)
- `.planning/REQUIREMENTS.md` — v1/v2 requirements; chat was previously "Out of Scope", now explicitly in scope

### Research & Technical Decisions
- `.planning/phases/09-in-app-chat/09-RESEARCH.md` — WebSocket + STOMP architecture, data model, dependency choices, security considerations

### Existing Auth System (WebSocket authentication depends on this)
- `backend/src/main/kotlin/com/shareshelf/auth/JwtTokenProvider.kt` — JWT validation; WebSocket handshake authenticates via STOMP CONNECT header
- `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt` — Current HTTP auth filter pattern; WebSocket needs equivalent
- `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt` — Security filter chain; WebSocket endpoints need to be permitted

### Existing Patterns (new code must follow)
- `backend/src/main/kotlin/com/shareshelf/common/ApiResponse.kt` — REST response wrapper for history/inbox endpoints
- `backend/src/main/kotlin/com/shareshelf/common/GlobalExceptionHandler.kt` — Error handling pattern
- `backend/src/main/kotlin/com/shareshelf/borrow/BorrowRequest.kt` — Borrow request entity; chat access depends on borrow request existence
- `frontend/src/lib/api.ts` — Axios instance with JWT interceptor
- `frontend/src/lib/auth.ts` — localStorage auth helpers

### Frontend Components (reuse/reference)
- `frontend/src/components/ui/` — Button, Input, Modal components for chat UI
- `frontend/src/app/[locale]/items/[id]/page.tsx` — Item detail page where "Message Owner" button goes
- `frontend/src/app/[locale]/borrow/page.tsx` — Borrow page where chat icon goes

### Database
- `backend/src/main/resources/db/migration/` — Flyway migrations; next version is V14

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **JwtTokenProvider** (`auth/JwtTokenProvider.kt`): `validateToken(token)` and `getEmailFromToken(token)` — WebSocket STOMP CONNECT header validates JWT using the same provider
- **ApiResponse<T>** (`common/ApiResponse.kt`): REST endpoints for conversation history and inbox use the same wrapper
- **Axios api.ts** (`lib/api.ts`): JWT interceptor already injects token — WebSocket client can read the same token from localStorage
- **Modal component** (`components/ui/Modal.tsx`): Can be reused or adapted for chat modal on mobile
- **Infinite scroll pattern**: Not yet established — will be a new pattern for both conversation list and message history

### Established Patterns
- **Package-by-feature**: New `chat/` package follows `auth/`, `item/`, `borrow/`, `review/` pattern with `entity/`, `dto/` sub-packages
- **Controller → Service → Repository**: Chat follows the same layered architecture
- **Flyway migrations**: Versioned SQL files. V14 creates `chat_messages` table
- **Frontend pages**: `"use client"` directive, `useState`/`useEffect` for data fetching, Tailwind CSS for styling

### Integration Points
- **SecurityConfig.kt**: Add WebSocket endpoints to permitted list (e.g., `/ws/**`)
- **BorrowRequest entity**: Chat access check queries borrow_requests to verify user has an existing request for the item
- **Item detail page**: Add "Message Owner" button that opens chat
- **Borrow page**: Add chat icon/button on each borrow request row
- **Navbar component**: Add unread badge with real-time count

</code_context>

<specifics>
## Specific Ideas

- Responsive layout: desktop shows split view on /messages (conversation list left, chat panel right); mobile navigates to separate chat page
- Empty /messages page suggests items to discuss (recent borrowed or listed items) rather than showing a generic empty state
- Chat header with clickable item thumbnail links back to item detail page
- Unread badge on item cards in browse results — small chat icon with number

</specifics>

<deferred>
## Deferred Ideas

- **Group chat**: Not in this phase. 1-to-1 only.
- **File/image sharing in chat**: Not in this phase. Use item images.
- **Push notifications for new messages**: Future phase.
- **Message search**: Future phase.
- **Typing indicators**: Future phase.
- **Message deletion/editing**: Future phase.
- **Online status indicators**: Claude's discretion — may add if straightforward.

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-In-App Chat*
*Context gathered: 2026-06-25*
