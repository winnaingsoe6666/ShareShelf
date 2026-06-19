# Phase 5: Community Features — Implementation Plan

> Three community-facing features: in-app notifications, community dashboard, and enhanced search.
> **Goal:** Real-time borrow status notifications, community activity visibility, and richer item discovery.

---

## Overview

| Req | Feature | Backend Work | Frontend Work |
|-----|---------|-------------|---------------|
| COMM-01 | In-app notifications | New entity, service, controller, DB migration | Notification bell in Navbar, dropdown |
| COMM-02 | Community dashboard | New stats endpoint | New `/community` page |
| COMM-03 | Enhanced search | Add `minRating` query param | Status + rating filter UI on browse page |

---

## Current State

### What Already Exists (relevant to Phase 5)

| Area | State |
|------|-------|
| Backend search API | `GET /api/items?search=&categoryId=&status=` — status filter works server-side, not exposed in frontend UI |
| ItemController.listItems | Accepts `search`, `categoryId`, `status` params |
| ItemRepository.search | JPQL query with all three filters |
| Borrow statuses | `pending → approved → rejected → returned → cancelled` — clear state transitions |
| Frontend browse page | Client-side filtering only (no server-side status/rating filters) |
| Homepage stats | Hardcoded animated counters (1250, 840, 3200) |
| No notification system | Nothing exists — no table, entity, or UI |

### Key Gaps

1. No notification mechanism when borrow status changes
2. No community-level view showing real activity data
3. Search only filters by text + category — missing status (available/borrowed) and owner trust score filters
4. Homepage stats are fake/hardcoded numbers

---

## Sub-Plan 1: COMM-01 — In-App Notifications

### 1a. Database Migration (V10)

**File:** `backend/src/main/resources/db/migration/V10__create_notifications.sql`

```sql
CREATE TABLE notifications (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type            VARCHAR(30)  NOT NULL CHECK (type IN (
                        'borrow_requested', 'borrow_approved', 'borrow_rejected',
                        'borrow_returned', 'review_received'
                    )),
    message         TEXT         NOT NULL,
    related_item_id   BIGINT     REFERENCES items (id) ON DELETE SET NULL,
    related_borrow_id BIGINT     REFERENCES borrow_requests (id) ON DELETE SET NULL,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id) WHERE NOT is_read;
```

### 1b. Backend Entity & Repository

**New files:**
- `backend/src/main/kotlin/com/shareshelf/notification/entity/Notification.kt`
  - Entity with: `id`, `userId`, `type` (enum `NotificationType`), `message`, `relatedItemId`, `relatedBorrowId`, `isRead`, `createdAt`
  - Follows existing entity patterns (`data class`, `@PrePersist`, createdAt auto-set)

- `backend/src/main/kotlin/com/shareshelf/notification/NotificationRepository.kt`
  - `findByUserIdOrderByCreatedAtDesc(userId, pageable): Page<Notification>`
  - `countByUserIdAndIsReadFalse(userId): Long`

### 1c. Backend Service

**New file:** `backend/src/main/kotlin/com/shareshelf/notification/NotificationService.kt`

Methods:
- `create(userId, type, message, itemId?, borrowId?)` — creates and saves notification
- `findByUser(userId, pageable)` — paginated list for current user
- `markRead(notificationId, userId)` — mark single as read (validates ownership)
- `markAllRead(userId)` — mark all as read for user
- `getUnreadCount(userId)` — count of unread notifications

### 1d. Integration into BorrowService

Modify `BorrowService.kt` to inject `NotificationService` and fire notifications on status transitions:

| Action | Notification To | Type | Message |
|--------|----------------|------|---------|
| `create()` | Owner | `borrow_requested` | "{borrowerName} wants to borrow {itemTitle}" |
| `approve()` | Borrower | `borrow_approved` | "{ownerName} approved your request for {itemTitle}" |
| `reject()` | Borrower | `borrow_rejected` | "{ownerName} declined your request for {itemTitle}" |
| `markReturned()` | Borrower | `borrow_returned` | "{ownerName} marked {itemTitle} as returned" |

