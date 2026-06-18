---
plan: 01-04
status: complete
completed_at: "2026-06-18T11:31:30+07:00"
---

## Summary

**Plan:** 01-04 — Fix JWT Filter Exception Handling & Safe Null Handling (FIX-04, FIX-09)  
**Commit:** `0db4166 fix(01-04): wrap JWT filter in try-catch + replace !! with safe null handling`

### What was built

**FIX-04: JWT Filter Exception Safety**

`JwtAuthenticationFilter.doFilterInternal()` now wraps authentication logic in `try-catch`. On any exception:
- SecurityContext is cleared
- Error is logged
- `filterChain.doFilter()` is ALWAYS called (prevents broken filter chain)

Previously, exceptions like `UsernameNotFoundException` or `MalformedJwtException` would propagate up and break the filter chain, returning 500 errors instead of 401.

**FIX-09: Safe Null Handling for Entity IDs**

Replaced all 10 `!!` usages on `user.id` (nullable Long?) with `?: throw IllegalStateException("descriptive message")`:
- `AuthService.kt`: 9 locations — register, login, refresh token, getCurrentUser, toAuthResponse, generateToken helper calls
- `CustomUserDetailsService.kt`: 1 location — `UserPrincipal.getId`

**New tests added:**

| File | Tests | Purpose |
|------|-------|---------|
| `JwtAuthenticationFilterTest.kt` | 10+ | Filter continues chain on `UsernameNotFoundException`, `MalformedJwtException`; valid tokens set SecurityContext; missing/invalid Authorization headers return 401 |
| `CustomUserDetailsServiceTest.kt` | 5+ | loadUserByUsername (found/not found), loadUserById (found/not found), UserPrincipal field mapping |

### Key files modified

| File | Changes | Purpose |
|------|---------|---------|
| `JwtAuthenticationFilter.kt` | 37 lines changed | try-catch wrapping, safe filter chain continuation |
| `AuthService.kt` | 38 lines changed | 9 `!!` → `?: throw IllegalStateException(...)` with descriptive messages |
| `CustomUserDetailsService.kt` | 2 lines changed | 1 `!!` → safe null handling in UserPrincipal.getId |

### Key files created

| File | Lines | Purpose |
|------|-------|---------|
| `JwtAuthenticationFilterTest.kt` | 49 | Filter exception handling tests |
| `CustomUserDetailsServiceTest.kt` | 39 | UserDetailsService and UserPrincipal tests |

### Must-have verification

- [x] `JwtAuthenticationFilter` catches all exceptions and always calls `filterChain.doFilter()` — `try` block at line 33, always reaches `filterChain.doFilter()` at method end
- [x] `AuthService` and `CustomUserDetailsService` use safe null handling — **0 `!!` occurrences on `user.id`** (verified via grep)
- [x] All existing backend tests still pass after fixes — **BUILD SUCCESSFUL**

### Notable deviations

None.

### Self-Check: PASSED
