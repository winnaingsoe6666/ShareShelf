# Phase 7: Google OAuth Signup — Research

**Status:** RESEARCH COMPLETE
**Date:** 2026-06-24

---

## 1. Architecture Summary

### Current Auth System
- **Spring Security** with stateless JWT sessions (`SessionCreationPolicy.STATELESS`)
- **JwtAuthenticationFilter** extracts Bearer token from `Authorization` header, validates, sets `SecurityContext`
- **AuthService** handles register/login/refresh/logout with bcrypt password hashing
- **User entity** has `passwordHash` (non-nullable), `email` (unique), `avatarUrl`, `trustScore`
- **Frontend** stores JWT in `sessionStorage` via `saveAuth()` — no cookies, no server sessions
- **Refresh tokens** stored hashed in `refresh_tokens` table, single-use rotation

### Key Insight: Stateless + OAuth2
The current system is fully stateless (no HTTP sessions). Spring Security's OAuth2 Client default uses sessions to store the authorization request state. We need to either:
1. **Use a custom OAuth2 success handler** that bypasses the session-based redirect and instead generates a JWT + redirects to frontend
2. **Not use `oauth2Login()` filter** — instead manually handle the OAuth2 code exchange in a custom controller

**Recommendation:** Use `oauth2Login()` with a custom `AuthenticationSuccessHandler` that generates a JWT and redirects to the frontend callback page. This is the cleanest approach — Spring Security handles the Google redirect, code exchange, and user info extraction, while we customize only the success/failure outcomes.

---

## 2. Spring Security OAuth2 Client Integration

### Dependencies Required
```kotlin
// Add to build.gradle.kts
implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
```

This pulls in:
- `spring-security-oauth2-client` — OAuth2 login filter, authorization request repository
- `spring-security-oauth2-jose` — JWT decoding for ID tokens (not conflicting with our jjwt)
- `spring-security-oauth2-core` — Core OAuth2 types

### Configuration Properties
```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID:}
            client-secret: ${GOOGLE_CLIENT_SECRET:}
            scope:
              - openid
              - profile
              - email
```

Spring Boot auto-configures the Google provider endpoint (`https://accounts.google.com/o/oauth2/v2/auth`, token URI, userinfo URI) from the `google` registration name.

### SecurityConfig Changes
Current chain:
```
csrf.disable → cors → STATELESS → authorizeHttpRequests → addFilterBefore(JWT) → addFilterBefore(RateLimit)
```

New chain adds:
```kotlin
.oauth2Login { oauth2 ->
    oauth2
        .authorizationEndpoint { it.baseUri("/oauth2/authorization") }
        .redirectionEndpoint { it.baseUri("/oauth2/callback/*") }
        .successHandler(oauth2AuthenticationSuccessHandler)
        .failureHandler(oauth2AuthenticationFailureHandler)
}
```

**Critical:** The `oauth2Login()` filter MUST be added AFTER the JWT filter but BEFORE `UsernamePasswordAuthenticationFilter`. The OAuth2 callback endpoints (`/oauth2/**`, `/login/oauth2/**`) must be `permitAll()`.

### Session Strategy Issue
With `STATELESS` session management, Spring Security's default `AuthorizationRequestRepository` (which uses HTTP sessions) won't work. We need:
```kotlin
.oauth2Login { oauth2 ->
    oauth2
        .authorizationEndpoint {
            it.authorizationRequestRepository(HttpCookieOAuth2AuthorizationRequestRepository())
        }
        // ... rest of config
}
```

Or use `CookieOAuth2AuthorizationRequestRepository` from `spring-security-oauth2-client` (available since Spring Security 5.2+). This stores the authorization request in an encrypted cookie instead of the session.

---

## 3. User Entity Schema Changes

### New Columns (Flyway Migration V13)
```sql
-- V13__add_google_oauth.sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Make password_hash nullable for Google-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Index for Google ID lookups
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
```

