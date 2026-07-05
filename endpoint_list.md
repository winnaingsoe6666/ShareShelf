# ShareShelf — Endpoint List

> Generated 2026-07-06. Covers all REST + WebSocket endpoints across backend, frontend, and mobile.

---

## Auth — `/api/auth`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| POST | `/api/auth/register` | ✅ | ✅ | ✅ | Public | |
| POST | `/api/auth/login` | ✅ | ✅ | ✅ | Public | |
| POST | `/api/auth/logout` | ✅ | ✅ | ✅ | Auth | |
| POST | `/api/auth/refresh` | ✅ | ✅ | ✅ | Public | |
| GET | `/api/auth/me` | ✅ | ✅ | ✅ | Auth | |
| GET | `/api/auth/verify-email` | ✅ | ✅ | ✅ | Public | Query param `?token=` |

## Items — `/api/items`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/items` | ✅ | ✅ | ✅ | Public | Paginated, query params for search/filter |
| GET | `/api/items/{id}` | ✅ | ✅ | ✅ | Public | |
| POST | `/api/items` | ✅ | ✅ | ✅ | Auth | |
| PUT | `/api/items/{id}` | ✅ | ✅ | ✅ | Auth | Owner only |
| DELETE | `/api/items/{id}` | ✅ | ✅ | ✅ | Auth | Owner only |
| POST | `/api/items/{id}/images` | ✅ | ✅ | ✅ | Auth | Multipart upload |
| DELETE | `/api/items/{id}/images` | ✅ | ✅ | ✅ | Auth | Query param `?url=` |

## Borrow — `/api/borrow`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/borrow` | ✅ | ✅ | ✅ | Auth | Query param `?itemId=` |
| POST | `/api/borrow` | ✅ | ✅ | ✅ | Auth | |
| PUT | `/api/borrow/{id}/approve` | ✅ | ✅ | ✅ | Auth | Owner action |
| PUT | `/api/borrow/{id}/reject` | ✅ | ✅ | ✅ | Auth | Owner action |
| PUT | `/api/borrow/{id}/return` | ✅ | ✅ | ✅ | Auth | Borrower action |
| PUT | `/api/borrow/{id}/cancel` | ✅ | ✅ | ✅ | Auth | Borrower action |

## Review — `/api/review`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| POST | `/api/review` | ✅ | ✅ | ✅ | Auth | Was `/reviews` in frontend — fixed |
| GET | `/api/review/user/{userId}` | ✅ | ✅ | ✅ | Public | SecurityConfig permitAll |

## Chat — `/api/chat`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/chat/conversations` | ✅ | ✅ | ✅ | Auth | |
| GET | `/api/chat/conversations/{itemId}/{otherUserId}` | ✅ | ✅ | ✅ | Auth | Query params `?page=&size=` |
| POST | `/api/chat/conversations/{itemId}/{otherUserId}/read` | ✅ | ✅ | ✅ | Auth | |
| GET | `/api/chat/unread-count` | ✅ | ✅ | ✅ | Auth | |

## Notifications — `/api/notifications`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/notifications` | ✅ | ✅ | ✅ | Auth | Query params `?page=&size=` |
| GET | `/api/notifications/unread-count` | ✅ | ✅ | ✅ | Auth | |
| PUT | `/api/notifications/{id}/read` | ✅ | ✅ | ✅ | Auth | |
| PUT | `/api/notifications/read-all` | ✅ | ✅ | ✅ | Auth | |

## Categories — `/api/categories`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/categories` | ✅ | ✅ | ✅ | Public | |

## Community — `/api/community`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| GET | `/api/community/stats` | ✅ | ✅ | ✅ | Public | |

## Users — `/api/users`

| Method | Path | Backend | Frontend | Shared | Auth | Notes |
|--------|------|---------|----------|--------|------|-------|
| PUT | `/api/users/profile` | ✅ | ✅ | ✅ | Auth | |
| POST | `/api/users/avatar` | ✅ | ✅ | ✅ | Auth | Multipart upload |

## WebSocket — `/chat-ws`

| Type | Path | Backend | Frontend | Mobile | Notes |
|------|------|---------|----------|--------|-------|
| STOMP | `/chat-ws` | ✅ | ✅ | ✅ | Renamed from `/ws` to fix SockJS path collision |

## Other

| Method | Path | Backend | Notes |
|--------|------|---------|-------|
| GET | `/api/health` | ✅ | Liveness check, no auth |
| GET | `/api/dev/seed` | ✅ | Dev-only data seeder |

---

## Summary

- **35 REST endpoints** + **1 WebSocket** endpoint
- All endpoints match between backend, frontend, and shared package
- Security auth rules align with endpoint requirements
