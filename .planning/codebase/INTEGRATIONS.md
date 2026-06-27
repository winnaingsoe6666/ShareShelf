# External Integrations

**Analysis Date:** 2026-06-13

## APIs & External Services

**Authentication (Internal):**
- **JWT Token Auth** — Custom implementation using `io.jsonwebtoken:jjwt:0.12.6`.
  - SDK/Client: `JwtTokenProvider` at `backend/src/main/kotlin/com/shareshelf/auth/JwtTokenProvider.kt`
  - Auth: `JWT_SECRET` env var (256-bit HMAC-SHA key), `JWT_EXPIRATION_MS` env var (default 86400000ms / 24h)
  - Quality: **Well-integrated**. Uses `Keys.hmacShaKeyFor()` with proper byte encoding. Stateless session management in `SecurityConfig.kt`. Token validation catches all exceptions and returns `false` gracefully.
  - Token lifecycle: Generated on login/register, stored in `localStorage` on frontend as `shareshelf_token`, injected as `Authorization: Bearer <token>` header via Axios interceptor.

**API Documentation:**
- **Springdoc OpenAPI 3** (`springdoc-openapi-starter-webmvc-ui:2.8.5`)
  - Endpoints: `/api-docs` (JSON spec), `/swagger-ui.html` (Swagger UI).
  - Quality: **Well-integrated in dev, disabled in production**. `application-railway.yml` explicitly disables both `springdoc.api-docs.enabled: false` and `springdoc.swagger-ui.enabled: false`. This is correct — no production exposure.

**API Client (Frontend-to-Backend):**
- **Axios 1.7.9** — Singleton instance at `frontend/src/lib/api.ts`.
  - Quality: **Well-integrated**. Request interceptor injects JWT from localStorage. Response interceptor handles 401 by clearing auth and redirecting to `/login`. Base URL uses `NEXT_PUBLIC_API_URL` env var with fallback to `/api`.

## Data Storage

**Databases:**
- **PostgreSQL** — Primary data store.
  - Connection: `jdbc:postgresql://localhost:5432/shareshelf` (dev) / `jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require` (Railway).
  - Client: Spring Data JPA (Hibernate) with `PostgreSQLDialect`.
  - Quality: **Well-integrated**. Hibernate `ddl-auto: validate` ensures schema matches Flyway migrations (safety constraint). HikariCP pool configured in railway profile (max 5, min 2, timeout 30s).
  - Migrations: Flyway, enabled, `baseline-on-migrate: true`. Five migration files exist (`V1` through `V5`):
    - `V1__create_users.sql`
    - `V2__create_categories.sql`
    - `V3__create_items.sql`
    - `V4__create_borrow_requests.sql`
    - `V5__create_reviews.sql`
  - Flyway `clean-disabled: true` in production — prevents accidental data loss.

**File Storage:**
- **Local filesystem only** (dev mode). `app.upload-dir: uploads` in `application.yml`. No cloud storage integration detected (no AWS S3, GCS, or Azure Blob SDK imports). Item model has `imageUrls` field, but the upload mechanism is not fully wired — no file upload controller was found in the source tree.

**Caching:**
- **None** — No Redis, Memcached, or Spring Cache abstraction detected.

## Authentication & Identity

