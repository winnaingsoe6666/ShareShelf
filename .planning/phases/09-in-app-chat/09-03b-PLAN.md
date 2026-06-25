---
phase: 09-in-app-chat
plan: 03b
type: execute
wave: 2
depends_on:
  - 09-01
files_modified:
  - frontend/src/components/chat/ChatMessage.tsx
  - frontend/src/components/chat/ChatWindow.tsx
  - frontend/src/components/chat/ConversationList.tsx
autonomous: true
requirements:
  - CHAT-03
must_haves:
  truths:
    - "ChatMessage component renders bubble-style messages (sent=right emerald, received=left stone)"
    - "ChatWindow loads last 50 messages, has auto-growing textarea (max 2000 chars), send button"
    - "ChatWindow header shows item name + thumbnail clickable to /items/{id}"
    - "ConversationList shows flat list sorted by most recent, with unread blue dot + count"
    - "ConversationList empty state suggests items to discuss"
  artifacts:
    - path: "frontend/src/components/chat/ChatMessage.tsx"
      provides: "Single message bubble component"
      contains: "ChatMessage"
    - path: "frontend/src/components/chat/ChatWindow.tsx"
      provides: "Chat window with message thread and input"
      contains: "ChatWindow"
    - path: "frontend/src/components/chat/ConversationList.tsx"
      provides: "Conversation list for inbox"
      contains: "ConversationList"
  key_links:
    - from: "frontend/src/components/chat/ChatWindow.tsx"
      to: "frontend/src/lib/chat.ts"
      via: "getConversation, markAsRead API calls"
      pattern: "import.*from.*lib/chat"
    - from: "frontend/src/components/chat/ConversationList.tsx"
      to: "frontend/src/lib/chat.ts"
      via: "getConversations API call"
      pattern: "import.*from.*lib/chat"
---

<objective>
Build the three core chat UI components: ChatMessage (bubble), ChatWindow (thread + input), ConversationList (inbox).

Purpose: These are the visual building blocks that page integrations (09-03c) compose into the /messages page and item detail chat. Each component is self-contained with its own state management.

Output:
- ChatMessage.tsx — single message bubble with sent/received styling
- ChatWindow.tsx — message thread with infinite scroll, auto-growing textarea, send button
- ConversationList.tsx — conversation list with unread badges, empty state
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/09-in-app-chat/09-CONTEXT.md
@.planning/phases/09-in-app-chat/09-RESEARCH.md
@.planning/phases/09-in-app-chat/09-03a-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: ChatMessage bubble component</name>
  <files>
    frontend/src/components/chat/ChatMessage.tsx
  </files>
  <read_first>
    - frontend/src/components/ui/Button.tsx (component pattern: function component, props interface, Tailwind classes)
    - frontend/src/types/index.ts (ChatMessage interface: id, senderId, message, readAt, createdAt)
    - frontend/src/lib/auth.ts (getUser() to determine current userId for sent vs received)
  </read_first>
  <action>
    Create **frontend/src/components/chat/ChatMessage.tsx**.

    Props interface:
    ```typescript
    interface ChatMessageProps {
      message: ChatMessage;  // from @/types
      isOwn: boolean;        // true if senderId === current user
    }
    ```

    Implementation:
    - "use client" directive
    - Default export function component
    - Per D-11: bubble-style messages
      - isOwn=true: right-aligned, emerald-100 background, rounded-2xl rounded-br-sm
      - isOwn=false: left-aligned, stone-100 background, rounded-2xl rounded-bl-sm
    - Show message text in a max-w-[75%] bubble
    - Show timestamp below bubble in text-xs text-stone-400
    - If isOwn and message.readAt is not null, show "✓✓" read indicator in text-xs text-emerald-500
    - Use Tailwind CSS inline classes (no styled-components)
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Component compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - ChatMessage.tsx is a "use client" default-exported function component
    - ChatMessageProps interface has message: ChatMessage and isOwn: boolean
    - Own messages are right-aligned with emerald background
    - Other messages are left-aligned with stone background
    - Timestamp shown below each bubble in small text
    - Read indicator (✓✓) shown for own messages when readAt is not null
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    ChatMessage renders styled message bubbles distinguishing sent vs received.
  </done>
</task>