Also integrate into `ReviewService.create()` to fire `review_received` notification to the reviewee.

### 1e. Backend Controller

**New file:** `backend/src/main/kotlin/com/shareshelf/notification/NotificationController.kt`

Endpoints:
- `GET /api/notifications` — list current user's notifications (paginated)
- `GET /api/notifications/unread-count` — unread count
- `PUT /api/notifications/{id}/read` — mark one as read
- `PUT /api/notifications/read-all` — mark all as read

### 1f. Backend DTOs

**New file:** `backend/src/main/kotlin/com/shareshelf/notification/dto/NotificationDtos.kt`
- `NotificationResponse` — id, type, message, relatedItemId, relatedBorrowId, isRead, createdAt
- No request DTOs needed (notifications are system-generated)

### 1g. Frontend Types

Add to `frontend/src/types/index.ts`:
```ts
export type NotificationType = "borrow_requested" | "borrow_approved" | "borrow_rejected" | "borrow_returned" | "review_received";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  relatedItemId?: number;
  relatedBorrowId?: number;
  isRead: boolean;
  createdAt: string;
}
```

### 1h. Frontend — Navbar Notification Bell

Modify `frontend/src/components/layout/Navbar.tsx`:
- Add `Bell` icon from lucide-react with unread count badge
- Poll `GET /api/notifications/unread-count` on mount and periodically (every 30s)
- Click opens a dropdown panel showing recent 5 notifications
- Each notification is clickable: navigates to relevant page
  - `borrow_requested/approved/rejected/returned` → `/borrow` (filtered to relevant tab)
  - `review_received` → `/profile`
- "Mark all read" button in dropdown
- Unread notifications have a subtle purple left border or dot indicator
- Empty state: "No notifications" with Bell icon

### 1i. Backend Tests

**New file:** `backend/src/test/kotlin/com/shareshelf/notification/NotificationServiceTest.kt`
- Test create notification
- Test findByUser returns only user's notifications
- Test markRead validates ownership
- Test markAllRead
- Test unread count

**Modify:** `backend/src/test/kotlin/com/shareshelf/borrow/BorrowServiceTest.kt`
- Add verification that notificationService.create() is called on approve/reject/return
- No new mocks needed for existing tests — just add `notificationService = mockk(relaxed = true)` to existing setup

### 1j. Frontend Tests

**Modify:** `frontend/src/components/layout/__tests__/Navbar.test.tsx`
- Test notification bell renders when logged in
- Test unread count badge displays correct number
- Test bell not shown when logged out
- Test click opens dropdown

---

## Sub-Plan 2: COMM-02 — Community Dashboard

### 2a. Backend Stats Endpoint

**New file:** `backend/src/main/kotlin/com/shareshelf/community/CommunityController.kt`

Single endpoint: `GET /api/community/stats`

Returns:
```json
{
  "totalItems": 42,
  "totalMembers": 156,
  "activeBorrows": 18,
  "recentItems": [ /* top 5 newest available items as ItemResponse */ ],
  "topLenders": [
    { "userId": 1, "name": "Alice", "itemCount": 12, "trustScore": 4.8 },
    ...
  ]
}
```

Implementation:
- `totalItems` — `itemRepository.count()`
- `totalMembers` — `userRepository.count()` (enabled users only)
- `activeBorrows` — `borrowRepository.countByStatus(BorrowStatus.approved)` (need to add this query)
- `recentItems` — `itemRepository.findTop5ByStatusOrderByCreatedAtDesc(ItemStatus.available)` (need to add)
- `topLenders` — use `itemRepository` to group by owner, count items, join with user trust score (or use a `@Query`)

