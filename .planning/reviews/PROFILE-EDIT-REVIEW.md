---
status: review
feature: profile-edit
depth: deep
files_reviewed: 18
backend_files:
  - backend/src/main/kotlin/com/shareshelf/user/UserController.kt
  - backend/src/main/kotlin/com/shareshelf/user/UserService.kt
  - backend/src/main/kotlin/com/shareshelf/user/dto/UpdateProfileRequest.kt
  - backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt
  - backend/src/main/kotlin/com/shareshelf/auth/entity/UserRepository.kt
  - backend/src/main/kotlin/com/shareshelf/auth/dto/AuthDtos.kt
  - backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt
  - backend/src/main/kotlin/com/shareshelf/config/RateLimitFilter.kt
  - backend/src/main/kotlin/com/shareshelf/storage/FileStorageService.kt
  - backend/src/main/resources/application.yml
frontend_files:
  - frontend/src/app/[locale]/profile/page.tsx
  - frontend/src/app/[locale]/profile/edit/page.tsx
  - frontend/src/lib/auth.ts
  - frontend/src/lib/api.ts
mobile_files:
  - mobile/app/profile/edit.tsx
  - mobile/app/(tabs)/profile.tsx
shared_files:
  - packages/shared/src/types/index.ts
  - packages/shared/src/api/endpoints.ts
  - packages/shared/src/auth/session.ts
findings:
  critical: 2
  warning: 11
  info: 7
  total: 20
  fixed: 12
  skipped: 1
status: review-fixed
---

# Profile Edit Feature — Code Review Report

**Date:** 2026-07-05
**Scope:** Full-stack profile edit feature (backend, frontend, mobile, shared types, config)

---

## Critical Findings

### CR-01: Avatar Upload — No MIME Type Validation at Controller Level
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserController.kt:30-41`
- **Severity:** Critical (Security)
- **Status:** ✅ FIXED
- **Scenario:** User uploads a file with `.jpg` extension but actual content is an executable. The `FileStorageService` checks the extension but not the actual content type. The controller only checks `file.isEmpty`.
- **Impact:** Potential storage of malicious files in R2/S3 bucket. If public URLs are served, users could be exposed to drive-by downloads.
- **Fix:** Add MIME type validation in `FileStorageService.store()`:
  ```kotlin
  val contentType = file.contentType?.lowercase() ?: ""
  if (contentType !in setOf("image/jpeg", "image/png", "image/gif", "image/webp")) {
      throw IllegalArgumentException("Unsupported content type: $contentType")
  }
  ```

### CR-02: Profile Update Cannot Clear Fields
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserService.kt:24-33`
- **Severity:** Critical (Data Integrity)
- **Status:** ✅ FIXED
- **Scenario:** User wants to remove their bio or phone number. They clear the field and submit, but `request.bio?.let { user.bio = it }` only updates if `bio` is non-null. Sending `null` means "don't update."
- **Impact:** Users cannot clear optional profile fields once set. This creates "stuck" data that users can't remove.
- **Fix:** Changed `?.let` pattern to direct assignment. Now sending `null` clears the field.

---

## Warning Findings

### WR-01: Silent Exception Swallowing on Avatar Deletion
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserService.kt:46-49`
- **Severity:** Warning (Reliability)
- **Status:** ✅ FIXED
- **Scenario:** Old avatar deletion fails due to permission issues, network errors, or storage misconfiguration. The exception is silently caught.
- **Impact:** Orphaned files accumulate in storage. Critical errors (e.g., misconfigured R2 credentials) go unnoticed.
- **Fix:** Added SLF4J logger and log warning on avatar deletion failure.

### WR-02: Trust Score Recalculation on Every Profile Update
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserService.kt:36,55`
- **Severity:** Warning (Performance)
- **Status:** ✅ FIXED
- **Scenario:** `reviewService.updateTrustScore(userId)` runs on every profile save and avatar upload. If trust score calculation queries multiple tables (reviews, items), this adds latency.
- **Impact:** Profile save takes longer than necessary. Trust score changes are rare (only on review creation), so recalculating on profile edit is wasteful.
- **Fix:** Removed `reviewService.updateTrustScore(userId)` from both methods. Trust score is recalculated when reviews are created/deleted.