**Auth Provider:**
- **Google OAuth 2.0** — Primary authentication method. Users sign in/up via Google account.
  - Implementation: Spring Security filter chain at `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt`.
  - `CustomUserDetailsService` loads users by email.
  - `JwtAuthenticationFilter` (extends `OncePerRequestFilter`) extracts Bearer token and sets `SecurityContextHolder`.
  - Public endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/verify-email`, `/api/health`, `/api-docs/**`, `/swagger-ui/**`.
  - All other `/api/**` endpoints require authentication.
  - Password hashing: `BCryptPasswordEncoder` (Spring Security) — still used for credential-based registration fallback.
  - Quality: **Well-integrated** — standard Spring Security pattern with stateless sessions, CSRF disabled, CORS enabled.

**Frontend Auth:**
- Local storage based. `frontend/src/lib/auth.ts` saves `shareshelf_token` and `shareshelf_user` to `localStorage`. `clearAuth()` is called on 401 or logout.
- Quality: **Partially integrated** — localStorage is vulnerable to XSS. No HttpOnly cookie option available since the frontend is separate from the backend. Acceptable for an MVP but not production-hardened.

## Monitoring & Observability

**Error Tracking:**
- **None** — No Sentry, DataDog, or similar SDK detected in either backend or frontend dependencies.

**Logging:**
- **Logback** (via Spring Boot starter).
  - Dev profile: `com.shareshelf: DEBUG`, `org.springframework.security: DEBUG`, `org.hibernate.SQL: DEBUG` (`application-dev.yml`).
  - Railway profile: `com.shareshelf: INFO`, `org.springframework.security: WARN`, `org.hibernate.SQL: WARN` (`application-railway.yml`).
  - Quality: **Adequate for development**, but no structured logging (JSON) or log aggregation configured for production.

**Health Check:**
- Endpoint: `GET /api/health` at `backend/src/main/kotlin/com/shareshelf/common/HealthController.kt` — returns `{"status": "UP"}`.
  - Railway uses this for health checks: `healthcheckPath: "/api/health"` with 300s timeout in `railway.json`.
  - Quality: **Basic**. No database connectivity check — a true readiness probe should validate the DB connection pool.

## CI/CD & Deployment

**Hosting:**
- **Backend: Railway** — Docker-based deployment. `railway.json` at project root configures builder as `DOCKERFILE`.
  - Dockerfile: Multi-stage build. Stage 1 uses `gradle:8.12-jdk21` to build the JAR. Stage 2 uses `eclipse-temurin:21-jre-jammy` minimal JRE image. The `railway` Spring profile is activated via `SPRING_PROFILES_ACTIVE=railway` ENV.
  - Quality: **Well-integrated**. Proper multi-stage build (build deps not in runtime). Only the JAR is copied.
- **Frontend: Vercel** — `frontend/vercel.json` configures API rewrites:
  ```json
  { "rewrites": [{ "source": "/api/:path*", "destination": "https://shareshelf-api.up.railway.app/api/:path*" }] }
  ```
  - Quality: **Well-integrated**. Vercel proxies `/api/*` requests to Railway backend, avoiding CORS in production for same-origin requests.

**CI Pipeline:**
- **None detected** — No GitHub Actions workflows, CircleCI config, or GitLab CI file found. Deployments appear to be manual (git push to Railway/Vercel triggers).

## Environment Configuration

**Required env vars:**

| Variable | Where Used | Purpose | Status |
|---|---|---|---|
| `JWT_SECRET` | Backend `application.yml` | JWT signing key (min 256-bit) | Required for prod |
| `PGHOST` | Backend `application-railway.yml` | Railway Postgres host | Railway managed |
| `PGPORT` | Backend `application-railway.yml` | Railway Postgres port | Railway managed |
| `PGDATABASE` | Backend `application-railway.yml` | Railway Postgres database | Railway managed |
| `PGUSER` | Backend `application-railway.yml` | Railway Postgres user | Railway managed |
| `PGPASSWORD` | Backend `application-railway.yml` | Railway Postgres password | Railway managed |
| `PORT` | Backend `application-railway.yml` | Server port (default 8080) | Optional |
| `NEXT_PUBLIC_API_URL` | Frontend `api.ts` | Backend base URL | Required for prod |
| `RESEND_API_KEY` | Backend `EmailService.kt` | Resend API key for sending verification emails | Required for prod |
| `GOOGLE_CLIENT_ID` | Backend `application.yml` | Google OAuth2 client ID | Required |
| `GOOGLE_CLIENT_SECRET` | Backend `application.yml` | Google OAuth2 client secret | Required |

**Secrets location:**
- Railway dashboard (environment variables). No `.env` file committed to repo — correct practice.

## Webhooks & Callbacks

**Incoming:**
- **None detected** — No webhook endpoints found in the source tree.

**Outgoing:**
- **Resend API** — Email verification service. `EmailService` at `backend/src/main/kotlin/com/shareshelf/auth/EmailService.kt` sends verification emails via REST API (`https://api.resend.com/emails`). Uses `RestTemplate` with Bearer token auth. Marked `@Async` for non-blocking execution.
- **Google OAuth** — Frontend redirects users to Google for authentication. Backend validates Google credentials via Spring Security OAuth2 client.

## CORS Configuration

**Configuration file:** `backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt`

**Current settings:**
```kotlin
allowedOrigins = listOf("http://localhost:3000")
allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
allowedHeaders = listOf("*")
exposedHeaders = listOf("Authorization")
allowCredentials = true
```

**Risk: CRITICAL PRODUCTION ISSUE**
The `allowedOrigins` is hardcoded to `http://localhost:3000`. In production:
1. The Vercel frontend runs on a domain like `shareshelf.vercel.app` or a custom domain.
2. API requests from that domain will be **blocked** by CORS.
3. The Vercel rewrite (`vercel.json`) mitigates this for Vercel-deployed frontends (same-origin proxy), but any direct API calls from other origins or local development on non-3000 ports will fail.
4. If the frontend is ever deployed to a custom domain, the rewrite destination URL (`shareshelf-api.up.railway.app`) is hardcoded in `vercel.json` — this is brittle.

**Recommendation:** Read `ALLOWED_ORIGINS` from an environment variable, defaulting to `http://localhost:3000` for local dev. Consider using a comma-separated list or Spring's `allowedOriginPatterns` for wildcard support.

---

*Integration audit: 2026-06-13*
