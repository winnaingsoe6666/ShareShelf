# Backend: Implement logout endpoint, token invalidation, and refresh token mechanism

**Created**: 2026-06-17
**Assignee**: Backend Developer
**Priority**: High

## Context

The frontend now uses `sessionStorage` (not `localStorage`) for JWT token storage, which auto-clears when the browser tab closes — achieving "logout on tab close." However, this is a **client-side-only** solution and has gaps:

| Gap | Risk |
|---|---|
| 24-hour JWT expiry (`application.yml:32`) | Token remains valid long after tab close — if someone copies the token before closing, they can replay it for up to 24 hours |
| No logout endpoint | Users cannot actively revoke their token — no "Sign Out" button that invalidates the token server-side |
| No token blacklist | Even with a logout endpoint, there's nothing stopping a stolen token from being replayed |
| No refresh token | If we shorten the access token lifetime (e.g., 15 min), users would need to log in every 15 minutes without a refresh mechanism |

## Acceptance Criteria

### 1. `POST /api/auth/logout` endpoint
- Accept the current Bearer token
- Add the token's JTI (JWT ID) to a blacklist
- Return `200 OK` with `ApiResponse.success()`
- Should work even if the token is already expired (idempotent)

### 2. Token blacklist
- Maintain a set of revoked JWT IDs
- Check the blacklist in `JwtAuthenticationFilter` — reject blacklisted tokens with 401
- **Storage options** (pick one):
  - **Option A (simple)**: In-memory `ConcurrentHashMap` with a scheduled cleanup thread that evicts expired entries (JWT already has `exp` claim). Lost on restart — acceptable for MVP.
  - **Option B (robust)**: Redis-backed TTL set. Survives restarts. Use Railway's Redis add-on.
- Add a `JtiClaimBlacklist` service/component

### 3. JWT Token ID (JTI)
- Add a unique `jti` (JWT ID) claim to every token generated in `JwtTokenProvider.generateToken()`
- Use `UUID.randomUUID().toString()` for uniqueness
- Store the JTI in the token claims so the blacklist can key on it

### 4. Refresh token mechanism (stretch goal)
- Add a `refreshToken` field to the `POST /api/auth/login` response
- Add `POST /api/auth/refresh` endpoint that accepts a refresh token and returns a new access token
- Store refresh tokens in the `User` entity or a separate `RefreshToken` entity
- Refresh tokens should have a longer expiry (e.g., 7 days) and be single-use (rotate on each refresh)

## Files to Modify

| File | Change |
|---|---|
| `backend/.../auth/JwtTokenProvider.kt` | Add `jti` claim to `generateToken()` |
| `backend/.../auth/JwtAuthenticationFilter.kt` | Check JTI blacklist before accepting token |
| `backend/.../config/SecurityConfig.kt` | Ensure `/api/auth/logout` requires authentication |
| `backend/.../auth/AuthController.kt` | Add `logout()` endpoint |
| `backend/.../auth/AuthService.kt` | Add `logout(token)` method |
| **NEW** `backend/.../auth/JtiBlacklist.kt` | In-memory or Redis-backed JTI blacklist |

## Related

- Frontend: switched `localStorage` → `sessionStorage` in `auth.ts` and `api.ts` (commit in same PR)
- JWT expiry currently set to `86400000` (24 hours) in `application.yml:32`
