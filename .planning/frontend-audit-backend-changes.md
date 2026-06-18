# Frontend Audit — Backend API Changes Impact

**Date:** 2026-06-17
**Trigger:** Backend refactoring (borrow lifecycle, enums, pagination, auth exceptions, JTI persistence, rate limiting, account lockout)
**Audited by:** frontend-developer agent
**Scope:** 24 source files read across `frontend/src/`

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 3 | App breaks at runtime — pagination response shape changed |
| HIGH | 2 | Refresh token silently discarded |
| MEDIUM | 2 | Password policy UX + login error handling |
| LOW | 3 | Type gaps + pagination UX awareness |
| Pre-existing bugs | 3 | Discovered during audit, unrelated to backend changes |

---

## CRITICAL (3) — App will break at runtime

### 1. `frontend/src/app/items/page.tsx` — line 24

**Problem:** `GET /api/items` now returns `ApiResponse<Page<ItemResponse>>`. The Spring `Page` object has shape `{ content: [...], totalElements, totalPages, number, size, ... }`. The code does:
```typescript
setItems(itemsRes.data.data ?? [])
```
`itemsRes.data.data` is a Page object (truthy), not an array. The subsequent `.filter()` on line 30 will fail because a plain object has no `.filter()` method.

**Fix:** `itemsRes.data.data?.content ?? []`

### 2. `frontend/src/app/profile/page.tsx` — line 29

**Problem:** Identical pagination issue for the items fetch on the profile page.
```typescript
setItems((itemsRes.data.data ?? []).filter((i: Item) => i.ownerId === user?.id));
```
`itemsRes.data.data` is a Page object, not an array, so `.filter()` will throw.

**Fix:** `(itemsRes.data.data?.content ?? []).filter(...)`

### 3. `frontend/src/app/borrow/page.tsx` — line 35

**Problem:** `GET /api/borrow` now returns `ApiResponse<Page<BorrowResponse>>` — same Page shape.
```typescript
setRequests(res.data.data ?? [])
```
The `.filter()` on line 59 will fail because `res.data.data` is the Page object, not an array.

**Fix:** `res.data.data?.content ?? []`

---

## HIGH (2) — Refresh token is silently discarded

### 4. `frontend/src/types/index.ts` — lines 64-72 (AuthResponse interface)

**Problem:** The `AuthResponse` interface is missing the new `refreshToken` field. The backend `AuthResponse` DTO now includes `refreshToken: String` alongside `token`. Without this field in the TypeScript type, the refresh token lands in the response but is never captured.

**Fix:** Add `refreshToken: string;` to the `AuthResponse` interface.

### 5. `frontend/src/lib/auth.ts` — lines 9-18 (saveAuth)

**Problem:** `saveAuth()` does not persist `auth.refreshToken`. Even after fixing the type, the function only stores the access `token` and user fields in sessionStorage. The backend returns a refresh token, but it is discarded. When the access token expires, the user is abruptly logged out instead of the refresh flow running.

**Fix:**
- Store `auth.refreshToken` in sessionStorage (e.g., `shareshelf_refresh_token` key)
- Add a `getRefreshToken()` exported helper
- Extend the Axios interceptor in `api.ts` to attempt a refresh when a 401 is received, before redirecting to `/login`

---

## MEDIUM (2) — Degraded user experience

### 6. `frontend/src/app/register/page.tsx` — password requirements

**Problem:** Backend password policy now requires minimum 8 characters, at least 1 uppercase letter, and at least 1 digit. The registration form has no client-side validation and no visible hint text about these requirements. Users only discover the rules after a failed submission.

**Fix:** Add a password hint below the password input (e.g., "Must be at least 8 characters with one uppercase letter and one digit"), and optionally add client-side validation that checks these rules before submission.

### 7. `frontend/src/app/login/page.tsx` — line 31 error handling

**Problem:** The catch block hardcodes `"Invalid email or password"` for all errors. Two new error scenarios exist:
- **429 Too Many Requests** (10 req/min rate limit on auth endpoints): user sees misleading "Invalid email or password" instead of a wait instruction.
- **401 account locked** (after 5 failed attempts, 30-minute lock): the Axios response interceptor clears auth and redirects before the login page's catch block can read the error message.

**Fix:** Update the catch block to inspect `err.response?.status`:
- 429: show "Too many attempts. Please wait and try again."
- 401: extract `err.response?.data?.message` to show the account-locked reason

---

## LOW (3) — Cosmetic or forward-looking

### 8. `frontend/src/types/index.ts` — Review interface