<task type="auto">
  <name>Task 2: ChatWindow with thread, input, and infinite scroll</name>
  <files>
    frontend/src/components/chat/ChatWindow.tsx
  </files>
  <read_first>
    - frontend/src/components/chat/ChatMessage.tsx (bubble component to render each message)
    - frontend/src/lib/chat.ts (getConversation, markAsRead functions)
    - frontend/src/lib/useChatSocket.ts (sendMessage from hook)
    - frontend/src/types/index.ts (ChatMessage, ConversationDetail interfaces)
    - frontend/src/components/ui/Button.tsx (button styling pattern)
    - frontend/src/components/ui/Input.tsx (input styling pattern)
  </read_first>
  <action>
    Create **frontend/src/components/chat/ChatWindow.tsx**.

    Props interface:
    ```typescript
    interface ChatWindowProps {
      itemId: number;
      otherUserId: number;
      otherUserName: string;
      itemTitle: string;
      itemImageUrl: string | null;
      onBack?: () => void;  // mobile: go back to conversation list
      sendMessage: (payload: { itemId: number; receiverId: number; message: string }) => void;
    }
    ```

    Implementation:
    - "use client" directive, default export function component
    - State: messages (ChatMessage[]), inputText (string), page (number), hasMore (boolean), isLoading (boolean)
    - useEffect: load initial conversation via getConversation(itemId, otherUserId, 0, 50), mark as read via markAsRead(itemId, otherUserId)
    - Per D-12: header shows item thumbnail (if itemImageUrl exists) + itemTitle as link to /items/{itemId}, optional back button for mobile
    - Per D-14: load last 50 messages initially, scroll up to load older (page+1)
    - Infinite scroll: detect scroll to top of message container, load next page, prepend to messages array
    - Per D-13: auto-growing textarea (use a ref, adjust height on input, max-height cap), 2000 char max, send button on right
    - Send handler: call sendMessage prop with { itemId, receiverId: otherUserId, message: inputText }, clear input
    - Optimistic UI: append sent message to local messages immediately
    - Ref for scroll container: scroll to bottom on new messages
    - Handle incoming messages via onMessageFromSocket prop or by re-fetching — prefer optimistic append
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Component compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - ChatWindow.tsx is a "use client" default-exported function component
    - ChatWindow loads messages via getConversation on mount
    - ChatWindow calls markAsRead when conversation is opened (D-18)
    - ChatWindow header shows item title as clickable link to /items/{itemId} (D-12)
    - ChatWindow renders ChatMessage bubbles in a scrollable container
    - ChatWindow has auto-growing textarea with 2000 char max (D-13)
    - ChatWindow has send button that calls sendMessage prop
    - ChatWindow supports infinite scroll up to load older messages (D-14)
    - ChatWindow scrolls to bottom on new messages
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    ChatWindow renders a full chat interface with message history, infinite scroll, and message input.
  </done>
</task>

<task type="auto">
  <name>Task 3: ConversationList with unread badges and empty state</name>
  <files>
    frontend/src/components/chat/ConversationList.tsx
  </files>
  <read_first>
    - frontend/src/lib/chat.ts (getConversations function)
    - frontend/src/types/index.ts (Conversation interface: itemId, itemTitle, itemImageUrl, otherUserName, lastMessage, lastMessageAt, unreadCount)
    - frontend/src/components/ui/Button.tsx (styling pattern)
  </read_first>
  <action>
    Create **frontend/src/components/chat/ConversationList.tsx**.

    Props interface:
    ```typescript
    interface ConversationListProps {
      onSelect: (itemId: number, otherUserId: number, otherUserName: string, itemTitle: string, itemImageUrl: string | null) => void;
      selectedItemId?: number;
      selectedUserId?: number;
    }
    ```

    Implementation:
    - "use client" directive, default export function component
    - State: conversations (Conversation[]), isLoading (boolean)
    - useEffect: load conversations via getConversations()
    - Per D-05: flat list layout, each row shows:
      - Item thumbnail (40x40 rounded, or placeholder if null)
      - Item title (text-sm font-medium, truncated)
      - Other user name (text-xs text-stone-500)
      - Last message preview (text-sm text-stone-400, truncated to 1 line)
      - Time ago (text-xs text-stone-400, relative format)
    - Per D-06: sorted by lastMessageAt DESC (backend returns sorted)
    - Per D-09: unread badge — blue dot + unreadCount number on the right side of each row
    - Per D-07: empty state — show "No conversations yet" with suggested items (can be simple text + link to /items)
    - Per D-08: container has overflow-y-auto for scrolling
    - Row click calls onSelect with conversation details
    - Selected row has bg-stone-100 highlight
    - Use Tailwind classes, follow existing component patterns
  </action>
  <verify>
    <automated>
      cd /home/wns/winnaingsoe6666/ShareShelf/frontend && npx tsc --noEmit 2>&1 | tail -5
    </automated>
    Component compiles without TypeScript errors.
  </verify>
  <acceptance_criteria>
    - ConversationList.tsx is a "use client" default-exported function component
    - ConversationList loads data via getConversations on mount
    - Each row shows item thumbnail, title, other user name, last message, time ago
    - Unread conversations show blue dot + count badge (D-09)
    - Rows sorted by most recent message (D-06)
    - Empty state shows "No conversations yet" message (D-07)
    - Row click calls onSelect with itemId, otherUserId, otherUserName, itemTitle, itemImageUrl
    - Selected row has visual highlight
    - npx tsc --noEmit exits with no errors
  </acceptance_criteria>
  <done>
    ConversationList shows all user conversations with unread badges and empty state.
  </done>
</task>

</tasks>

<verification>
After this plan completes, verify:
1. npx tsc --noEmit succeeds in frontend directory
2. ChatMessage renders styled bubbles with sent/received distinction
3. ChatWindow loads messages, has infinite scroll and auto-growing textarea
4. ConversationList shows conversations with unread badges
</verification>

<success_criteria>
- ChatMessage component renders bubble-style messages with sent/received styling
- ChatWindow loads last 50 messages, supports infinite scroll, has textarea with 2000 char max
- ChatWindow header shows clickable item title link
- ConversationList shows sorted conversations with unread badges
- ConversationList empty state shows helpful message
- All components compile with npx tsc --noEmit
</success_criteria>

<output>
Create `.planning/phases/09-in-app-chat/09-03b-SUMMARY.md` when done
</output>
