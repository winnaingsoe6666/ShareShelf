---
phase: 07-google-oauth-signup
plan: 04
subsystem: frontend
tags: [oauth, google, frontend, ui-components, callback]
depends_on:
  requires: [07-02, 07-03]
  provides: [google-signin-button, auth-divider, oauth-callback-page]
  affects: [login-page, register-page]
tech_stack:
  added: []
  patterns: [oauth2-redirect-flow, cookie-based-return-url]
key_files:
  created:
    - frontend/src/components/ui/GoogleSignInButton.tsx
    - frontend/src/components/ui/AuthDivider.tsx
    - frontend/src/app/[locale]/auth/callback/page.tsx
    - frontend/src/components/ui/__tests__/GoogleSignInButton.test.tsx
    - frontend/src/components/ui/__tests__/AuthDivider.test.tsx
    - frontend/src/app/[locale]/auth/callback/__tests__/AuthCallbackPage.test.tsx
  modified:
    - frontend/src/app/[locale]/login/page.tsx
    - frontend/src/app/[locale]/register/page.tsx
decisions:
  - "Used anchor tag (<a>) instead of Button component for Google sign-in to allow native browser navigation to OAuth endpoint"
  - "AuthCallback constructs minimal AuthResponse with placeholder userId/name/email since OAuth backend only returns tokens"
  - "Used vi.hoisted() for test mocks to handle vitest's vi.mock hoisting behavior"
metrics:
  duration_seconds: 364
  completed: "2026-06-25T04:06:18Z"
  tasks: 4
  files: 8
  tests: 13
---

# Phase 7 Plan 04: Frontend OAuth UI Summary

Google Sign-In button, auth divider, and OAuth callback page for the frontend OAuth flow.

## What Was Built

### GoogleSignInButton (`frontend/src/components/ui/GoogleSignInButton.tsx`)
- Client component rendering an anchor to `/api/oauth2/authorization/google`
- Official multi-color Google "G" SVG logo (20x20, viewBox 0 0 48 48)
- Sets `oauth_return_url` cookie on click for stateless return URL preservation (per D-14)
- Supports custom text prop (default: "Sign in with Google")
- Styled per UI-SPEC: white background, gray border, hover shadow, focus ring

### AuthDivider (`frontend/src/components/ui/AuthDivider.tsx`)
- Simple divider with two purple horizontal lines and "or" text
- Used between Google button and email/password form

### AuthCallback Page (`frontend/src/app/[locale]/auth/callback/page.tsx`)
- Reads `token`, `refreshToken`, `returnUrl` from URL search params
- On success: calls `saveAuth()` with tokens, redirects to returnUrl or `/items`
- On failure: shows error state with AlertCircle icon and "Back to Sign In" link
- Loading state with Loader2 spinner while processing

### Modified Pages
- **Login page**: Google button above form with "Sign in with Google", AuthDivider, google_auth_failed error alert
- **Register page**: Google button above form with "Sign up with Google", AuthDivider, google_auth_failed error alert

## Decisions Made

1. **Anchor tag for Google button**: Used `<a>` instead of the `Button` component because the OAuth flow requires native browser navigation to the backend endpoint, not a JavaScript-driven request.

2. **Minimal AuthResponse in callback**: The callback constructs `saveAuth({ token, refreshToken, userId: 0, name: "", email: "", trustScore: 0 })` with placeholder values because the OAuth backend only returns tokens in the redirect URL. The actual user profile data should be fetched via a separate API call or decoded from the JWT.

3. **vi.hoisted() for test mocks**: Used `vi.hoisted()` to declare mock functions because vitest's `vi.mock` factories are hoisted before `const` declarations, causing "Cannot access before initialization" errors with regular `const mockFn = vi.fn()`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock hoisting issue**
- **Found during:** Task 4
- **Issue:** `vi.mock("next/navigation", ...)` factory couldn't access `const mockSearchParams = vi.fn()` because `vi.mock` is hoisted to the top of the file before `const` declarations
- **Fix:** Used `vi.hoisted()` to declare mock functions that are available during hoisted mock factory execution
- **Files modified:** `frontend/src/app/[locale]/auth/callback/__tests__/AuthCallbackPage.test.tsx`
- **Commit:** 39e0926

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| userId: 0, name: "", email: "" in saveAuth call | auth/callback/page.tsx | 18 | OAuth callback only receives tokens from backend redirect; user info should be fetched separately or decoded from JWT. Future plan should add a /auth/me call after OAuth login. |

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: cookie_write | GoogleSignInButton.tsx | Sets `oauth_return_url` cookie with user-controlled path data (window.location). Cookie scoped to path=/, max-age=600, SameSite=Lax. Low risk since value is URL-encoded current page path, not user input. |
| threat_flag: token_in_url | auth/callback/page.tsx | Reads auth tokens from URL search params. Standard OAuth2 redirect flow pattern. Tokens are moved to sessionStorage immediately and URL is not stored. |

## Verification Results

- `cd frontend && npx vitest run` -- 169 tests pass (26 test files), including 13 new tests
- `grep -r "GoogleSignInButton" login/page.tsx` -- imported and rendered
- `grep -r "GoogleSignInButton" register/page.tsx` -- imported and rendered
- `grep -r "saveAuth" auth/callback/page.tsx` -- tokens saved on callback
- `grep -r "oauth2/authorization/google" GoogleSignInButton.tsx` -- correct OAuth URL

## Self-Check: PASSED

- [x] frontend/src/components/ui/GoogleSignInButton.tsx exists
- [x] frontend/src/components/ui/AuthDivider.tsx exists
- [x] frontend/src/app/[locale]/auth/callback/page.tsx exists
- [x] frontend/src/components/ui/__tests__/GoogleSignInButton.test.tsx exists
- [x] frontend/src/components/ui/__tests__/AuthDivider.test.tsx exists
- [x] frontend/src/app/[locale]/auth/callback/__tests__/AuthCallbackPage.test.tsx exists
- [x] Commit 05c6913 exists (GoogleSignInButton + AuthDivider)
- [x] Commit ff1feb9 exists (AuthCallback page)
- [x] Commit c0b557c exists (login + register pages)
- [x] Commit 39e0926 exists (tests)