**Problem:** The `Review` interface is missing the `revieweeName: string` field that the backend `ReviewResponse` DTO now includes. Not currently rendered in the profile page, but should exist in the type for completeness.

**Fix:** Add `revieweeName: string;` to the `Review` interface.

### 9-11. Pagination awareness (items, borrow, profile pages)

The browse, borrow, and profile pages fetch data once without pagination params. With backend pagination (`size=20` default), users only see the first 20 records. Items/borrows beyond page 0 are invisible. Recommend adding pagination controls or infinite scroll as a follow-up task, but the CRITICAL `.content` unwrap must be done first.

---

## Pre-existing Bugs (Unrelated to Backend Changes)

### A. `frontend/src/app/borrow/page.tsx` — lines 59-61 — Tab filter broken

```typescript
const filtered = tab === "borrowed"
  ? requests.filter((r) => r.borrowerId)
  : requests.filter((r) => r.ownerId);
```
`borrowerId` and `ownerId` are both always non-zero integers (entity IDs), so both are always truthy. Both tabs show ALL requests. Should compare against the current user's ID from `getUser()`:
```typescript
? requests.filter((r) => r.borrowerId === user?.id)
: requests.filter((r) => r.ownerId === user?.id)
```

### B. `frontend/src/app/items/[id]/page.tsx` — line 30 — Fragile fallback

```typescript
api.get(`/items/${id}`).then((res) => setItem(res.data.data ?? res.data))
```
The backend always wraps in `ApiResponse`, so `res.data.data` is always present on success. The fallback to `res.data` will never trigger correctly. If the response were ever unwrapped at a different level, this would silently return the ApiResponse wrapper object instead of the item.

**Fix:** Remove the fallback: `res.data.data`.

### C. `frontend/src/app/items/new/page.tsx` — lines 85-86 — Hardcoded categories

The category dropdown has hardcoded category names and IDs (`["Tools", "Electronics", ...]` with indices 1-6). The backend seeds categories via Flyway migrations (V4). If the migration IDs differ from 1-6 or category names change, this dropdown sends the wrong `categoryId`.

**Fix:** Fetch categories from `GET /api/categories` and populate the dropdown dynamically, matching what the browse page already does.

---

## Files NOT Requiring Changes

These files were reviewed and are compatible with the new backend:

- `app/layout.tsx` — no API calls
- `app/page.tsx` — no API calls
- `app/globals.css` — styles only
- `components/layout/Navbar.tsx` — no API calls; auth check uses sessionStorage helpers which remain compatible
- `components/layout/Footer.tsx` — no API calls
- `components/items/ItemCard.tsx` — receives typed props, no API calls
- `components/items/ItemGrid.tsx` — receives typed props, no API calls
- `components/ui/Badge.tsx` — pure presentational
- `components/ui/Button.tsx` — pure presentational
- `components/ui/Card.tsx` — pure presentational
- `components/ui/Input.tsx` — pure presentational
- `components/ui/Modal.tsx` — pure presentational
- `components/ui/Spinner.tsx` — pure presentational
- `lib/utils.ts` — pure utility functions
- `lib/api.ts` — interceptor logic is compatible (but should be extended to handle refresh tokens as a HIGH follow-up)
- `app/items/[id]/page.tsx` — `GET /api/items/{id}` still returns `ApiResponse<ItemResponse>`, compatible (minor code-quality note in pre-existing bug B)
- `app/items/new/page.tsx` — `POST /api/items` still returns `ApiResponse<ItemResponse>`, compatible (but hardcoded categories noted in pre-existing bug C)

---

## Action Plan

| Order | Severity | File(s) | Description |
|-------|----------|---------|-------------|
| 1 | CRITICAL | `app/items/page.tsx`, `app/profile/page.tsx`, `app/borrow/page.tsx` | Unwrap `.data.data.content` for paginated responses |
| 2 | HIGH | `types/index.ts`, `lib/auth.ts` | Add `refreshToken` field and persistence |
| 3 | MEDIUM | `app/register/page.tsx` | Add password requirement hint |
| 4 | MEDIUM | `app/login/page.tsx` | Handle 429 rate limit + account locked messages |
| 5 | BUG | `app/borrow/page.tsx` | Fix tab filter (compare to user ID) |
| 6 | BUG | `app/items/new/page.tsx` | Fetch categories from API instead of hardcoding |
| 7 | LOW | `app/items/[id]/page.tsx` | Remove fragile fallback |
| 8 | LOW | `types/index.ts` | Add `revieweeName` to `Review` interface |
