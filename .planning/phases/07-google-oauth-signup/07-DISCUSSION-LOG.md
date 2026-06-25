# Phase 7: Google OAuth Signup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-23
**Phase:** 7-Google OAuth Signup
**Areas discussed:** OAuth flow approach, Account linking, Login/Register page layout, Frontend UX (popup vs redirect)

---

## OAuth Flow Approach

### Q1: Which OAuth flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Authorization Code flow | Google redirects to backend, backend exchanges code for tokens, verifies, creates/returns JWT. Most secure. | ✓ |
| Google Sign-In JS SDK + backend token verification | Frontend gets ID token directly from Google JS SDK, sends to backend for verification. Simpler setup. | |
| You decide | Claude picks the best approach. | |

**User's choice:** Authorization Code flow (Recommended)
**Notes:** Standard server-side OAuth2 — tokens never touch the frontend.

### Q2: Spring Security OAuth2 Client vs manual Google API?

| Option | Description | Selected |
|--------|-------------|----------|
| Spring Security OAuth2 Client | spring-boot-starter-oauth2-client. Handles redirect, code exchange, user info automatically. | ✓ |
| Manual Google API integration | Use Google's HTTP token verification or google-api-client. Full control, more code. | |

**User's choice:** Spring Security OAuth2 Client (Recommended)
**Notes:** Well-documented, adds OAuth2LoginAuthenticationFilter to Spring Security chain.

### Q3: Where does Google redirect after authentication?

| Option | Description | Selected |
|--------|-------------|----------|
| Backend handles callback at /oauth2/callback/google | Backend handles OAuth callback directly. Simplest — Spring Security expects this. | ✓ |
| Frontend handles callback, sends code to backend | Google redirects to frontend, frontend sends code to backend. More complex. | |

**User's choice:** Backend handles callback at /oauth2/callback/google (Recommended)
**Notes:** Spring Security OAuth2 Client default pattern.

### Q4: How does frontend receive JWT after auth?

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to frontend with JWT in query param | Backend redirects to /auth/callback?token=xxx. Frontend reads param, saves to sessionStorage. | ✓ |
| Return HTML page that posts JWT to opener window | Backend returns HTML page with postMessage(). Works with popup flow. | |

**User's choice:** Redirect to frontend with JWT in query param (Recommended)
**Notes:** Standard pattern for server-side OAuth. Dedicated /auth/callback page.

---

## Account Linking

### Q1: What happens when Google email matches existing account?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-link if email matches | Automatically link Google identity to existing account. User can sign in either way. | ✓ |
| Always create separate account | New account even if email matches. Users might have duplicates. | |
| Ask user to confirm linking | Show prompt asking user to confirm. More secure but adds friction. | |

**User's choice:** Auto-link if email matches (Recommended)
**Notes:** Simplest UX — no confusion about "which account do I use?"

### Q2: How to store Google identity on User entity?

| Option | Description | Selected |
|--------|-------------|----------|
| Add google_id + auth_provider columns | Add `google_id` (String, unique, nullable) and `auth_provider` (enum: LOCAL, GOOGLE). Clean separation. | ✓ |
| Reuse password_hash field with prefix | Store Google ID with 'google:xxx' prefix. No schema change but hacky. | |

**User's choice:** Add google_id + auth_provider columns (Recommended)
**Notes:** Flyway migration adds new columns. auth_provider enum designed to be extensible for future providers.

### Q3: Should we import Google avatar?

| Option | Description | Selected |
|--------|-------------|----------|
| Import Google avatar to User.avatarUrl | Save Google's profile picture URL on first login. Existing users keep current avatar. | ✓ |
| Ignore Google avatar | Users upload their own separately. Keeps avatar independent of auth. | |

**User's choice:** Import Google avatar to User.avatarUrl (Recommended)
**Notes:** Simple — no extra storage needed. Google avatar URL is already HTTPS.

### Q4: How to handle null password for Google users?

