---
phase: 09-in-app-chat
plan: 03c
type: execute
wave: 2
depends_on:
  - 09-01
files_modified:
  - frontend/src/app/[locale]/messages/page.tsx
  - frontend/src/app/[locale]/items/[id]/page.tsx
  - frontend/src/app/[locale]/borrow/page.tsx
  - frontend/src/components/layout/Navbar.tsx
autonomous: true
requirements:
  - CHAT-03
must_haves:
  truths:
    - "/messages page shows ConversationList + ChatWindow split view on desktop"
    - "Item detail page has 'Message Owner' button visible after borrow request, hidden for owner"
    - "Borrow page has chat icon on each request row"
    - "Navbar shows unread message count badge that updates in real-time"
  artifacts:
    - path: "frontend/src/app/[locale]/messages/page.tsx"
      provides: "Messages page with conversation list and chat window"
      contains: "MessagesPage"
    - path: "frontend/src/app/[locale]/items/[id]/page.tsx"
      provides: "Item detail page with Message Owner button"
      contains: "Message Owner"
    - path: "frontend/src/app/[locale]/borrow/page.tsx"
      provides: "Borrow page with chat icon"
      contains: "chat"
    - path: "frontend/src/components/layout/Navbar.tsx"
      provides: "Navbar with unread badge"
      contains: "unread"
  key_links:
    - from: "frontend/src/app/[locale]/messages/page.tsx"
      to: "frontend/src/components/chat/ConversationList.tsx"
      via: "renders ConversationList component"
      pattern: "import.*ConversationList"
    - from: "frontend/src/app/[locale]/messages/page.tsx"
      to: "frontend/src/components/chat/ChatWindow.tsx"
      via: "renders ChatWindow component"
      pattern: "import.*ChatWindow"
    - from: "frontend/src/components/layout/Navbar.tsx"
      to: "frontend/src/lib/chat.ts"
      via: "getUnreadCount API call"
      pattern: "import.*getUnreadCount"
---

<objective>
Integrate chat components into existing pages: create /messages page, add "Message Owner" button to item detail, add chat icon to borrow page, add unread badge to Navbar.

Purpose: Connects the chat UI components (09-03b) to the application's navigation and entry points. Users can now access chat from multiple locations and see real-time unread counts.

Output:
- /messages page with desktop split view and mobile navigation
- "Message Owner" button on item detail page (gated by D-01/D-02)
- Chat icon on borrow request rows (D-03)
- Navbar unread badge with real-time updates (D-15/D-16)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/09-in-app-chat/09-CONTEXT.md
@.planning/phases/09-in-app-chat/09-03a-PLAN.md
@.planning/phases/09-in-app-chat/09-03b-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create /messages page with split view</name>
  <files>
    frontend/src/app/[locale]/messages/page.tsx
  </files>
  <read_first>
    - frontend/src/components/chat/ConversationList.tsx (component props: onSelect, selectedItemId, selectedUserId)
    - frontend/src/components/chat/ChatWindow.tsx (component props: itemId, otherUserId, otherUserName, itemTitle, itemImageUrl, sendMessage)
    - frontend/src/lib/useChatSocket.ts (hook: userId, onMessage, onUnreadUpdate)
    - frontend/src/lib/auth.ts (getUser() for current userId)
    - frontend/src/app/[locale]/items/[id]/page.tsx (page pattern: "use client", useState, useEffect)
  </read_first>
  <action>
    Create **frontend/src/app/[locale]/messages/page.tsx**.

    - "use client" directive, default export function component
    - State: selectedItemId (number | null), selectedOtherUserId (number | null), selectedUserName (string), selectedItemTitle (string), selectedItemImageUrl (string | null)
    - Get current user from auth.ts getUser()
    - Initialize useChatSocket with userId, onMessage callback (append to active conversation if matches), onUnreadUpdate (refresh unread count)
    - Per D-10 responsive layout:
      - Desktop (md: breakpoint and up): flex row, ConversationList on left (w-80 or w-1/3), ChatWindow on right (flex-1)
      - Mobile: show ConversationList if no chat selected, show ChatWindow if chat selected (with onBack to deselect)
    - ConversationList onSelect: set selected state
    - ChatWindow receives selected state + sendMessage from useChatSocket
    - If no chat selected on desktop: show "Select a conversation" placeholder
    - Import and use useChatSocket for real-time message delivery
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Page compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - /messages/page.tsx is a "use client" default-exported function component
    - Page renders ConversationList and ChatWindow side by side on desktop (D-10)
    - Page shows ConversationList or ChatWindow on mobile based on selection (D-10)
    - Page uses useChatSocket for real-time messages (D-16)
    - Selecting a conversation from list updates ChatWindow
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    /messages page provides the main chat interface with desktop split view and mobile navigation.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add "Message Owner" button to item detail page</name>
  <files>
    frontend/src/app/[locale]/items/[id]/page.tsx
  </files>
  <read_first>
    - frontend/src/app/[locale]/items/[id]/page.tsx (current item detail page — find the right place to add button)
    - frontend/src/lib/auth.ts (getUser() for current user ID, to check if user is owner)
    - frontend/src/lib/api.ts (existing API calls — check if borrowRequests are already fetched)
    - frontend/src/types/index.ts (Item type has ownerId, user has id)
  </read_first>
  <action>
    Modify **frontend/src/app/[locale]/items/[id]/page.tsx** to add "Message Owner" button.

    - Add state: hasBorrowRequest (boolean), showChat (boolean)
    - In existing useEffect that fetches item data, also check if current user has a borrow request for this item (call GET /api/borrow/requests?itemId={id} or check existing borrowRequests data)
    - Per D-01: "Message Owner" button appears only after user has made a borrow request
    - Per D-02: button hidden when logged-in user IS the item owner (user.id === item.ownerId)
    - Per D-04: button visible for any authenticated user who has made a request
    - Button styling: emerald background, MessageSquare icon (from lucide-react if available, or text "💬 Message Owner")
    - Button click: set showChat=true, render ChatWindow component in a modal or inline section below the item details
    - If showChat is true: render ChatWindow with itemId, otherUserId=item.ownerId, otherUserName=item.ownerName, itemTitle=item.title, itemImageUrl
    - Use existing Modal component if available (frontend/src/components/ui/Modal.tsx) for the chat overlay
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Page compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - Item detail page has "Message Owner" button (or similar text/icon)
    - Button is hidden when current user IS the item owner (D-02)
    - Button is hidden when user has NOT made a borrow request (D-01)
    - Button is visible when user has made a borrow request and is not the owner (D-01)
    - Clicking button opens ChatWindow component (modal or inline)
    - ChatWindow receives correct itemId, otherUserId (owner), otherUserName, itemTitle
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    Item detail page shows "Message Owner" button for users with borrow requests, opening inline chat.
  </done>
