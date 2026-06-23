# Phase 7: Google OAuth Signup - Context

**Gathered:** 2026-06-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Google OAuth 2.0 signup/login to ShareShelf. Users can authenticate with their Google account, and the system creates or finds their user record and returns a JWT — integrating with the existing stateless auth system. This phase delivers the backend OAuth2 callback endpoint, User entity schema changes, and frontend "Sign in with Google" buttons on both login and register pages with a dedicated callback page.

This phase does NOT add other OAuth providers (GitHub, Facebook), password-reset flows, or email verification.

</domain>

<decisions>
## Implementation Decisions

### OAuth Flow
- **D-01:** Authorization Code flow — Google redirects to backend, backend exchanges code for tokens, verifies, creates/returns JWT. Most secure — tokens never touch the frontend.
- **D-02:** Spring Security OAuth2 Client (`spring-boot-starter-oauth2-client`) — adds OAuth2LoginAuthenticationFilter to the Spring Security chain. Handles redirect to Google, code exchange, and user info extraction automatically.
- **D-03:** Backend handles callback at `/oauth2/callback/google`. Spring Security OAuth2 Client expects this pattern by default.
- **D-04:** After successful Google auth, backend redirects to a dedicated frontend callback page with JWT in query params (e.g. `/auth/callback?token=xxx&refreshToken=yyy`).

### Account Linking
- **D-05:** Auto-link if email matches — if a user signs in with Google and their email matches an existing account, automatically link the Google identity to that account. The user can then sign in either way.
- **D-06:** Add `google_id` (String, unique, nullable) and `auth_provider` (enum: LOCAL, GOOGLE) columns to the `users` table via Flyway migration.
- **D-07:** Import Google's profile picture URL to `User.avatarUrl` on first Google login. Existing email/password users keep their current avatar.
- **D-08:** Allow null `passwordHash` for Google-only users. They can set a password later from profile settings if they want email/password login too. The login endpoint checks `auth_provider` before attempting password verification.

### Frontend UX
- **D-09:** "Sign in with Google" button appears on BOTH login and register pages, above the email/password form.
- **D-10:** Google-branded button with "G" logo and "Sign in with Google" text. Follows Google's brand guidelines.
- **D-11:** "or" divider between the Google button and the email/password form fields.
- **D-12:** Full-page redirect flow — user clicks button, browser navigates to Google, user authenticates, Google redirects back to backend, backend redirects to frontend callback page.
- **D-13:** Dedicated `/auth/callback` page reads tokens from URL params, saves to sessionStorage, and redirects to the return URL or `/items`.
- **D-14:** Preserve return URL — before redirecting to Google, save the current page URL in a query param. After callback, redirect there instead of `/items`.

### Claude's Discretion
- Spring Security OAuth2 Client configuration details (client registration, authorization redirect URI pattern)
- Exact Google Cloud Console setup steps (OAuth consent screen, credentials)
- Whether to add a "Link Google account" button on profile settings for existing LOCAL users
- Error handling for OAuth failures (Google returns error, network issues, etc.)
- Whether to show the auth provider on the user profile
- Session storage vs cookie for the OAuth state parameter (CSRF protection)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 7 success criteria and scope
- `.planning/REQUIREMENTS.md` — v1/v2 requirements; OAuth was previously "Out of Scope", now explicitly in scope

### Existing Auth System (directly affected)
- `backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt` — Current register/login logic; OAuth service will follow same pattern
- `backend/src/main/kotlin/com/shareshelf/auth/AuthController.kt` — Current auth endpoints; OAuth adds `/oauth2/callback/google` and possibly `/auth/google` redirect
- `backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt` — Entity to add `googleId`, `authProvider` columns; `passwordHash` becomes nullable
- `backend/src/main/kotlin/com/shareshelf/auth/entity/UserRepository.kt` — Add `findByGoogleId()` method
- `backend/src/main/kotlin/com/shareshelf/auth/JwtTokenProvider.kt` — JWT generation (reused as-is for OAuth users)
- `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt` — Add OAuth2 Client filter to security chain; permit `/oauth2/**` endpoints
- `backend/src/main/resources/db/migration/` — Flyway migration for `google_id`, `auth_provider` columns