| Option | Description | Selected |
|--------|-------------|----------|
| Allow null password for Google-only users | Null passwordHash. Users can set password later from profile. Login checks auth_provider first. | ✓ |
| Generate random password for Google users | Random impossible-to-guess password. Can reset via email later. | |

**User's choice:** Allow null password for Google-only users (Recommended)
**Notes:** Login endpoint must check auth_provider before attempting password verification.

---

## Login/Register Page Layout

### Q1: Where does the Google button appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Both pages, above email/password form | "Sign in with Google" above form on BOTH login and register pages. Most common pattern. | ✓ |
| Login page only | Google button only on login. Register stays email/password. | |
| Both pages, below email/password form | Google button below form. Email/password is primary path. | |

**User's choice:** Both pages, above email/password form (Recommended)
**Notes:** Users see both auth methods immediately.

### Q2: How should the Google button look?

| Option | Description | Selected |
|--------|-------------|----------|
| Google-branded button with "G" logo | White button with Google's "G" logo and "Sign in with Google" text. Follows brand guidelines. | ✓ |
| ShareShelf-styled button with Google icon | App's button style (purple/emerald) with Google icon. Matches design system. | |
| You decide | Claude picks the visual style. | |

**User's choice:** Google-branded button with "G" logo (Recommended)
**Notes:** Clean, recognizable, follows Google's brand guidelines.

### Q3: Should there be a visual divider?

| Option | Description | Selected |
|--------|-------------|----------|
| "or" divider between Google button and form | Horizontal line with "or" in the middle. Visually separates auth methods. | ✓ |
| No divider | Form fields just follow the button. Cleaner but less separation. | |

**User's choice:** "or" divider between Google button and form (Recommended)
**Notes:** Standard pattern for multi-auth pages.

---

## Frontend UX — Popup vs Redirect

### Q1: Popup or redirect for Google auth?

| Option | Description | Selected |
|--------|-------------|----------|
| Full-page redirect | Browser navigates to Google, authenticates, redirects back. Standard, simple, reliable. | ✓ |
| Popup window | Popup opens, user authenticates, popup closes. Keeps page state but needs cross-window messaging. | |

**User's choice:** Full-page redirect (Recommended)
**Notes:** Simpler implementation. User loses current page state but return URL preserves navigation.

### Q2: Where does backend redirect after auth?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /auth/callback page | New page reads tokens from URL params, saves to sessionStorage, redirects. Clean separation. | ✓ |
| Reuse /login page with token param | Login page detects token param, saves, redirects. Reuses existing page. | |
| Redirect to /items with token param | Direct to /items. Simplest but clutters URL. | |

**User's choice:** Dedicated /auth/callback page (Recommended)
**Notes:** Shows brief loading state ("Signing you in...") before redirecting.

### Q3: Should we preserve return URL?

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve return URL | Save current page URL before Google redirect. After callback, redirect there. | ✓ |
| Always redirect to /items | Simpler but users end up on browse page regardless of where they started. | |

**User's choice:** Preserve return URL (Recommended)
**Notes:** Return URL passed as query param to Google's authorization endpoint.

---

## Claude's Discretion

- Spring Security OAuth2 Client configuration details (client registration, authorization redirect URI pattern)
- Exact Google Cloud Console setup steps (OAuth consent screen, credentials)
- Whether to add a "Link Google account" button on profile settings for existing LOCAL users
- Error handling for OAuth failures (Google returns error, network issues, etc.)
- Whether to show the auth provider on the user profile
- Session storage vs cookie for the OAuth state parameter (CSRF protection)

## Deferred Ideas

- **Other OAuth providers (GitHub, Facebook)**: Future phase. auth_provider enum is extensible.
- **Password reset flow**: Not in this phase. Google-only users can set password from profile settings.
- **Email verification**: Not in this phase. Google-verified emails are trusted.
- **Account unlinking**: Not in this phase. Future feature.