### WR-03: Empty Token Fields in Profile Update Response
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserController.kt:46-47`
- **Severity:** Warning (API Design)
- **Status:** ⏭️ SKIPPED (requires cross-layer DTO changes)
- **Scenario:** `toAuthResponse()` returns `token = ""` and `refreshToken = ""`. This wastes bandwidth and is semantically confusing.
- **Impact:** Frontend receives empty token strings that it must ignore. The `AuthResponse` type is being repurposed for profile updates when it should have a dedicated `UserProfileResponse` DTO.
- **Fix:** Create a `UserProfileResponse` DTO without token fields, or make `token`/`refreshToken` optional in `AuthResponse`.

### WR-04: Frontend Uses `alert()` for Success Notification
- **File:** `frontend/src/app/[locale]/profile/edit/page.tsx:83`
- **Severity:** Warning (UX)
- **Status:** ✅ FIXED
- **Scenario:** `alert("Profile updated successfully!")` shows a browser-native alert dialog.
- **Impact:** Poor UX. Alert dialogs block the UI and look unprofessional. Should use a toast/snackbar notification system.
- **Fix:** Replaced `alert()` with inline success banner using React state.

### WR-05: Frontend Avatar Upload — No Client-Side Validation
- **File:** `frontend/src/app/[locale]/profile/edit/page.tsx:57-73`
- **Severity:** Warning (UX)
- **Status:** ✅ FIXED
- **Scenario:** User selects a 50MB video file or a `.exe` file disguised as an image. No client-side check before upload.
- **Impact:** Wasted bandwidth, slow upload, and server-side rejection after the user has already waited.
- **Fix:** Added client-side validation for file size (5MB max) and type (JPEG, PNG, GIF, WebP).

### WR-06: Frontend Returns Null for Unauthenticated User
- **File:** `frontend/src/app/[locale]/profile/edit/page.tsx:103`
- **Severity:** Warning (UX)
- **Status:** ✅ FIXED
- **Scenario:** `if (!user) return null;` renders a blank page if user is not in localStorage.
- **Impact:** User sees a blank white page. Should redirect to login or show a message.
- **Fix:** Changed to redirect to `/profile` if user is null.

### WR-07: Frontend Profile Page — Email Verification Check Uses Wrong Field
- **File:** `frontend/src/app/[locale]/profile/page.tsx:119-123`
- **Severity:** Warning (Correctness)
- **Status:** ✅ FIXED
- **Scenario:** The "Email Verified" badge checks `user.email` (which is always truthy — it's required) instead of `user.isEmailVerified`.
- **Impact:** Email verification badge always shows green even for unverified users.
- **Fix:** Changed to `user.isEmailVerified`. Also added `isEmailVerified` to shared `User` type, backend `AuthResponse`, and all `toAuthResponse()` methods.

### WR-08: Mobile — `isAuthenticated` Check is Fire-and-Forget
- **File:** `mobile/app/(tabs)/profile.tsx:28-30`
- **Severity:** Warning (Correctness)
- **Status:** ✅ FIXED
- **Scenario:** `isAuthenticated().then(...)` runs in parallel with `loadProfile()`. If the user is not authenticated, `loadProfile()` still executes and fails.
- **Impact:** Unnecessary API calls and potential error states for unauthenticated users.
- **Fix:** Changed to await `isAuthenticated()` before calling `loadProfile()`.

### WR-09: Mobile — Missing Phone Field in Session Update
- **File:** `mobile/app/profile/edit.tsx:76-92`
- **Severity:** Warning (Data Loss)
- **Status:** ✅ FIXED
- **Scenario:** The `sessionUser` object in `handleSave()` doesn't include `phone`. If the backend returns `phone` in the response, it's lost from the local session.
- **Impact:** User's phone number disappears from local state after profile update, requiring a page refresh to restore.
- **Fix:** Added `phone` to the session update in both `handleSave()` and `handleAvatarPick()`.

### WR-10: Mobile — Hardcoded MIME Type for Avatar
- **File:** `mobile/app/profile/edit.tsx:116-120`
- **Severity:** Warning (Correctness)
- **Status:** ✅ FIXED
- **Scenario:** `type: "image/jpeg"` is hardcoded regardless of actual image type. User selects a PNG but it's uploaded as JPEG.
- **Impact:** Image metadata is incorrect. Server may misserve the image or the browser may misrender it.
- **Fix:** Changed to use `asset.mimeType` with fallback to `"image/jpeg"`.

### WR-11: Rate Limiting Not Distributed
- **File:** `backend/src/main/kotlin/com/shareshelf/config/RateLimitFilter.kt:14`
- **Severity:** Warning (Security)
- **Status:** ⏭️ SKIPPED (requires infrastructure change)
- **Scenario:** `ConcurrentHashMap`-based rate limiting only works for single-instance deployments. Railway can scale to multiple instances.
- **Impact:** Rate limits are per-instance, not global. An attacker can bypass limits by hitting different instances.
- **Fix:** For now, document this limitation. For production, consider Redis-based rate limiting or Railway's built-in rate limiting.

---

## Info Findings

### IN-01: UpdateProfileRequest Allows Empty Name
- **File:** `backend/src/main/kotlin/com/shareshelf/user/dto/UpdateProfileRequest.kt:6`
- **Severity:** Info
- **Details:** `@field:Size(max = 100)` with no `min` constraint allows empty string for name. The `User` entity has `@Column(nullable = false)` with default `""`, so empty names pass validation but cause display issues (shows blank avatar letter).
- **Fix:** Add `@field:Size(min = 1, max = 100)` or `@field:NotBlank`.

### IN-02: Duplicated AuthResponse Mapping Logic
- **File:** `backend/src/main/kotlin/com/shareshelf/user/UserController.kt:43-65`
- **Severity:** Info
- **Details:** `toAuthResponse()` and `calculateProfileBonus()` in `UserController` duplicate logic. If `AuthResponse` fields change, both places need updating.
- **Fix:** Move to a shared utility or extension function on `User`.

### IN-03: Frontend useEffect Dependency on User Object
- **File:** `frontend/src/app/[locale]/profile/edit/page.tsx:36-51`
- **Severity:** Info
- **Details:** `useEffect` depends on `user` which is a new object on each render from `getUser()`. This could cause unnecessary re-renders.
- **Fix:** Use `user?.id` as dependency instead of `user`.

### IN-04: Frontend Silently Swallows API Errors
- **File:** `frontend/src/app/[locale]/profile/page.tsx:27-28`
- **Severity:** Info
- **Details:** `.catch(() => ({ data: { data: [] } }))` silently swallows API errors. Users won't know if items or reviews failed to load.
- **Fix:** Log errors to console or show a subtle error indicator.

### IN-05: Mobile Uses `any` Type for Error
- **File:** `mobile/app/profile/edit.tsx:98`
- **Severity:** Info
- **Details:** `catch (err: any)` is a TypeScript anti-pattern.
- **Fix:** Use proper error typing: `catch (err: unknown)` with type narrowing.

### IN-06: Social Link Not Validated as URL
- **File:** `frontend/src/app/[locale]/profile/edit/page.tsx:196`, `mobile/app/profile/edit.tsx:215-223`
- **Severity:** Info
- **Details:** Social link field accepts any string. User could enter "javascript:alert(1)" or invalid URLs.
- **Fix:** Add URL validation on frontend and backend. At minimum, check that the value starts with `http://` or `https://` (or add `https://` prefix if missing).