**New DTO:** `backend/src/main/kotlin/com/shareshelf/community/dto/CommunityStatsResponse.kt`
- `data class CommunityStatsResponse(totalItems, totalMembers, activeBorrows, recentItems, topLenders)`
- `data class TopLenderResponse(userId, name, itemCount, trustScore)`

**New repository queries needed:**
- `BorrowRepository.countByStatus(status)` 
- `ItemRepository.findTop5ByStatusOrderByCreatedAtDesc(status)`
- `ItemRepository` — query to get top lenders: group by ownerId, count items, order by count DESC, limit 5

### 2b. Frontend — Community Page

**New file:** `frontend/src/app/community/page.tsx`

Page structure:
- **Hero banner** — "Community Dashboard" heading with subtitle
- **Stats row** — 3 animated cards (Total Items, Members, Active Borrows) using real data with `AnimatedCounter`
- **Recent Items** — Grid of the 5 newest available items using `ItemCard` (reuse existing component)
- **Top Lenders** — Leaderboard-style list with rank, avatar initial, name, item count, trust stars
- **Quick Links** — "Browse All Tools" and "Share a Tool" CTAs

### 2c. Frontend — Navbar Link

Add "Community" link to Navbar (between "Browse" and "Add Item"):
- Desktop: `<Link href="/community" className={navLinkClass("/community")}>Community</Link>`
- Mobile: same link in mobile menu

### 2d. Frontend — Homepage Stats Update

Modify `frontend/src/app/page.tsx`:
- Fetch real stats from `/api/community/stats` on mount
- Replace hardcoded `value={1250}`, `value={840}`, `value={3200}` with real values
- Fallback to hardcoded values if API fails (graceful degradation)

### 2e. Backend Tests

**New file:** `backend/src/test/kotlin/com/shareshelf/community/CommunityControllerTest.kt`
- Test stats endpoint returns correct structure
- Test with empty database
- Test with mock data

### 2f. Frontend Tests

**New file:** `frontend/src/app/community/__tests__/page.test.tsx`
- Test stats cards render
- Test recent items render
- Test top lenders render
- Test loading state
- Test error state

---

## Sub-Plan 3: COMM-03 — Enhanced Search

### 3a. Backend — Add minRating Filter

**Modify:** `backend/src/main/kotlin/com/shareshelf/item/ItemRepository.kt`
- Update search query to join with User (owner) and filter by `owner.trustScore >= :minRating`
- Add `@Param("minRating") minRating: Double?` parameter
- Filter is applied when `minRating` is non-null

**Modify:** `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt`
- `findAll()` signature: add `minRating: Double? = null` parameter
- Pass through to repository

**Modify:** `backend/src/main/kotlin/com/shareshelf/item/ItemController.kt`
- `listItems()`: add `@RequestParam(required = false) minRating: Double?` parameter
- Pass through to service

### 3b. Frontend — Status & Rating Filters

**Modify:** `frontend/src/app/items/page.tsx`

Add filter chips/buttons below the category chips:
- **Status filter** — Three toggle buttons: "All", "Available", "Borrowed" (using `ItemStatus` type)
- **Rating filter** — Stars dropdown: "Any Rating", "4+ Stars", "3+ Stars", "2+ Stars"
- Filters are passed as query params to the API (server-side filtering)
- Remove client-side `.filter()` — replace with API call with params on every filter change

Implementation details:
- Add `statusFilter` state: `"" | "available" | "borrowed"`
- Add `minRating` state: `number | null`
- Update `useEffect` to call API with params: `api.get("/items", { params: { search, categoryId, status: statusFilter || undefined, minRating } })`
- Debounce search input (300ms) to avoid excessive API calls
- Category filter: convert from client-side name matching to `categoryId` based API call

### 3c. Frontend Tests

**Modify:** `frontend/src/app/items/__tests__/page.test.tsx` (if exists)
Or create new tests:
- Test status filter buttons render
- Test rating filter renders
- Test API called with correct params on filter change