### User Entity Changes
```kotlin
@Column(name = "google_id", unique = true)
val googleId: String? = null

@Column(name = "auth_provider", nullable = false)
@Enumerated(EnumType.STRING)
var authProvider: AuthProvider = AuthProvider.LOCAL
```

### AuthProvider Enum
```kotlin
enum class AuthProvider {
    LOCAL, GOOGLE
}
```

### UserRepository Additions
```kotlin
fun findByGoogleId(googleId: String): User?
```

### AuthService.login() Change
The current `login()` method does `passwordEncoder.matches(request.password, user.passwordHash)`. For Google-only users (null `passwordHash`), this will throw NPE. Need to check:
```kotlin
if (user.authProvider == AuthProvider.GOOGLE && user.passwordHash.isNullOrEmpty()) {
    throw BadCredentialsException("This account uses Google Sign-In. Please use Google to log in.")
}
```

---

## 4. OAuth2 Success Handler (JWT Generation)

### OAuth2AuthenticationSuccessHandler
Custom `AuthenticationSuccessHandler` that:
1. Extracts user info from `OAuth2User` (name, email, avatar, Google ID)
2. Finds or creates user in database
3. Generates JWT using existing `JwtTokenProvider.generateToken(userId, email)`
4. Generates refresh token using existing `createRefreshToken()` pattern
5. Redirects to frontend callback: `{frontendUrl}/auth/callback?token={jwt}&refreshToken={refresh}&returnUrl={returnUrl}`

### User Creation/Linking Logic
```kotlin
fun processOAuthUser(oAuth2User: OAuth2User): User {
    val googleId = oAuth2User.getAttribute<String>("sub")
    val email = oAuth2User.getAttribute<String>("email")
    val name = oAuth2User.getAttribute<String>("name")
    val avatarUrl = oAuth2User.getAttribute<String>("picture")

    // Try by Google ID first
    userRepository.findByGoogleId(googleId)?.let { return it }

    // Try by email (auto-link)
    userRepository.findByEmail(email)?.let { existingUser ->
        existingUser.googleId = googleId
        existingUser.authProvider = AuthProvider.GOOGLE
        if (existingUser.avatarUrl == null && avatarUrl != null) {
            existingUser.avatarUrl = avatarUrl
        }
        return userRepository.save(existingUser)
    }

    // Create new user
    val newUser = User(
        name = name ?: email.substringBefore("@"),
        email = email,
        passwordHash = "", // Google-only, no password
        googleId = googleId,
        authProvider = AuthProvider.GOOGLE,
        avatarUrl = avatarUrl
    )
    return userRepository.save(newUser)
}
```

### Return URL Preservation
- Before redirecting to Google, save `returnUrl` in a cookie or query param
- Spring Security's authorization request can include `state` parameter — we can encode `returnUrl` in it
- On callback, extract `returnUrl` from state and include in redirect

---

## 5. OAuth2 Failure Handler

### OAuth2AuthenticationFailureHandler
On failure (user cancels, Google error, network issue):
- Redirect to `{frontendUrl}/login?error=google_auth_failed`
- Frontend login page checks for `error` query param and shows alert

---

## 6. Frontend Implementation