</task>

<task type="auto">
  <name>Task 3: Add chat icon to borrow page request rows</name>
  <files>
    frontend/src/app/[locale]/borrow/page.tsx
  </files>
  <read_first>
    - frontend/src/app/[locale]/borrow/page.tsx (current borrow page — find request row rendering)
    - frontend/src/types/index.ts (BorrowRequest type)
  </read_first>
  <action>
    Modify **frontend/src/app/[locale]/borrow/page.tsx** to add chat icon on each borrow request row.

    - Per D-03: each borrow request row gets a chat icon/button
    - Find the existing borrow request row rendering (likely a map over requests)
    - Add a chat icon button (MessageSquare from lucide-react or 💬 emoji) on each row
    - Icon click: navigate to /messages?itemId={request.itemId}&userId={request.ownerId} OR open inline ChatWindow
    - Prefer navigation to /messages page with query params for simplicity
    - Style: small icon button, stone-300 hover:text-emerald-500 transition
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Page compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - Borrow page has chat icon/button on each borrow request row (D-03)
    - Chat icon click navigates to /messages or opens chat (D-03)
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    Borrow page has chat entry point on each request row.
  </done>
</task>

<task type="auto">
  <name>Task 4: Add unread message badge to Navbar</name>
  <files>
    frontend/src/components/layout/Navbar.tsx
  </files>
  <read_first>
    - frontend/src/components/layout/Navbar.tsx (current navbar — find right place for badge)
    - frontend/src/lib/chat.ts (getUnreadCount function)
    - frontend/src/lib/useChatSocket.ts (onUnreadUpdate callback for real-time updates)
  </read_first>
  <action>
    Modify **frontend/src/components/layout/Navbar.tsx** to add unread message badge.

    - Add state: unreadCount (number, default 0)
    - useEffect: fetch unread count via getUnreadCount() on mount
    - Per D-15: badge shows count of conversations with unread messages (not total messages)
    - Per D-16: badge updates in real-time — use useChatSocket hook or listen to a custom event
      - Option A: Navbar uses useChatSocket directly with onUnreadUpdate callback that re-fetches getUnreadCount()
      - Option B: Parent layout provides unread count via context/prop (simpler if Navbar can't use hooks directly)
      - Prefer Option A if Navbar is a client component (it likely is since it has mobile menu state)
    - Badge: small circle with number, emerald-500 background, white text, positioned near the messages/chat icon/link
    - If unreadCount is 0, hide the badge (show just the icon)
    - Add a link to /messages next to or as part of the badge
    - Per D-17: also consider adding badge on item cards in browse results (stretch goal — if time permits, otherwise defer)
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Navbar compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - Navbar has unread message count badge (D-15)
    - Badge shows count of conversations with unread messages (not total message count)
    - Badge is hidden when count is 0
    - Badge links to /messages page
    - Badge updates in real-time via WebSocket (D-16)
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    Navbar shows real-time unread message count badge linking to /messages page.
  </done>
</task>

</tasks>

<verification>
After this plan completes, verify:
1. npx tsc --noEmit succeeds in frontend directory
2. /messages page renders with split view
3. Item detail page has "Message Owner" button (gated correctly)
4. Borrow page has chat icon on request rows
5. Navbar has unread badge
</verification>

<success_criteria>
- /messages page shows ConversationList + ChatWindow split view on desktop (D-10)
- /messages page shows list or chat on mobile based on selection (D-10)
- Item detail page has "Message Owner" button visible after borrow request, hidden for owner (D-01, D-02)
- Borrow page has chat icon on each request row (D-03)
- Navbar shows unread message count badge (D-15)
- Badge updates in real-time (D-16)
- All modified files compile with npx tsc --noEmit
</success_criteria>

<output>
Create `.planning/phases/09-in-app-chat/09-03c-SUMMARY.md` when done
</output>