### Frontend Auth Pages
- `frontend/src/app/[locale]/login/page.tsx` — Add Google button above form
- `frontend/src/app/[locale]/register/page.tsx` — Add Google button above form
- `frontend/src/app/[locale]/auth/callback/page.tsx` — New page for OAuth callback (to be created)
- `frontend/src/lib/auth.ts` — `saveAuth()` function reused for OAuth JWT storage

### Architecture
- `.planning/codebase/ARCHITECTURE.md` — System architecture for integration context
- `.planning/codebase/INTEGRATIONS.md` — Current auth integration details
- `.planning/codebase/STACK.md` — Technology stack and dependencies
- `CLAUDE.md` — Project conventions (controllers, services, repositories, DTOs, frontend patterns)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **JwtTokenProvider** (`auth/JwtTokenProvider.kt`): `generateToken(userId, email)` — OAuth flow reuses this to mint JWTs for Google-authenticated users. No changes needed.
- **AuthResponse DTO** (`auth/dto/AuthDtos.kt`): `AuthResponse(token, refreshToken, userId, name, email, trustScore, community, avatarUrl)` — OAuth callback returns the same response shape. Frontend's `saveAuth()` works as-is.
- **saveAuth()** (`lib/auth.ts`): Stores JWT in sessionStorage. OAuth callback page calls this with the token from URL params.
- **RefreshToken rotation** (`auth/AuthService.kt`): `createRefreshToken()` — OAuth login should also issue refresh tokens following the same pattern.
- **ApiResponse<T>** (`common/ApiResponse.kt`): Standardized response wrapper — used for any new API endpoints.

### Established Patterns
- **Auth endpoint pattern**: `AuthController` → `AuthService` → `UserRepository` + `JwtTokenProvider`. OAuth follows the same layered pattern with a new `OAuthService` or extending `AuthService`.
- **Spring Security filter chain**: `SecurityConfig` adds `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`. OAuth2 Client adds its own filter — need to ensure ordering is correct.
- **Flyway migrations**: Versioned SQL files. Next migration is `V13__add_google_oauth.sql` for `google_id` and `auth_provider` columns.
- **Frontend form pattern**: Login/Register pages use `Input` + `Button` components with `useState` for form state. Google button follows the same page structure.

### Integration Points
- **SecurityConfig.kt**: Add `oauth2Login()` to the security filter chain. Permit `/oauth2/**` and `/login/oauth2/**` endpoints.
- **User entity**: Add `googleId: String?`, `authProvider: AuthProvider` enum. Make `passwordHash` nullable.
- **AuthService.login()**: Check `authProvider` before attempting password verification — Google users shouldn't hit the password check.
- **Frontend callback page**: New `frontend/src/app/[locale]/auth/callback/page.tsx` — reads `token` and `refreshToken` from URL search params, calls `saveAuth()`, redirects.
- **Login/Register pages**: Add Google button component above the form. Button links to `/api/oauth2/authorization/google` (Spring Security's default authorization request endpoint).

</code_context>

<specifics>
## Specific Ideas

- Google-branded button should use the official Google "G" logo (SVG) with white background and "Sign in with Google" text
- The "or" divider should be a horizontal line with "or" text centered — matching the existing card style
- The callback page should show a brief loading state ("Signing you in...") before redirecting
- Error states on the callback page (if token param is missing or invalid) should show a friendly message with a link back to login
- Google Cloud Console will need OAuth 2.0 credentials configured with the correct redirect URI for both local dev (`http://localhost:8080/oauth2/callback/google`) and production (`https://shareshelf-api.up.railway.app/oauth2/callback/google`)

No specific external references or "make it like X" examples — standard OAuth2 flow patterns.

</specifics>

<deferred>
## Deferred Ideas

- **Other OAuth providers (GitHub, Facebook)**: Deferred to future phases. The `auth_provider` enum is designed to be extensible.
- **Password reset flow**: Not in this phase. Google-only users who want password login can set a password from profile settings (Claude's discretion).
- **Email verification**: Not in this phase. Google-verified emails are trusted by default.
- **Account unlinking**: Not in this phase. Users can't unlink their Google account once connected (future feature).

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-Google OAuth Signup*
*Context gathered: 2026-06-23*