### New Components
1. **GoogleSignInButton** (`frontend/src/components/ui/GoogleSignInButton.tsx`)
   - Google-branded button with official "G" SVG logo
   - Links to `/api/oauth2/authorization/google` (Spring Security's default)
   - Full-page redirect (not popup)

2. **AuthDivider** (`frontend/src/components/ui/AuthDivider.tsx`)
   - Horizontal line with "or" text centered

3. **AuthCallbackPage** (`frontend/src/app/[locale]/auth/callback/page.tsx`)
   - Reads `token`, `refreshToken`, `returnUrl` from URL search params
   - Calls `saveAuth()` with the token data
   - Redirects to `returnUrl` or `/items`
   - Shows loading state, error state if params missing

### Login Page Changes
- Add `<GoogleSignInButton />` and `<AuthDivider />` above the form
- Check for `error` query param to show Google auth failure message
- Reduce `mb-8` to `mb-6` on header to accommodate new elements

### Register Page Changes
- Same as login — add Google button and divider above form

---

## 7. Security Considerations

### CSRF Protection
- Current setup: CSRF disabled (stateless JWT). OAuth2 callback doesn't need CSRF.
- The `state` parameter in OAuth2 flow provides CSRF protection for the authorization request.

### State Parameter
- Spring Security generates a random `state` parameter for each authorization request
- Validates it on callback to prevent CSRF attacks
- With cookie-based `AuthorizationRequestRepository`, state is stored in an encrypted cookie

### Token Security
- JWT generation uses existing `JwtTokenProvider` — no changes needed
- Refresh tokens follow existing rotation pattern
- Frontend stores in `sessionStorage` (existing behavior)

### Google-Specific
- Only `openid`, `profile`, `email` scopes needed
- Google ID token is verified by Spring Security OAuth2 Client automatically
- `email` scope returns verified email (Google guarantees verification)

---

## 8. Configuration & Environment

### Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Yes |
| `FRONTEND_URL` | Frontend base URL for redirects | Yes (fallback: `http://localhost:3000`) |

### Google Cloud Console Setup
1. Create OAuth 2.0 credentials
2. Set authorized redirect URIs:
   - `http://localhost:8080/oauth2/callback/google` (dev)
   - `https://shareshelf-api.up.railway.app/oauth2/callback/google` (prod)
3. Configure OAuth consent screen

### Railway Deployment
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Railway environment variables
- Spring profile `railway` should pick up these env vars automatically

---

## 9. Testing Strategy

### Backend Tests
1. **OAuth2Service tests** — Mock `OAuth2User`, verify user creation, linking, JWT generation
2. **OAuth2 callback endpoint test** — MockMvc with `@WithMockUser` or custom security context
3. **AuthService.login() test** — Verify Google-only users get appropriate error when trying password login
4. **Flyway migration test** — Verify schema changes apply cleanly

### Frontend Tests
1. **GoogleSignInButton** — Renders with correct link, aria-label
2. **AuthDivider** — Renders "or" text
3. **AuthCallbackPage** — Reads params, calls saveAuth, redirects; error state when params missing

---

## 10. Potential Issues & Mitigations

| Issue | Risk | Mitigation |
|-------|------|------------|
| Stateless sessions + OAuth2 | High | Use cookie-based AuthorizationRequestRepository |
| `passwordHash` nullable | Medium | Login endpoint checks authProvider before password verification |
| Auto-link by email | Medium | Only link if email is verified by Google (Google guarantees this) |
| Frontend callback race | Low | Callback page is a simple redirect, no API calls needed |
| Google rate limits | Low | Standard OAuth2 flow, no excessive calls |
| Existing users with same email | Medium | Auto-link preserves existing user data, adds Google identity |

---

## 11. Migration Path

### For Existing Users
- Existing LOCAL users keep working as-is
- If they sign in with Google using the same email, their account gets linked automatically
- `passwordHash` remains set for existing users (they can still use password login)
- `authProvider` defaults to `LOCAL` for existing rows

### For New Google Users
- Created with `authProvider = GOOGLE`, `passwordHash = ""` (empty string, not null)
- Can set a password later from profile settings (future feature, Claude's discretion)

---

## RESEARCH COMPLETE

**Key decisions for planner:**
1. Use `spring-boot-starter-oauth2-client` with `oauth2Login()` in SecurityConfig
2. Cookie-based `AuthorizationRequestRepository` (no sessions)
3. Custom `AuthenticationSuccessHandler` for JWT generation + frontend redirect
4. V13 Flyway migration for `google_id`, `auth_provider`, nullable `passwordHash`
5. New `OAuthService` (or extend `AuthService`) for user creation/linking logic
6. Frontend: GoogleSignInButton, AuthDivider, AuthCallbackPage components
7. Backend tests with MockK, frontend tests with Vitest + RTL
