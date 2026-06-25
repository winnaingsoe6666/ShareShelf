---
plan: 07-02
status: complete
completed_at: "2026-06-25T03:49:36Z"
phase: 07-google-oauth-signup
subsystem: auth
tags: [oauth, google, oauth2-client, service, spring-security]
requires: [OAUTH-01, OAUTH-02, OAUTH-03]
provides: [OAUTH-01, OAUTH-02, OAUTH-03]
affects:
  - backend/build.gradle.kts
  - backend/src/main/resources/application.yml
  - backend/src/main/resources/application-railway.yml
  - backend/src/main/kotlin/com/shareshelf/auth/OAuth2Service.kt
  - backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt
  - backend/src/test/kotlin/com/shareshelf/auth/OAuth2ServiceTest.kt
tech-stack:
  added:
    - "spring-boot-starter-oauth2-client (Spring Security OAuth2 client)"
  patterns:
    - "OAuth2 user processing with find/link/create pattern"
    - "Refresh token SHA-256 hashing (same as AuthService)"
key-files:
  created:
    - backend/src/main/kotlin/com/shareshelf/auth/OAuth2Service.kt
    - backend/src/test/kotlin/com/shareshelf/auth/OAuth2ServiceTest.kt
  modified:
    - backend/build.gradle.kts
    - backend/src/main/resources/application.yml
    - backend/src/main/resources/application-railway.yml
    - backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt
decisions:
  - "OAuth2Service replicates AuthService refresh token pattern (SHA-256 hash, UUID raw token)"
  - "googleId changed from val to var to support account linking"
  - "Empty name from Google falls back to email prefix"
metrics:
  duration: "~12 minutes"
  completed_date: "2026-06-25"
---

# Phase 07 Plan 02: OAuth2 Client & OAuth2Service Summary

**One-liner:** Added spring-boot-starter-oauth2-client dependency, configured Google OAuth2 client registration, and created OAuth2Service with find-by-googleId, link-by-email, and create-new-user logic.

## Summary

### What was built

OAuth2 client integration and user processing service:

| Component | Change | Purpose |
|-----------|--------|---------|
| build.gradle.kts | Added `spring-boot-starter-oauth2-client` | Spring Security OAuth2 filter chain integration |
| application.yml | Added Google OAuth2 client registration + frontend-url | Dev config reading from env vars with defaults |
| application-railway.yml | Added Google OAuth2 client registration + frontend-url | Production config reading from Railway env vars |
| OAuth2Service.kt | New service with `processOAuthUser()` and `generateOAuthResponse()` | Core OAuth user find/link/create logic |
| User.kt | Changed `googleId` from `val` to `var` | Allow account linking to set googleId |
| OAuth2ServiceTest.kt | 8 tests covering all OAuth2Service behavior | TDD verification |

### Key files created

| File | Lines | Purpose |
|------|-------|---------|
| `OAuth2Service.kt` | 82 | OAuth2 user processing with 3-case logic |
| `OAuth2ServiceTest.kt` | 269 | 8 tests for find/link/create and token generation |

### Must-have verification

- [x] spring-boot-starter-oauth2-client in build.gradle.kts
- [x] Google OAuth2 client registration in application.yml with GOOGLE_CLIENT_ID/SECRET
- [x] Google OAuth2 client registration in application-railway.yml with env vars
- [x] app.frontend-url property in both config files
- [x] OAuth2Service.processOAuthUser() finds user by googleId
- [x] OAuth2Service.processOAuthUser() auto-links LOCAL user by email
- [x] OAuth2Service.processOAuthUser() creates new Google-only user
- [x] New users have authProvider=GOOGLE, passwordHash=""
- [x] generateOAuthResponse returns AuthResponse with JWT + refresh token
- [x] `cd backend && ./gradlew compileKotlin` succeeds
- [x] All 8 OAuth2ServiceTest tests pass
- [x] Full test suite passes (no regressions)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Changed googleId from val to var**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** User.googleId was declared as `val` (immutable) in Plan 01, but OAuth2Service needs to set it during account linking
- **Fix:** Changed `val googleId: String? = null` to `var googleId: String? = null` in User.kt
- **Files modified:** backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt
- **Commit:** 2e3e915

## TDD Gate Compliance

RED commit: `ece8f51` - Failing tests for OAuth2Service (8 tests, compile error)
GREEN commit: `2e3e915` - Implementation that makes all tests pass

TDD cycle completed successfully. Tests were written first (RED), then implementation was added (GREEN). All 8 tests pass.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: auth_provider | OAuth2Service.kt | New service creates users with empty passwordHash for Google accounts. Must ensure password login guard (Plan 01) is effective. |

## Known Stubs

None. All methods are fully implemented with real logic.

## Self-Check: PASSED

- [x] OAuth2Service.kt exists at backend/src/main/kotlin/com/shareshelf/auth/OAuth2Service.kt
- [x] OAuth2ServiceTest.kt exists at backend/src/test/kotlin/com/shareshelf/auth/OAuth2ServiceTest.kt
- [x] 07-02-SUMMARY.md exists
- [x] Commit e05666f found (config changes)
- [x] Commit ece8f51 found (RED phase tests)
- [x] Commit 2e3e915 found (GREEN phase implementation)
- [x] oauth2-client dependency present in build.gradle.kts
- [x] GOOGLE_CLIENT_ID configured in application.yml
- [x] processOAuthUser method exists in OAuth2Service.kt