### 3d. Backend Tests

**Modify:** `backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt`
- Test findAll with minRating filter
- Test search query includes trust score filter

---

## Files to Create

```
backend/
├── src/main/kotlin/com/shareshelf/notification/
│   ├── entity/Notification.kt
│   ├── NotificationRepository.kt
│   ├── NotificationService.kt
│   ├── NotificationController.kt
│   └── dto/NotificationDtos.kt
├── src/main/kotlin/com/shareshelf/community/
│   ├── CommunityController.kt
│   └── dto/CommunityStatsResponse.kt
├── src/main/resources/db/migration/V10__create_notifications.sql
└── src/test/kotlin/com/shareshelf/
    ├── notification/NotificationServiceTest.kt
    └── community/CommunityControllerTest.kt

frontend/
├── src/app/community/
│   ├── page.tsx
│   └── __tests__/page.test.tsx
```

## Files to Modify

```
backend/
├── src/main/kotlin/com/shareshelf/borrow/BorrowService.kt     — inject NotificationService, fire events
├── src/main/kotlin/com/shareshelf/review/ReviewService.kt     — fire review_received notification
├── src/main/kotlin/com/shareshelf/item/ItemRepository.kt      — add minRating filter
├── src/main/kotlin/com/shareshelf/item/ItemService.kt         — add minRating param
├── src/main/kotlin/com/shareshelf/item/ItemController.kt      — add minRating query param
├── src/main/kotlin/com/shareshelf/borrow/BorrowRepository.kt  — add countByStatus
├── src/test/kotlin/com/shareshelf/borrow/BorrowServiceTest.kt — add notification mock
└── src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt     — add minRating tests

frontend/
├── src/app/items/page.tsx                                     — server-side filtering
├── src/app/page.tsx                                           — real stats from API
├── src/components/layout/Navbar.tsx                           — notification bell + community link
├── src/components/layout/__tests__/Navbar.test.tsx            — notification tests
└── src/types/index.ts                                         — Notification type
```

---

## Dependencies Between Sub-Plans

```
COMM-01 (Notifications) ── independent ──┐
COMM-02 (Dashboard)     ── independent ──┤── All three can run in parallel
COMM-03 (Search)        ── independent ──┘
```

No sub-plan depends on another. COMM-01 touches BorrowService/ReviewService, COMM-02 adds a new endpoint, and COMM-03 extends the existing items search.

---

## Execution Order

Recommended sequential order (simpler, avoids merge conflicts):
1. **COMM-01** — Notifications (biggest piece, touches borrow service)
2. **COMM-02** — Community dashboard (new endpoint + page, no conflicts)
3. **COMM-03** — Enhanced search (lightweight, extends existing)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Notification table migration conflicts with existing schema | Use V10 naming, validate with `ddl-auto: validate` |
| BorrowService tests break when NotificationService is injected | Use `mockk(relaxed = true)` so existing tests don't need changes |
| N+1 queries in community stats endpoint | Use `@Query` with JOINs or aggregate queries; keep to max 3 queries |
| Frontend browse page filter changes break existing tests | Update tests to mock API calls with params instead of client-side filter logic |
| Notification bell polling adds API load | Poll every 30s only when tab is visible; use `document.visibilitychange` |
| Navbar notification dropdown UX on mobile | Use a simple overlay/dropdown; same pattern as mobile menu |

---

## What This Does NOT Cover

- **Email notifications** — v2 requirement (NOTF-01), not in scope
- **Push notifications** — v2 requirement (NOTF-02), not in scope
- **Real-time WebSocket notifications** — polling approach is sufficient for v1
- **Notification preferences** (opt-out of certain types) — future enhancement
- **Community search by distance/location** — requires geocoding infrastructure; deferred
- **Admin dashboard** — v2 requirement (ADMN-01), not in scope