### IN-07: JWT Secret Fallback in Production
- **File:** `backend/src/main/resources/application.yml:46`
- **Severity:** Info (Security)
- **Details:** `jwt.secret: ${JWT_SECRET:shareshelf-dev-secret-key-must-be-at-least-256-bits-long-for-hs256}` — if `JWT_SECRET` env var is missing in production, the hardcoded fallback would be used.
- **Fix:** Ensure `JWT_SECRET` is always set in production environment variables. Consider failing startup if not set in production profile.

---

## Summary

| Severity | Count | Fixed | Skipped |
|----------|-------|-------|---------|
| Critical | 2 | 2 | 0 |
| Warning | 11 | 9 | 2 |
| Info | 7 | 0 | 7 |
| **Total** | **20** | **11** | **9** |

### Fixed Issues (11)
- ✅ CR-01: MIME type validation on avatar upload
- ✅ CR-02: Profile fields can now be cleared
- ✅ WR-01: Avatar deletion exceptions now logged
- ✅ WR-02: Removed unnecessary trust score recalculation
- ✅ WR-04: Replaced alert() with inline success banner
- ✅ WR-05: Added client-side avatar validation
- ✅ WR-06: Redirect unauthenticated users instead of blank page
- ✅ WR-07: Fixed email verification badge to use correct field
- ✅ WR-08: Mobile auth check now awaits before loading profile
- ✅ WR-09: Added phone field to mobile session update
- ✅ WR-10: Mobile avatar now uses actual MIME type

### Skipped Issues (2)
- ⏭️ WR-03: Empty token fields (requires cross-layer DTO refactor)
- ⏭️ WR-11: Rate limiting not distributed (requires Redis/infra change)

### Info Findings (7) — Scheduled for Future Cleanup
- IN-01: UpdateProfileRequest allows empty name
- IN-02: Duplicated AuthResponse mapping logic
- IN-03: Frontend useEffect dependency on user object
- IN-04: Frontend silently swallows API errors
- IN-05: Mobile uses `any` type for error
- IN-06: Social link not validated as URL
- IN-07: JWT secret fallback in production

### Verification
- ✅ Backend compiles successfully
- ✅ Frontend TypeScript passes
- ✅ Mobile TypeScript passes

### Recommended Next Steps
- Schedule Info findings for future cleanup
- Add integration tests for profile edit flow
- Add E2E test for avatar upload validation
- Consider WR-03 (dedicated UserProfileResponse DTO) for API cleanliness
